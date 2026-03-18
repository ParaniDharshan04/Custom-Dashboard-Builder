import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base


class Widget(Base):
    __tablename__ = "widgets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    dashboard_id = Column(UUID(as_uuid=True), ForeignKey("dashboard_layouts.id", ondelete="CASCADE"), nullable=False)
    widget_type = Column(String(30), nullable=False)
    title = Column(String(100), nullable=False, default="Untitled", server_default="Untitled")
    description = Column(Text, nullable=True)
    config = Column(JSONB, nullable=False, default=dict, server_default=text("'{}'::jsonb"))
    grid_x = Column(Integer, nullable=False, default=0)
    grid_y = Column(Integer, nullable=False, default=0)
    grid_w = Column(Integer, nullable=False, default=4)
    grid_h = Column(Integer, nullable=False, default=4)
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"), onupdate=datetime.utcnow)

    dashboard = relationship("DashboardLayout", back_populates="widgets")
