from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.dashboard import DashboardCreate, DashboardResponse, BulkLayoutUpdate
from app.services import dashboard_service
from uuid import UUID

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("", response_model=Optional[DashboardResponse])
async def get_dashboard(db: AsyncSession = Depends(get_db)):
    dashboard = await dashboard_service.get_dashboard(db)
    return dashboard


@router.post("", response_model=DashboardResponse, status_code=201)
async def save_dashboard(data: DashboardCreate, db: AsyncSession = Depends(get_db)):
    dashboard = await dashboard_service.save_dashboard(db, data)
    return dashboard


@router.delete("/{dashboard_id}", status_code=204)
async def delete_dashboard(dashboard_id: UUID, db: AsyncSession = Depends(get_db)):
    success = await dashboard_service.delete_dashboard(db, dashboard_id)
    if not success:
        raise HTTPException(status_code=404, detail="Dashboard not found")


@router.put("/{dashboard_id}/layout", status_code=200)
async def update_layout(dashboard_id: UUID, data: BulkLayoutUpdate, db: AsyncSession = Depends(get_db)):
    success = await dashboard_service.update_layout_positions(db, dashboard_id, data)
    if not success:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return {"detail": "Layout updated"}
