from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
import json

from app.core.config import get_settings
from app.core.database import get_db
from app.services import order_service, dashboard_service
from app.schemas.dashboard import DashboardCreate
from app.schemas.widget import WidgetCreate
from google import genai
from google.genai import types
from google.genai.errors import APIError

router = APIRouter(prefix="/api/ai", tags=["AI"])
settings = get_settings()

raw_keys = [k.strip() for k in settings.GEMINI_API_KEYS.split(',')] if settings.GEMINI_API_KEYS else []
if settings.GEMINI_API_KEY and settings.GEMINI_API_KEY not in raw_keys:
    raw_keys.append(settings.GEMINI_API_KEY)

clients = []
for k in raw_keys:
    if k:
        try:
            clients.append(genai.Client(api_key=k))
        except Exception:
            pass

active_client_idx = 0

def get_current_client():
    if not clients:
        return None
    return clients[active_client_idx]

def rotate_client():
    global active_client_idx
    if clients:
        active_client_idx = (active_client_idx + 1) % len(clients)

def generate_with_fallback(model: str, contents: str, config=None):
    if not clients:
        raise HTTPException(status_code=500, detail="No Gemini API keys configured.")
        
    last_error = None
    # Try as many times as we have keys
    for _ in range(len(clients)):
        client = get_current_client()
        try:
            if config:
                return client.models.generate_content(model=model, contents=contents, config=config)
            else:
                return client.models.generate_content(model=model, contents=contents)
        except APIError as e:
            # 429 Resource Exhausted / Rate Limit
            if e.code == 429:
                rotate_client()
                last_error = e
                continue
            else:
                raise e
        except Exception as e:
            # Broad exception backup, rotate and try next if it's potentially auth/limit related
            if "exhausted" in str(e).lower() or "quota" in str(e).lower() or "429" in str(e):
                rotate_client()
                last_error = e
                continue
            raise e
            
    raise HTTPException(status_code=429, detail=f"All available API keys have exhausted their limits. Last error: {str(last_error)}")

class GenerateWidgetRequest(BaseModel):
    prompt: str

class ChatRequest(BaseModel):
    message: str

class ExplainWidgetRequest(BaseModel):
    title: str
    widget_type: str
    config: Dict[str, Any]

WIDGET_SCHEMA_PROMPT = """
You are an AI that converts a user's natural language request into a Dashboard Widget JSON configuration.
Return ONLY valid JSON matching this structure:
{
  "widget_type": "bar_chart | line_chart | pie_chart | area_chart | scatter_plot | table | kpi",
  "title": "A short descriptive title",
  "grid_x": 0,
  "grid_y": 0,
  "grid_w": 4, 
  "grid_h": 4, 
  "config": {
    "chart_data": "For Pie Charts: the field to group by (e.g. product, country)",
    "x_axis": "For Bar/Line/Area/Scatter Charts: the field to group by on X axis (e.g. order_date, product)",
    "y_axis": "For Bar/Line/Area/Scatter Charts: field to measure on Y axis (e.g. total_amount, quantity)",
    "metric": "For KPI: the field to measure (e.g. total_amount)",
    "aggregation": "sum | avg | count | min | max"
  }
}
The system tracks Customer Orders. Available fields: id, first_name, last_name, email, phone, product, quantity, unit_price, total_amount, status, country, order_date.
"""

@router.post("/generate-widget")
async def generate_widget(request: GenerateWidgetRequest):
    response = generate_with_fallback(
        model='gemini-2.5-flash',
        contents=f"{WIDGET_SCHEMA_PROMPT}\nUser Request: {request.prompt}",
        config=types.GenerateContentConfig(response_mime_type="application/json")
    )
    try:
        data = json.loads(response.text)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse AI response: {str(e)}")


