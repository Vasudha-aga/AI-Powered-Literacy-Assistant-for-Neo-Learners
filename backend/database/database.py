from prisma import Prisma

db = Prisma(auto_register=True)

async def connect_db():
    try:
        if not db.is_connected():
            await db.connect()
            print("Successfully connected to Prisma DB")
    except Exception as e:
        print(f"Prisma DB connect warning: {e}")

async def disconnect_db():
    try:
        if db.is_connected():
            await db.disconnect()
    except Exception as e:
        print(f"Prisma DB disconnect warning: {e}")

def get_db():
    return db
