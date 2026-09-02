from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings

from database.database import connect_db, disconnect_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

@app.on_event("startup")
async def startup():
    await connect_db()

@app.on_event("shutdown")
async def shutdown():
    await disconnect_db()

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify the allowed origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to AI Literacy Platform API"}

from routers import auth, curriculum, assessment, learning_path, voice, gamification, reports

# We will include routers here
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(curriculum.router, prefix=f"{settings.API_V1_STR}/curriculum", tags=["curriculum"])
app.include_router(assessment.router, prefix=f"{settings.API_V1_STR}/assessment", tags=["assessment"])
app.include_router(learning_path.router, prefix=f"{settings.API_V1_STR}/learning_path", tags=["learning_path"])
app.include_router(voice.router, prefix=f"{settings.API_V1_STR}/voice", tags=["voice"])
app.include_router(gamification.router, prefix=f"{settings.API_V1_STR}/gamification", tags=["gamification"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["reports"])

