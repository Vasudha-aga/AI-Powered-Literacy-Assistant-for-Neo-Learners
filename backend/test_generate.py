import asyncio
from services.llm import generate_personalized_lesson

async def main():
    from database.database import db
    await db.connect()
    
    try:
        res = await generate_personalized_lesson("Machine Learning", "Beginner", 6)
        print("Success:", res)
    except Exception as e:
        import traceback
        traceback.print_exc()
    
    await db.disconnect()

if __name__ == '__main__':
    asyncio.run(main())
