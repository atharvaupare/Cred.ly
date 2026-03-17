from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.credit import router as credit_router
from routes.onboard import router as onboard_router
from routes.scenario import router as scenario_router
from routes.user_profile import router as user_router
from routes.login import router as login_router
from routes.advisor_router import router as advisor_router


from db import connect_mongo, close_mongo, get_collection, seed_bureau_data
from middleware.auth_middleware import AuthMiddleware

app = FastAPI(title="CIBIL Scoring API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Public routes ---
app.include_router(credit_router, prefix="/api")
app.include_router(onboard_router, prefix="/api")
app.include_router(login_router, prefix="/api")

# --- Protected sub-app ---
from fastapi import FastAPI as SubApp

protected_app = SubApp()
protected_app.add_middleware(AuthMiddleware)
# NOTE: do NOT prefix /api again since we mount it at /api
protected_app.include_router(scenario_router)
protected_app.include_router(user_router)
protected_app.include_router(advisor_router)
# Mount protected routes under /api only
app.mount("/api", protected_app)


# --- DB lifecycle ---
@app.on_event("startup")
def _startup():
    connect_mongo()

@app.on_event("shutdown")
def _shutdown():
    close_mongo()


# --- Utility routes ---
@app.get("/db/health")
def db_health():
    coll = get_collection()
    return {"ok": True, "collection": coll.name}

@app.get("/seed")
def seed():
    seed_bureau_data()
    return {"message": "Dummy records inserted"}

@app.get("/")
def root():
    return {"name": "CIBIL Scoring API", "docs": "/docs"}
