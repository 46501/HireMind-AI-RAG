from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from api.routes import router as api_router
from db.document_store import DocumentStore
from db.chat_store import ChatStore
from db.ats_store import AtsStore

DocumentStore.init_db()
ChatStore.init_db()
AtsStore.init_db()

app = FastAPI(title=settings.PROJECT_NAME)

# Setup CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, restrict to frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def read_root():
    return {"message": "Welcome to HireMind AI API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
