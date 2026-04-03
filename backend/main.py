"""
FinMentor AI - FastAPI Backend Entry Point
All financial calculations are deterministic. Oxlo AI is used only for explanations.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.finance import router as finance_router

app = FastAPI(
    title="FinMentor AI",
    description="AI-Powered Personal Finance Mentor - Backend API",
    version="1.0.0"
)

# Allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://finmentor-3.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(finance_router, prefix="/api")


@app.get("/")
def root():
    return {"message": "FinMentor AI Backend is running", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
