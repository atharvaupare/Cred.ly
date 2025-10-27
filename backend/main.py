from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.credit import router as credit_router
from db import connect_mongo, close_mongo, get_collection, seed_bureau_data
from routes.onboard import router as onboard_router
from routes.scenario import router as scenario_router



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
app.include_router(onboard_router, prefix="/api")
app.include_router(scenario_router, prefix="/api")

@app.on_event("startup")
def _startup():
    connect_mongo()

@app.on_event("shutdown")
def _shutdown():
    close_mongo()

@app.get("/db/health")
def db_health():
    # simple check: count documents (does not modify anything)
    coll = get_collection()
    return {"ok": True, "collection": coll.name}

@app.get("/seed")
def seed():
    seed_bureau_data()
    return {"message": "Dummy records inserted"}


@app.get("/")
def root():
    return {"name": "CIBIL Scoring API", "docs": "/docs"}
