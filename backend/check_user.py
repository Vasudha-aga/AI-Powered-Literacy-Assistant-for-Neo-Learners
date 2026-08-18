import asyncio
import json
from prisma import Prisma

async def main():
    db = Prisma()
    await db.connect()
    user = await db.user.find_unique(where={'email': 'isha@gmail.com'})
    if user:
        print(f"User ID: {user.id}")
        print(f"Email: {user.email}")
        print(f"Password Hash: {user.password_hash}")
    else:
        print("User not found.")
    await db.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
