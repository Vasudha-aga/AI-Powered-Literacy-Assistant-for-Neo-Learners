import asyncio
import json
from typing import Any, cast
from prisma import Prisma

async def main():
    db = Prisma()
    await db.connect()
    
    print("Seeding curriculum...")
    
    lessons = [
        {
            "language": "English",
            "level": "Beginner",
            "category": "Everyday Life",
            "title": "Reading a Bus Schedule",
            "content": "A bus schedule tells you when the bus will arrive and depart. Look for the time and the bus stop name. AM means morning, and PM means afternoon or evening.\n\nExample:\nStop A: 8:00 AM\nStop B: 8:15 AM\nStop C: 8:30 AM",
            "duration": 5,
            "is_custom": False,
            "quiz": [
                {
                    "question": "What does AM mean on a schedule?",
                    "options": ["Morning", "Afternoon", "Night", "Tomorrow"],
                    "correct_answer": "Morning"
                },
                {
                    "question": "If the bus leaves Stop A at 8:00 AM, when is it at Stop B?",
                    "options": ["8:00 AM", "8:15 AM", "8:30 AM", "9:00 AM"],
                    "correct_answer": "8:15 AM"
                }
            ]
        },
        {
            "language": "English",
            "level": "Intermediate",
            "category": "Workplace",
            "title": "Writing a Professional Email",
            "content": "A professional email should be clear and polite. Always start with a greeting like 'Dear [Name]' or 'Hello [Name]'. Keep the body of the email concise and to the point. End with a sign-off like 'Best regards' or 'Sincerely', followed by your name.",
            "duration": 10,
            "is_custom": False,
            "quiz": [
                {
                    "question": "Which of the following is a good greeting for a professional email?",
                    "options": ["Hey there!", "Dear Mr. Smith,", "What's up?", "Yo!"],
                    "correct_answer": "Dear Mr. Smith,"
                },
                {
                    "question": "How should you end a professional email?",
                    "options": ["See ya", "Best regards,", "Bye", "Later"],
                    "correct_answer": "Best regards,"
                }
            ]
        },
        {
            "language": "English",
            "level": "Advanced",
            "category": "Financial Literacy",
            "title": "Understanding Interest Rates",
            "content": "An interest rate is the cost of borrowing money, or the reward for saving it. It is calculated as a percentage of the amount borrowed or saved. If you borrow money, a lower interest rate is better. If you save money, a higher interest rate gives you more return.",
            "duration": 15,
            "is_custom": False,
            "quiz": [
                {
                    "question": "When saving money in a bank, do you want a high or low interest rate?",
                    "options": ["High", "Low", "It doesn't matter", "Zero"],
                    "correct_answer": "High"
                },
                {
                    "question": "What is an interest rate usually expressed as?",
                    "options": ["A fraction", "A decimal", "A percentage", "A whole number"],
                    "correct_answer": "A percentage"
                }
            ]
        }
    ]
    
    count = 0
    for lesson in lessons:
        # Check if already exists to prevent duplicates on multiple runs
        title = str(lesson.get("title", ""))
        existing = await db.curriculum.find_first(where=cast(Any, {"title": title}))
        if not existing:
            quiz_data = cast(list, lesson.pop("quiz", []))
            created = await db.curriculum.create(data=cast(Any, lesson))
            if created:
                for q in quiz_data:
                    await db.quiz.create(data=cast(Any, {
                        "lesson_id": created.id,
                        "question": q["question"],
                        "options": json.dumps(q["options"]),
                        "correct_answer": q["correct_answer"]
                    }))
                count += 1
                print(f"Created lesson: {created.title}")
            
    print(f"Seeding complete. Added {count} new lessons.")
    await db.disconnect()

if __name__ == "__main__":
    asyncio.run(main())
