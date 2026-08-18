import asyncio
import json
from prisma import Prisma
import bcrypt

def get_password_hash(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

async def main():
    db = Prisma()
    await db.connect()
    
    new_password = "password123"
    hashed = get_password_hash(new_password)
    
    user = await db.user.update(
        where={'email': 'isha@gmail.com'},
        data={'password_hash': hashed}
    )
    
    if user:
        print(f"Password reset for {user.email} to: {new_password}")
    else:
        print("User not found.")
        
    await db.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
