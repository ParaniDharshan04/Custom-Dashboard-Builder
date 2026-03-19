from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
import json
import random

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
    # --- Randomized variety pools ---
    THEMES = [
        {
            "name": "Revenue Deep Dive",
            "focus": "Focus on revenue, total sales amounts, and financial performance metrics.",
            "kpi_metrics": ["total_amount", "unit_price", "quantity"],
            "kpi_aggs": ["sum", "avg", "count"],
            "chart_x": ["product", "country", "order_date"],
            "chart_y": "total_amount",
            "pie_field": "product",
        },
        {
            "name": "Order Volume Analysis",
            "focus": "Focus on order volumes, quantities, and order counts across dimensions.",
            "kpi_metrics": ["quantity", "total_amount", "unit_price"],
            "kpi_aggs": ["sum", "count", "avg"],
            "chart_x": ["status", "country", "order_date"],
            "chart_y": "quantity",
            "pie_field": "status",
        },
        {
            "name": "Geographic Performance",
            "focus": "Focus on sales performance by country and region, highlighting top performing areas.",
            "kpi_metrics": ["total_amount", "quantity", "unit_price"],
            "kpi_aggs": ["sum", "count", "avg"],
            "chart_x": ["country", "product", "order_date"],
            "chart_y": "total_amount",
            "pie_field": "country",
        },
        {
            "name": "Product Performance",
            "focus": "Focus on product-level breakdowns, bestsellers, and category comparisons.",
            "kpi_metrics": ["total_amount", "quantity", "unit_price"],
            "kpi_aggs": ["sum", "avg", "max"],
            "chart_x": ["product", "status", "country"],
            "chart_y": "quantity",
            "pie_field": "product",
        },
        {
            "name": "Operational Status Tracker",
            "focus": "Focus on order statuses, fulfillment rates, and operational efficiency.",
            "kpi_metrics": ["quantity", "total_amount", "unit_price"],
            "kpi_aggs": ["count", "sum", "avg"],
            "chart_x": ["status", "product", "country"],
            "chart_y": "quantity",
            "pie_field": "status",
        },
        {
            "name": "Trend & Time Analysis",
            "focus": "Focus on time-based trends, month-over-month changes, and sales evolution over order_date.",
            "kpi_metrics": ["total_amount", "quantity", "unit_price"],
            "kpi_aggs": ["sum", "avg", "count"],
            "chart_x": ["order_date", "product", "country"],
            "chart_y": "total_amount",
            "pie_field": "country",
        },
    ]

    LAYOUT_PATTERNS = [
        {
            "label": "4 KPIs top, 2 charts middle, 1 table bottom",
            "instructions": (
                "Row 1 (y=0): 4 KPI widgets side-by-side. Each: grid_w=3, grid_h=3. grid_x values: 0, 3, 6, 9.\n"
                "Row 2 (y=3): 2 chart widgets side-by-side. Each: grid_w=6, grid_h=5. grid_x values: 0, 6.\n"
                "Row 3 (y=8): 1 table widget spanning full width. grid_w=12, grid_h=5. grid_x=0."
            ),
            "counts": {"kpi": 4, "charts": 2, "table": 1},
        },
        {
            "label": "3 KPIs top, 3 charts below, no table",
            "instructions": (
                "Row 1 (y=0): 3 KPI widgets side-by-side. Each: grid_w=4, grid_h=3. grid_x values: 0, 4, 8.\n"
                "Row 2 (y=3): 3 chart widgets side-by-side. Each: grid_w=4, grid_h=5. grid_x values: 0, 4, 8."
            ),
            "counts": {"kpi": 3, "charts": 3, "table": 0},
        },
        {
            "label": "2 KPIs top, 1 wide chart, 1 wide chart, 1 table",
            "instructions": (
                "Row 1 (y=0): 2 KPI widgets side-by-side. Each: grid_w=6, grid_h=3. grid_x values: 0, 6.\n"
                "Row 2 (y=3): 1 wide chart. grid_w=12, grid_h=5. grid_x=0.\n"
                "Row 3 (y=8): 1 chart on left and 1 table on right. Chart: grid_w=5, grid_h=5, grid_x=0. Table: grid_w=7, grid_h=5, grid_x=5."
            ),
            "counts": {"kpi": 2, "charts": 2, "table": 1},
        },
        {
            "label": "3 KPIs top, 2 charts, 1 table bottom",
            "instructions": (
                "Row 1 (y=0): 3 KPI widgets side-by-side. Each: grid_w=4, grid_h=3. grid_x values: 0, 4, 8.\n"
                "Row 2 (y=3): 2 charts side-by-side. Left: grid_w=7, grid_h=5, grid_x=0. Right: grid_w=5, grid_h=5, grid_x=7.\n"
                "Row 3 (y=8): 1 table spanning full width. grid_w=12, grid_h=5. grid_x=0."
            ),
            "counts": {"kpi": 3, "charts": 2, "table": 1},
        },
    ]

    CHART_TYPES = ["bar_chart", "line_chart", "pie_chart", "area_chart", "scatter_plot"]

    theme = random.choice(THEMES)
    layout = random.choice(LAYOUT_PATTERNS)
    chart_picks = random.sample(CHART_TYPES, min(3, len(CHART_TYPES)))
    chart_x_choices = ", ".join(random.sample(theme["chart_x"], min(len(theme["chart_x"]), 2)))
    kpi_agg_choices = ", ".join(theme["kpi_aggs"])

    prompt = f"""
    You are an AI Dashboard Suggester. The user wants a fresh, unique dashboard for Customer Orders data.

    THEME THIS TIME: "{theme["name"]}" — {theme["focus"]}

    LAYOUT THIS TIME: {layout["label"]}
    Exact widget positions:
    {layout["instructions"]}

    Return ONLY a JSON array of {sum(layout["counts"].values())} widget objects. Each widget must use this structure:
    [{WIDGET_SCHEMA_PROMPT}]

    IMPORTANT VARIETY RULES (follow closely!):
    - KPI widgets: Use these metrics creatively: {", ".join(theme["kpi_metrics"])}. Use these aggregations: {kpi_agg_choices}. Each KPI should measure something DIFFERENT.
    - Chart widgets: Use a creative mix of these types: {", ".join(chart_picks)}. X-axis options: {chart_x_choices}. Y-axis: {theme["chart_y"]}.
    - Pie chart: group by "{theme["pie_field"]}" field.
    - Table widget (if included): show raw data with columns first_name, product, total_amount, status, country.
    - ALL widget titles must be descriptive and UNIQUE reflecting the theme "{theme["name"]}".
    - Do NOT repeat the same widget_type+config combination.

    Strictly honor the grid coordinates from the layout instructions above so widgets align without gaps or overlaps!
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
            name=f"AI Dashboard — {theme['name']}",
            layout_config=layout_config,
            widgets=parsed_widgets
        )

        layout_obj = await dashboard_service.save_dashboard(db, dashboard_data)
        return {"message": "Dashboard successfully generated", "layout_id": layout_obj.id, "widgets": parsed_widgets}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Dashboard generation failed: {str(e)}")


@router.post("/chat")
async def chat_insights(request: ChatRequest, db: AsyncSession = Depends(get_db)):
    # Get lightweight summary of orders (limit 30 to avoid massive token bloat and speed up AI)
    from sqlalchemy import select
    from app.models.order import CustomerOrder
    result = await db.execute(select(CustomerOrder).order_by(CustomerOrder.order_date.desc()).limit(30))
    orders = result.scalars().all()
    
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

    # Fetch raw recent orders to get business context (limit 30 for speed)
    from sqlalchemy import select
    from app.models.order import CustomerOrder
    result = await db.execute(select(CustomerOrder).order_by(CustomerOrder.order_date.desc()).limit(30))
    orders = result.scalars().all()
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
