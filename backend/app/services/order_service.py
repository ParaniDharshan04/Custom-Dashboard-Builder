from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, func, cast, Float, String as SAString, case, extract
from sqlalchemy.sql import text
from app.models.order import CustomerOrder
from app.schemas.order import OrderCreate, OrderUpdate
from uuid import UUID
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Any


def _apply_date_filter(query, date_range: str):
    now = datetime.now(timezone.utc)
    if date_range == "today":
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        query = query.where(CustomerOrder.order_date >= start)
    elif date_range == "last_7":
        query = query.where(CustomerOrder.order_date >= now - timedelta(days=7))
    elif date_range == "last_30":
        query = query.where(CustomerOrder.order_date >= now - timedelta(days=30))
    elif date_range == "last_90":
        query = query.where(CustomerOrder.order_date >= now - timedelta(days=90))
    return query


COLUMN_MAP = {
    "id": CustomerOrder.id,
    "first_name": CustomerOrder.first_name,
    "last_name": CustomerOrder.last_name,
    "email": CustomerOrder.email,
    "phone_number": CustomerOrder.phone_number,
    "street_address": CustomerOrder.street_address,
    "city": CustomerOrder.city,
    "state_province": CustomerOrder.state_province,
    "postal_code": CustomerOrder.postal_code,
    "country": CustomerOrder.country,
    "product": CustomerOrder.product,
    "quantity": CustomerOrder.quantity,
    "unit_price": CustomerOrder.unit_price,
    "total_amount": CustomerOrder.total_amount,
    "status": CustomerOrder.status,
    "created_by": CustomerOrder.created_by,
    "order_date": CustomerOrder.order_date,
    "created_at": CustomerOrder.created_at,
    "updated_at": CustomerOrder.updated_at,
}

NUMERIC_FIELDS = {"quantity", "unit_price", "total_amount"}


async def create_order(db: AsyncSession, order_data: OrderCreate) -> CustomerOrder:
    data = order_data.model_dump(exclude_none=True)
    # Convert enums to values
    for key in ["country", "product", "status", "created_by"]:
        if key in data and hasattr(data[key], "value"):
            data[key] = data[key].value
    order = CustomerOrder(**data)
    db.add(order)
    await db.flush()
    await db.refresh(order)
    return order


async def get_orders(db: AsyncSession, date_range: str = "all") -> List[CustomerOrder]:
    query = select(CustomerOrder).order_by(CustomerOrder.order_date.desc())
    query = _apply_date_filter(query, date_range)
    result = await db.execute(query)
    return result.scalars().all()


async def get_order(db: AsyncSession, order_id: UUID) -> Optional[CustomerOrder]:
    result = await db.execute(select(CustomerOrder).where(CustomerOrder.id == order_id))
    return result.scalar_one_or_none()


async def update_order(db: AsyncSession, order_id: UUID, order_data: OrderUpdate) -> Optional[CustomerOrder]:
    order = await get_order(db, order_id)
    if not order:
        return None
    update_data = order_data.model_dump(exclude_none=True)
    for key in ["country", "product", "status", "created_by"]:
        if key in update_data and hasattr(update_data[key], "value"):
            update_data[key] = update_data[key].value
    for key, value in update_data.items():
        if key != "total_amount":
            setattr(order, key, value)
    await db.flush()
    await db.refresh(order)
    return order


async def delete_order(db: AsyncSession, order_id: UUID) -> bool:
    order = await get_order(db, order_id)
    if not order:
        return False
    await db.delete(order)
    await db.flush()
    return True


