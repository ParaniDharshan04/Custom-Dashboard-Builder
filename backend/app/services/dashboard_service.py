from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.models.dashboard import DashboardLayout
from app.models.widget import Widget
from app.schemas.dashboard import DashboardCreate, DashboardUpdate, BulkLayoutUpdate
from app.schemas.widget import WidgetCreate, WidgetUpdate
from uuid import UUID
from typing import Optional, List


async def get_dashboard(db: AsyncSession) -> Optional[DashboardLayout]:
    result = await db.execute(
        select(DashboardLayout)
        .options(selectinload(DashboardLayout.widgets))
        .order_by(DashboardLayout.updated_at.desc())
        .limit(1)
    )
    return result.scalar_one_or_none()


async def save_dashboard(db: AsyncSession, data: DashboardCreate) -> DashboardLayout:
    # Check if dashboard exists, upsert
    existing = await get_dashboard(db)
    if existing:
        existing.name = data.name
        existing.layout_config = data.layout_config
        # Remove old widgets
        for w in existing.widgets:
            await db.delete(w)
        await db.flush()
        # Add new widgets
        for widget_data in data.widgets:
            widget_dict = widget_data.model_dump()
            widget = Widget(**widget_dict, dashboard_id=existing.id)
            db.add(widget)
        await db.flush()
        await db.refresh(existing)
        # Reload with widgets
        result = await db.execute(
            select(DashboardLayout)
            .options(selectinload(DashboardLayout.widgets))
            .where(DashboardLayout.id == existing.id)
        )
        return result.scalar_one()
    else:
        dashboard = DashboardLayout(
            name=data.name,
            layout_config=data.layout_config,
        )
        db.add(dashboard)
        await db.flush()
        for widget_data in data.widgets:
            widget_dict = widget_data.model_dump()
            widget = Widget(**widget_dict, dashboard_id=dashboard.id)
            db.add(widget)
        await db.flush()
        await db.refresh(dashboard)
        result = await db.execute(
            select(DashboardLayout)
            .options(selectinload(DashboardLayout.widgets))
            .where(DashboardLayout.id == dashboard.id)
        )
        return result.scalar_one()


async def delete_dashboard(db: AsyncSession, dashboard_id: UUID) -> bool:
    result = await db.execute(
        select(DashboardLayout).where(DashboardLayout.id == dashboard_id)
    )
    dashboard = result.scalar_one_or_none()
    if not dashboard:
        return False
    await db.delete(dashboard)
    await db.flush()
    return True


async def add_widget(db: AsyncSession, dashboard_id: UUID, widget_data: WidgetCreate) -> Optional[Widget]:
    result = await db.execute(
        select(DashboardLayout).where(DashboardLayout.id == dashboard_id)
    )
    dashboard = result.scalar_one_or_none()
    if not dashboard:
        return None
    widget_dict = widget_data.model_dump()
    widget = Widget(**widget_dict, dashboard_id=dashboard_id)
    db.add(widget)
    await db.flush()
    await db.refresh(widget)
    return widget


async def update_widget(db: AsyncSession, widget_id: UUID, widget_data: WidgetUpdate) -> Optional[Widget]:
    result = await db.execute(select(Widget).where(Widget.id == widget_id))
    widget = result.scalar_one_or_none()
    if not widget:
        return None
    update_data = widget_data.model_dump(exclude_none=True)
    for key, value in update_data.items():
        setattr(widget, key, value)
    await db.flush()
    await db.refresh(widget)
    return widget


async def delete_widget(db: AsyncSession, widget_id: UUID) -> bool:
    result = await db.execute(select(Widget).where(Widget.id == widget_id))
    widget = result.scalar_one_or_none()
    if not widget:
        return False
    await db.delete(widget)
    await db.flush()
    return True


async def update_layout_positions(db: AsyncSession, dashboard_id: UUID, data: BulkLayoutUpdate) -> bool:
    result = await db.execute(
        select(DashboardLayout).where(DashboardLayout.id == dashboard_id)
    )
    dashboard = result.scalar_one_or_none()
    if not dashboard:
        return False
    for pos in data.positions:
        widget_result = await db.execute(
            select(Widget).where(Widget.id == pos.widget_id, Widget.dashboard_id == dashboard_id)
        )
        widget = widget_result.scalar_one_or_none()
        if widget:
            widget.grid_x = pos.grid_x
            widget.grid_y = pos.grid_y
            widget.grid_w = pos.grid_w
            widget.grid_h = pos.grid_h
    await db.flush()
    return True
