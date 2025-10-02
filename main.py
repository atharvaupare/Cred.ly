from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.credit import router as credit_router


app = FastAPI(title="CIBIL Scoring API")

# CORS (relax now; tighten in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # e.g. ["http://localhost:3000"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# mount routes under /api
app.include_router(credit_router, prefix="/api")

@app.get("/")
def root():
    return {"name": "CIBIL Scoring API", "docs": "/docs"}
