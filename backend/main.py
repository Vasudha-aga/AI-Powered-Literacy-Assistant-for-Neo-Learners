from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from database.database import connect_db, disconnect_db, get_db, is_db_connected


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_db()
    yield
    # Shutdown
    await disconnect_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Welcome to AI Literacy Platform API", "status": "online"}

@app.get("/health")
async def health():
    db = get_db()
    db_status = "disconnected"
    db_error = None
    try:
        if not is_db_connected():
            await connect_db()
        # Actually verify connection by executing a lightweight query
        await db.query_raw("SELECT 1")
        db_status = "connected"
    except Exception as e:
        db_status = "error"
        db_error = f"{type(e).__name__}: {str(e)}"
    return {
        "status": "healthy",
        "database": db_status,
        "database_error": db_error
    }

@app.get(f"{settings.API_V1_STR}/debug-db")
async def debug_db():
    import os, sys, traceback
    from prisma import Prisma
    
    db_url = os.getenv("DATABASE_URL", "NOT_SET")
    masked_url = db_url
    if "@" in db_url:
        try:
            prefix, host = db_url.split("@", 1)
            scheme = prefix.split("://")[0]
            masked_url = f"{scheme}://***:***@{host}"
        except Exception:
            masked_url = "INVALID_FORMAT"
    
    info = {
        "python_version": sys.version,
        "database_url_configured": db_url != "NOT_SET",
        "database_url_masked": masked_url,
        "database_url_len": len(db_url),
        "has_leading_quote": db_url.startswith('"') or db_url.startswith("'"),
    }
    
    test_client = Prisma()
    try:
        await test_client.connect()
        info["connect_success"] = True
        res = await test_client.query_raw("SELECT 1 as test")
        info["query_result"] = str(res)
        await test_client.disconnect()
    except Exception as exc:
        info["connect_success"] = False
        info["error_type"] = type(exc).__name__
        info["error_message"] = str(exc)
        info["traceback"] = traceback.format_exc()
        try:
            await test_client.disconnect()
        except Exception:
            pass
            
    return info




from routers import auth, curriculum, assessment, learning_path, voice, gamification, reports

# We will include routers here
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(curriculum.router, prefix=f"{settings.API_V1_STR}/curriculum", tags=["curriculum"])
app.include_router(assessment.router, prefix=f"{settings.API_V1_STR}/assessment", tags=["assessment"])
app.include_router(learning_path.router, prefix=f"{settings.API_V1_STR}/learning_path", tags=["learning_path"])
app.include_router(voice.router, prefix=f"{settings.API_V1_STR}/voice", tags=["voice"])
app.include_router(gamification.router, prefix=f"{settings.API_V1_STR}/gamification", tags=["gamification"])
app.include_router(reports.router, prefix=f"{settings.API_V1_STR}/reports", tags=["reports"])

