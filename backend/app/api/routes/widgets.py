from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.widget import WidgetCreate, WidgetUpdate, WidgetResponse
from app.services import dashboard_service
from uuid import UUID

router = APIRouter(tags=["widgets"])


@router.post("/api/dashboard/{dashboard_id}/widgets", response_model=WidgetResponse, status_code=201)
async def add_widget(dashboard_id: UUID, widget_data: WidgetCreate, db: AsyncSession = Depends(get_db)):
    widget = await dashboard_service.add_widget(db, dashboard_id, widget_data)
    if not widget:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return widget


@router.put("/api/widgets/{widget_id}", response_model=WidgetResponse)
async def update_widget(widget_id: UUID, widget_data: WidgetUpdate, db: AsyncSession = Depends(get_db)):
    widget = await dashboard_service.update_widget(db, widget_id, widget_data)
    if not widget:
        raise HTTPException(status_code=404, detail="Widget not found")
    return widget


@router.delete("/api/widgets/{widget_id}", status_code=204)
async def delete_widget(widget_id: UUID, db: AsyncSession = Depends(get_db)):
    success = await dashboard_service.delete_widget(db, widget_id)
    if not success:
        raise HTTPException(status_code=404, detail="Widget not found")
