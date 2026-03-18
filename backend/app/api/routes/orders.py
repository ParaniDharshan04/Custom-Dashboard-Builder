from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.schemas.order import OrderCreate, OrderUpdate, OrderResponse
from app.services import order_service
from uuid import UUID

router = APIRouter(prefix="/api/orders", tags=["orders"])


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(order_data: OrderCreate, db: AsyncSession = Depends(get_db)):
    order = await order_service.create_order(db, order_data)
    return order


@router.get("", response_model=List[OrderResponse])
async def list_orders(
    date_range: str = Query("all", pattern="^(all|today|last_7|last_30|last_90)$"),
    db: AsyncSession = Depends(get_db),
):
    orders = await order_service.get_orders(db, date_range)
    return orders


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: UUID, db: AsyncSession = Depends(get_db)):
    order = await order_service.get_order(db, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.put("/{order_id}", response_model=OrderResponse)
async def update_order(order_id: UUID, order_data: OrderUpdate, db: AsyncSession = Depends(get_db)):
    order = await order_service.update_order(db, order_id, order_data)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.delete("/{order_id}", status_code=204)
async def delete_order(order_id: UUID, db: AsyncSession = Depends(get_db)):
    success = await order_service.delete_order(db, order_id)
    if not success:
        raise HTTPException(status_code=404, detail="Order not found")
