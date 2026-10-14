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

async def connect_db():
    try:
        if not db.is_connected():
            await db.connect()
            print("Successfully connected to Prisma DB")
    except Exception as e:
        print(f"Prisma DB connect warning: {e}. Attempting auto-fetch engine binaries...")
        try:
            ensure_prisma_engine()
            if not db.is_connected():
                await db.connect()
                print("Successfully connected to Prisma DB after binary setup")
                return
        except Exception as retry_err:
            print(f"Failed to connect after retry: {retry_err}")
            try:
                await db.disconnect()
            except Exception:
                pass
            raise retry_err



async def disconnect_db():
    try:
        if db.is_connected():
            await db.disconnect()
    except Exception as e:
        print(f"Prisma DB disconnect warning: {e}")

def get_db():
    return db
