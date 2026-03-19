import asyncio
import uuid
import random
from datetime import datetime, timedelta

from app.core.database import async_session
from app.models.order import CustomerOrder

def generate_dummy_data():
    first_names = ["James", "Mary", "John", "Patricia", "Robert", "Jennifer", "Michael", "Linda"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]
    cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego"]
    states = ["NY", "CA", "IL", "TX", "AZ", "PA", "TX", "CA"]
    products = ["Laptop Pro", "Wireless Mouse", "Mechanical Keyboard", "Monitor 27-inch", "USB-C Hub", "Headphones"]
    statuses = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"]
    
    orders = []
    
    for _ in range(30):
        first = random.choice(first_names)
        last = random.choice(last_names)
        city_idx = random.randint(0, len(cities) - 1)
        product = random.choice(products)
        quantity = random.randint(1, 5)
        
        unit_price = {
            "Laptop Pro": 1299.99,
            "Wireless Mouse": 49.99,
            "Mechanical Keyboard": 129.99,
            "Monitor 27-inch": 299.99,
            "USB-C Hub": 39.99,
            "Headphones": 199.99
        }[product]

        order_date = datetime.now() - timedelta(days=random.randint(0, 30), hours=random.randint(0, 24))

        orders.append(CustomerOrder(
            id=uuid.uuid4(),
            first_name=first,
            last_name=last,
            email=f"{first.lower()}.{last.lower()}@example.com",
            phone_number=f"555-{random.randint(100, 999)}-{random.randint(1000, 9999)}",
            street_address=f"{random.randint(100, 9999)} Main St",
            city=cities[city_idx],
            state_province=states[city_idx],
            postal_code=f"{random.randint(10000, 99999)}",
            country="USA",
            product=product,
            quantity=quantity,
            unit_price=unit_price,
            status=random.choice(statuses),
            created_by="system_seeder",
            order_date=order_date,
            created_at=order_date,
            updated_at=order_date
        ))
    return orders

async def seed():
    print("Starting database seed...")
    async with async_session() as session:
        try:
            orders = generate_dummy_data()
            session.add_all(orders)
            await session.commit()
            print(f"Successfully inserted {len(orders)} dummy orders.")
        except Exception as e:
            await session.rollback()
            print(f"Failed to seed database: {e}")

if __name__ == "__main__":
    asyncio.run(seed())
