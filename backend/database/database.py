import sys
import subprocess
from prisma import Prisma

db = Prisma(auto_register=True)

def ensure_prisma_engine():
    try:
        print("Fetching Prisma query engine binaries...")
        subprocess.run([sys.executable, "-m", "prisma", "py", "fetch"], check=True)
        subprocess.run([sys.executable, "-m", "prisma", "generate"], check=True)
        print("Prisma binaries and client generated successfully.")
    except Exception as err:
        print(f"Warning during ensure_prisma_engine: {err}")

def is_db_connected() -> bool:
    global db
    if db is None:
        return False
    engine = getattr(db, "_internal_engine", None)
    return engine is not None and getattr(engine, "url", None) is not None

async def connect_db():
    global db
    if is_db_connected():
        return db
    
    if db is not None:
        try:
            await db.disconnect()
        except Exception:
            pass
        db._internal_engine = None

    try:
        db = Prisma(auto_register=True)
        await db.connect()
        print("Successfully connected to Prisma DB")
        return db
    except Exception as e:
        print(f"Prisma DB connect warning: {e}. Attempting auto-fetch engine binaries...")
        try:
            ensure_prisma_engine()
            db = Prisma(auto_register=True)
            await db.connect()
            print("Successfully connected to Prisma DB after binary setup")
            return db
        except Exception as retry_err:
            print(f"Failed to connect after retry: {retry_err}")
            raise retry_err

async def disconnect_db():
    global db
    if db is not None and is_db_connected():
        try:
            await db.disconnect()
        except Exception as e:
            print(f"Prisma DB disconnect warning: {e}")

def get_db():
    global db
    if db is None:
        db = Prisma(auto_register=True)
    return db


