import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, DateTime, text, Computed
from sqlalchemy.dialects.postgresql import UUID
from app.core.database import Base


class CustomerOrder(Base):
    __tablename__ = "customer_orders"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=text("gen_random_uuid()"))
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False)
    phone_number = Column(String(30), nullable=False)
    street_address = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False)
    state_province = Column(String(100), nullable=False)
    postal_code = Column(String(20), nullable=False)
    country = Column(String(50), nullable=False)
    product = Column(String(100), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(12, 2), nullable=False)
    total_amount = Column(Numeric(12, 2), Computed("quantity * unit_price", persisted=True))
    status = Column(String(20), nullable=False, default="Pending", server_default="Pending")
    created_by = Column(String(100), nullable=False)
    order_date = Column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"))
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"))
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=text("NOW()"), onupdate=datetime.utcnow)