async def get_aggregate_data(
    db: AsyncSession,
    metric: str,
    aggregation: str = "count",
    date_range: str = "all",
    group_by: Optional[str] = None,
):
    metric_col = COLUMN_MAP.get(metric)
    if metric_col is None:
        return {"labels": [], "values": [], "total": 0}

    is_numeric = metric in NUMERIC_FIELDS

    if group_by and group_by in COLUMN_MAP:
        group_col = COLUMN_MAP[group_by]

        if aggregation == "sum" and is_numeric:
            agg_func = func.coalesce(func.sum(cast(metric_col, Float)), 0)
        elif aggregation == "avg" and is_numeric:
            agg_func = func.coalesce(func.avg(cast(metric_col, Float)), 0)
        elif aggregation == "min" and is_numeric:
            agg_func = func.min(cast(metric_col, Float))
        elif aggregation == "max" and is_numeric:
            agg_func = func.max(cast(metric_col, Float))
        else:
            agg_func = func.count(metric_col)

        query = select(cast(group_col, SAString).label("group_label"), agg_func.label("value")).group_by(group_col)
        query = _apply_date_filter(query, date_range)
        result = await db.execute(query)
        rows = result.all()

        labels = [str(r.group_label) for r in rows]
        values = [float(r.value) for r in rows]
        total = sum(values)

        return {"labels": labels, "values": values, "total": round(total, 2)}
    else:
        if aggregation == "sum" and is_numeric:
            agg_func = func.coalesce(func.sum(cast(metric_col, Float)), 0)
        elif aggregation == "avg" and is_numeric:
            agg_func = func.coalesce(func.avg(cast(metric_col, Float)), 0)
        elif aggregation == "min" and is_numeric:
            agg_func = func.min(cast(metric_col, Float))
        elif aggregation == "max" and is_numeric:
            agg_func = func.max(cast(metric_col, Float))
        else:
            agg_func = func.count(metric_col)

        query = select(agg_func.label("value"))
        query = _apply_date_filter(query, date_range)
        result = await db.execute(query)
        row = result.one()
        val = float(row.value)

        return {"labels": [], "values": [val], "total": round(val, 2)}


async def get_table_data(
    db: AsyncSession,
    columns: List[str],
    sort_by: str = "order_date",
    sort_dir: str = "desc",
    page: int = 1,
    page_size: int = 10,
    date_range: str = "all",
    filters: Optional[List[dict]] = None,
):
    # Build base query
    query = select(CustomerOrder)
    query = _apply_date_filter(query, date_range)

    # Apply filters
    if filters:
        for f in filters:
            field = f.get("field")
            operator = f.get("operator")
            value = f.get("value")
            col = COLUMN_MAP.get(field)
            if col is None:
                continue
            if operator == "equals":
                query = query.where(cast(col, SAString) == str(value))
            elif operator == "not equals":
                query = query.where(cast(col, SAString) != str(value))
            elif operator == "contains":
                query = query.where(cast(col, SAString).ilike(f"%{value}%"))
            elif operator == "greater than":
                try:
                    query = query.where(cast(col, Float) > float(value))
                except (ValueError, TypeError):
                    pass
            elif operator == "less than":
                try:
                    query = query.where(cast(col, Float) < float(value))
                except (ValueError, TypeError):
                    pass

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()

    # Sort
    sort_column = COLUMN_MAP.get(sort_by, CustomerOrder.order_date)
    if sort_dir == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    # Paginate
    offset = (page - 1) * page_size
    query = query.offset(offset).limit(page_size)

    result = await db.execute(query)
    orders = result.scalars().all()

    # Build row dicts with only requested columns
    rows = []
    for order in orders:
        row = {}
        for col_name in columns:
            val = getattr(order, col_name, None)
            if val is None and col_name == "customer_name":
                val = f"{order.first_name} {order.last_name}"
            elif val is None and col_name == "address":
                val = f"{order.street_address}, {order.city}, {order.state_province} {order.postal_code}"
            if hasattr(val, "isoformat"):
                val = val.isoformat()
            elif isinstance(val, UUID):
                val = str(val)
            else:
                val = val if val is not None else ""
            row[col_name] = val
        rows.append(row)

    return {"rows": rows, "total": total, "page": page, "page_size": page_size}

