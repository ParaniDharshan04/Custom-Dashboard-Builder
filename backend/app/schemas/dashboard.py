from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID
from app.schemas.widget import WidgetResponse, WidgetCreate


class DashboardCreate(BaseModel):
    name: str = Field(default="My Dashboard", max_length=100)
    layout_config: List[Any] = Field(default_factory=list)
    widgets: List[WidgetCreate] = Field(default_factory=list)


class DashboardUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    layout_config: Optional[List[Any]] = None


class LayoutPositionUpdate(BaseModel):
    widget_id: UUID
    grid_x: int = Field(ge=0)
    grid_y: int = Field(ge=0)
    grid_w: int = Field(ge=1)
    grid_h: int = Field(ge=1)


class BulkLayoutUpdate(BaseModel):
    positions: List[LayoutPositionUpdate]


class DashboardResponse(BaseModel):
    id: UUID
    name: str
    layout_config: List[Any]
    widgets: List[WidgetResponse] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
