from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum


class CountryEnum(str, Enum):
    US = "US"
    Canada = "Canada"
    Australia = "Australia"
    Singapore = "Singapore"
    HongKong = "HongKong"


class ProductEnum(str, Enum):
    FIBER_300 = "Fiber Internet 300 Mbps"
    MOBILE_5G = "5G Unlimited Mobile Plan"
    FIBER_1G = "Fiber Internet 1 Gbps"
    BIZ_500 = "Business Internet 500 Mbps"
    VOIP = "VoIP Corporate Package"


class StatusEnum(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In progress"
    COMPLETED = "Completed"


class CreatedByEnum(str, Enum):
    MICHAEL = "Mr. Michael Harris"
    RYAN = "Mr. Ryan Cooper"
    OLIVIA = "Ms. Olivia Carter"
    LUCAS = "Mr. Lucas Martin"


class OrderCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., min_length=1, max_length=255)
    phone_number: str = Field(..., min_length=1, max_length=30)
    street_address: str = Field(..., min_length=1, max_length=255)
    city: str = Field(..., min_length=1, max_length=100)
    state_province: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=1, max_length=20)
    country: CountryEnum
    product: ProductEnum
    quantity: int = Field(default=1, ge=1)
    unit_price: float = Field(..., gt=0)
    status: StatusEnum = StatusEnum.PENDING
    created_by: CreatedByEnum
    order_date: Optional[datetime] = None


class OrderUpdate(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, min_length=1, max_length=255)
    phone_number: Optional[str] = Field(None, min_length=1, max_length=30)
    street_address: Optional[str] = Field(None, min_length=1, max_length=255)
    city: Optional[str] = Field(None, min_length=1, max_length=100)
    state_province: Optional[str] = Field(None, min_length=1, max_length=100)
    postal_code: Optional[str] = Field(None, min_length=1, max_length=20)
    country: Optional[CountryEnum] = None
    product: Optional[ProductEnum] = None
    quantity: Optional[int] = Field(None, ge=1)
    unit_price: Optional[float] = Field(None, gt=0)
    status: Optional[StatusEnum] = None
    created_by: Optional[CreatedByEnum] = None
    order_date: Optional[datetime] = None


class OrderResponse(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: str
    phone_number: str
    street_address: str
    city: str
    state_province: str
    postal_code: str
    country: str
    product: str
    quantity: int
    unit_price: float
    total_amount: float
    status: str
    created_by: str
    order_date: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