@router.post("/suggest-dashboard")
async def suggest_dashboard(db: AsyncSession = Depends(get_db)):
    prompt = f"""
    You are an AI Dashboard Suggester. The user is starting with an empty dashboard. 
    Design a comprehensive sales overview dashboard representing Customer Orders data.
    Provide exactly 6 distinct widgets mixing different types (kpi, bar_chart, line_chart, area_chart, pie_chart, table).
    Be creative! Use area or line charts to plot trends over order_date, pie charts for categorizations, and tables for raw data.
    Return ONLY a JSON array of widget objects matching the structure below.
    [
      {WIDGET_SCHEMA_PROMPT}
    ]
    STRICT LAYOUT MATH INSTRUCTIONS FOR A 12-COLUMN GRID:
    You MUST calculate exact `grid_x` and `grid_y` coordinates so widgets securely slot perfectly side-by-side without overlapping!
    - Row 1 (y=0): Put 4 KPIs side-by-side. Each gets `grid_w=3`, `grid_h=3`. Their `grid_x` values must be 0, 3, 6, 9.
    - Row 2 (y=3): Put 2 Charts side-by-side. Each gets `grid_w=6`, `grid_h=5`. Their `grid_x` values must be 0, 6.
    - Row 3 (y=8): Put 1 wide Table. Gets `grid_w=12`, `grid_h=5`. `grid_x` must be 0.
    Follow these exact math coordinates so the dashboard perfectly aligns into blocks!
    """
    
    response = generate_with_fallback(
        model='gemini-2.5-flash',
        contents=prompt,
        config=types.GenerateContentConfig(response_mime_type="application/json")
    )
    
    try:
        widgets_data = json.loads(response.text)
        
        layout_config = []
        parsed_widgets = []
        
        for w in widgets_data:
            layout_config.append({
                "i": w["title"],
                "x": w.get("grid_x", 0),
                "y": w.get("grid_y", 0),
                "w": w.get("grid_w", 4),
                "h": w.get("grid_h", 4)
            })
            parsed_widgets.append(WidgetCreate(**w))
            
        dashboard_data = DashboardCreate(
            name="AI Suggested Dashboard",
            layout_config=layout_config,
            widgets=parsed_widgets
        )
            
        layout = await dashboard_service.save_dashboard(db, dashboard_data)
        return {"message": "Dashboard successfully generated", "layout_id": layout.id, "widgets": parsed_widgets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Dashboard generation failed: {str(e)}")


@router.post("/chat")
async def chat_insights(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    # Get lightweight summary of orders (limit 50 to avoid massive token bloat)
    all_orders = await order_service.get_orders(db)
    orders = all_orders[:50]
    
    context_data = []
    for o in orders:
        context_data.append(f"Order #{o.id}: {o.product} x{o.quantity} for ${o.total_amount} ({o.status}) in {o.country}")
        
    context_str = "\n".join(context_data)
    
    prompt = f"""
    You are a professional Data Insights Assistant for a Customer Orders Dashboard. 
    Use the following recent order data context to answer the user's question accurately. Be concise, insightful, and professional.
    
    IMPORTANT: DO NOT use any markdown formatting! Do not use asterisks (*), bold text (**), bullet points, or any special symbols. Reply in plain, readable text only.
    
    [CONTEXT DATA]:
    {context_str}
    
    [USER QUESTION]: {request.message}
    """
    
    response = generate_with_fallback(
        model='gemini-2.5-flash',
        contents=prompt
    )
    
    return {"reply": response.text}

@router.post("/explain")
async def explain_insight(request: ExplainWidgetRequest, db: AsyncSession = Depends(get_db)):
    config = request.config
    metric = config.get("metric") or config.get("y_axis") or (config.get("metrics", [None])[0]) or 'total_amount'
    group_by = config.get("group_by") or config.get("x_axis") or config.get("chart_data") or config.get("dataKey")
    aggregation = config.get("aggregation", "count")
    
    try:
        # Re-run widget's native aggregation query to get exactly what the user is looking at
        agg_data = await order_service.get_aggregate_data(db, metric, aggregation, "all", group_by)
    except Exception as e:
        agg_data = {"error": str(e)}

    # Fetch raw recent orders to get business context
    all_orders = await order_service.get_orders(db)
    orders = all_orders[:75]
    context_data = []
    for o in orders:
        context_data.append(f"Order #{o.id}: {o.product} x{o.quantity} for ${o.total_amount} ({o.status}) in {o.country}")
    context_str = "\n".join(context_data)
    
    prompt = f"""
    You are an expert Root Cause Business Analyst. 
    The user just clicked "Why?" on a dashboard widget titled "{request.title}" (Type: {request.widget_type}).
    
    [WIDGET'S CURRENT DATA]:
    {json.dumps(agg_data, indent=2)}
    
    [RECENT RAW ORDERS (CONTEXT)]:
    {context_str}
    
    Your job is to look at the Widget's Data and correlate it against the Recent Raw Orders to identify WHY the widget numbers look the way they do.
    For example, if sales for Fiber Internet are high, spot the large orders in the raw data and mention them.
    If the widget is a KPI showing total revenue, explain what products or countries contributed most to that total.
    
    Explain the insight in 2 to 3 concise, punchy sentences. Be professional but conversational. Do not output markdown, just plain clear text. Do not mention that you are looking at raw data.
    """
    
    response = generate_with_fallback(
        model='gemini-2.5-flash',
        contents=prompt
    )
    return {"explanation": response.text}
