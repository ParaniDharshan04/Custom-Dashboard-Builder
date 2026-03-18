from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from uuid import UUID


class WidgetCreate(BaseModel):
    widget_type: str = Field(..., min_length=1, max_length=30)
    title: str = Field(default="Untitled", max_length=100)
    description: Optional[str] = None
    config: dict = Field(default_factory=dict)
    grid_x: int = Field(default=0, ge=0)
    grid_y: int = Field(default=0, ge=0)
    grid_w: int = Field(default=4, ge=1)
    grid_h: int = Field(default=4, ge=1)


class WidgetUpdate(BaseModel):
    widget_type: Optional[str] = Field(None, max_length=30)
    title: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    config: Optional[dict] = None
    grid_x: Optional[int] = Field(None, ge=0)
    grid_y: Optional[int] = Field(None, ge=0)
    grid_w: Optional[int] = Field(None, ge=1)
    grid_h: Optional[int] = Field(None, ge=1)


class WidgetResponse(BaseModel):
    id: UUID
    dashboard_id: UUID
    widget_type: str
    title: str
    description: Optional[str]
    config: dict
    grid_x: int
    grid_y: int
    grid_w: int
    grid_h: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
