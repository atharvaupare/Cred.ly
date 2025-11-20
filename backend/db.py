import os
from pymongo import MongoClient

MONGODB_URI = os.getenv("MONGODB_URI")
DB_NAME = os.getenv("MONGODB_DB", "credit_scoring")
COLL_NAME = os.getenv("MONGODB_COLLECTION", "cred.ly")

_client: MongoClient | None = None
_db = None
_coll = None


# ---------- Connection setup ----------
def connect_mongo() -> None:
    """Create a global client + database + default collection, and ping the server."""
    global _client, _db, _coll
    if not MONGODB_URI:
        raise RuntimeError("MONGODB_URI not set")

    _client = MongoClient(MONGODB_URI, uuidRepresentation="standard")
    _client.admin.command("ping")  # raises if connection fails

    _db = _client[DB_NAME]
    _coll = _db[COLL_NAME]

    # ✅ ensure common indexes
    _coll.create_index("mobile_number", unique=True)
    _db["scenarios"].create_index("mobile_number")


def close_mongo() -> None:
    global _client
    if _client:
        _client.close()
        _client = None


# ---------- Collection getters ----------
def get_collection(name: str = None):
    """
    Return a Mongo collection.
    If name is None, return the default main collection (cred.ly).
    """
    assert _db is not None, "Mongo not connected. Call connect_mongo() on startup."

    if name:
        return _db[name]
    return _coll


# ---------- Seed data ----------
def seed_bureau_data():
    coll = get_collection()

    dummy_records = [
        {
            "mobile_number": "9991112222",
            "score": None,
            "credit_limit": None,
            "credit_balance": None,
            "features": {
                "time_since_recent_deliquency": 6000,
                "num_times_delinquent": 0,
                "max_delinquency_level": 0,
                "num_times_30p_dpd": 0,
                "num_times_60p_dpd": 0,
                "enq_L3m": 0,
                "enq_L6m": 0,
                "enq_L12m": 1,
                "time_since_recent_enq": 24,
                "CC_utilization": 0.10,
                "PL_utilization": 0.00,
                "pct_currentBal_all_TL": 0.18,
                "max_unsec_exposure_inPct": 0.20,
                "CC_Flag": 1,
                "PL_Flag": 0
            }
        },
        {
            "mobile_number": "9993334444",
            "score": None,
            "credit_limit": None,
            "credit_balance": None,
            "features": {
                "time_since_recent_deliquency": 14,
                "num_times_delinquent": 1,
                "max_delinquency_level": 1,
                "num_times_30p_dpd": 1,
                "num_times_60p_dpd": 0,
                "enq_L3m": 1,
                "enq_L6m": 2,
                "enq_L12m": 3,
                "time_since_recent_enq": 3,
                "CC_utilization": 0.55,
                "PL_utilization": 0.20,
                "pct_currentBal_all_TL": 0.50,
                "max_unsec_exposure_inPct": 0.45,
                "CC_Flag": 1,
                "PL_Flag": 1
            }
        },
        {
            "mobile_number": "9995556666",
            "score": None,
            "credit_limit": None,
            "credit_balance": None,
            "features": {
                "time_since_recent_deliquency": 1,
                "num_times_delinquent": 6,
                "max_delinquency_level": 3,
                "num_times_30p_dpd": 4,
                "num_times_60p_dpd": 2,
                "enq_L3m": 3,
                "enq_L6m": 5,
                "enq_L12m": 8,
                "time_since_recent_enq": 0,
                "CC_utilization": 0.95,
                "PL_utilization": 0.80,
                "pct_currentBal_all_TL": 0.90,
                "max_unsec_exposure_inPct": 0.85,
                "CC_Flag": 1,
                "PL_Flag": 1
            }
        }
    ]

    result = coll.insert_many(dummy_records)
    print(f"Inserted {len(result.inserted_ids)} dummy records with score=None")
