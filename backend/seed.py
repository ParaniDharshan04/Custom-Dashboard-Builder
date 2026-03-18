import asyncio
import random
from datetime import datetime, timedelta
from app.core.database import async_session
from app.models.order import CustomerOrder
from sqlalchemy.ext.asyncio import AsyncSession

PRODUCTS = [
    {"name": "MacBook Pro 16", "price": 2499},
    {"name": "iPhone 15 Pro", "price": 999},
    {"name": "AirPods Pro", "price": 249},
    {"name": "iPad Air", "price": 599},
    {"name": "Apple Watch Series 9", "price": 399},
    {"name": "Magic Keyboard", "price": 299},
    {"name": "Studio Display", "price": 1599},
]

STATUSES = ["Completed", "Pending", "In progress"]
COUNTRIES = ["USA", "Canada", "UK", "Germany", "France", "Australia", "Japan"]

FIRST_NAMES = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda"]
LAST_NAMES = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]

async def seed_orders():
    async with async_session() as session:
        session: AsyncSession
        print("Starting dummy data generation...")
        
        # Generate 40 dummy orders spread over the last 30 days
        orders = []
        for i in range(40):
            product = random.choice(PRODUCTS)
            qty = random.randint(1, 4)
            status = random.choice(STATUSES)
            
            # Skew more towards completed
            if random.random() > 0.7:
                status = "Pending"
            elif random.random() > 0.8:
                status = "In progress"
            else:
                status = "Completed"
                
            first_name = random.choice(FIRST_NAMES)
            last_name = random.choice(LAST_NAMES)
            
            days_ago = random.randint(0, 30)
            order_date = datetime.utcnow() - timedelta(days=days_ago)

            order = CustomerOrder(
                first_name=first_name,
                last_name=last_name,
                email=f"{first_name.lower()}.{last_name.lower()}@example.com",
                phone_number=f"555-{random.randint(1000, 9999)}",
                street_address=f"{random.randint(100, 9999)} Tech Avenue",
                city="San Francisco",
                state_province="CA",
                postal_code="94105",
                product=product["name"],
                quantity=qty,
                unit_price=product["price"],
                status=status,
                country=random.choice(COUNTRIES),
                created_by="system",
                order_date=order_date
            )
            orders.append(order)
            
        session.add_all(orders)
        await session.commit()
        print(f"Successfully inserted {len(orders)} dummy orders!")


if __name__ == "__main__":
    asyncio.run(seed_orders())
