from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services import order_service
import json

router = APIRouter(prefix="/api/data", tags=["data"])


@router.get("/aggregate")
async def get_aggregate(
    metric: str = Query(...),
    aggregation: str = Query("count", pattern="^(sum|avg|count|min|max)$"),
    date_range: str = Query("all", pattern="^(all|today|last_7|last_30|last_90)$"),
    group_by: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    result = await order_service.get_aggregate_data(db, metric, aggregation, date_range, group_by)
    return result


@router.get("/table")
async def get_table(
    columns: str = Query("id,first_name,last_name,product,quantity,unit_price,total_amount,status,created_by,order_date"),
    sort_by: str = Query("order_date"),
    sort_dir: str = Query("desc", pattern="^(asc|desc)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    date_range: str = Query("all", pattern="^(all|today|last_7|last_30|last_90)$"),
    filters: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    column_list = [c.strip() for c in columns.split(",") if c.strip()]
    filter_list = []
    if filters:
        try:
            filter_list = json.loads(filters)
        except json.JSONDecodeError:
            filter_list = []
    result = await order_service.get_table_data(
        db, column_list, sort_by, sort_dir, page, page_size, date_range, filter_list
    )
    return result
