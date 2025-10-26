import json
from functools import lru_cache
from pathlib import Path
import numpy as np
import pandas as pd
import joblib
import lightgbm as lgb
import os

DEFAULT_MODEL_DIR = Path(os.getenv("MODEL_DIR", Path(__file__).resolve().parent))

class CibilModel:
    def __init__(self, model_dir: Path):
        self.model_dir = Path(model_dir)

        # artifacts
        with open(self.model_dir / "meta.json", "r") as f:
            self.meta = json.load(f)
        self.feature_cols = pd.read_csv(self.model_dir / "feature_cols.csv", header=None)[0].tolist()

        # choose loader
        self.model = joblib.load(self.model_dir / "model.joblib")
        # ALT: self.model = lgb.Booster(model_file=str(self.model_dir / "model.txt"))

        self.impute_values: dict = self.meta["impute_values"]
        self.winsor_caps: dict = self.meta["winsor_caps_used"]
        self.missing_indicators: set[str] = set(self.meta["missing_indicators"])
        self.kept_cols: list[str] = self.meta["kept_cols"]
        self.score_clip = tuple(self.meta["score_clip"])

    @staticmethod
    def _to_float(x):
        try:
            return float(x)
        except Exception:
            return np.nan

    def preprocess(self, payload: dict) -> pd.DataFrame:
        df = pd.DataFrame([payload])

        # ensure all kept cols exist and are numeric
        for c in self.kept_cols:
            if c in df.columns:
                df[c] = df[c].apply(self._to_float)
            else:
                df[c] = np.nan

        # flags normalized to 0/1
        for flag in ("CC_Flag", "PL_Flag"):
            if flag in df.columns:
                df[flag] = pd.to_numeric(df[flag], errors="coerce").round().clip(0, 1)

        # missing indicators (exact set used in training)
        for c in self.missing_indicators:
            df[c + "_missing"] = df[c].isna().astype(int)

        # winsor caps
        for c, cap in self.winsor_caps.items():
            if c in df.columns:
                df[c] = df[c].clip(lower=0.0, upper=float(cap))

        # median impute
        for c, med in self.impute_values.items():
            if c in df.columns:
                df[c] = df[c].fillna(med)

        # final matrix in exact feature order
        for col in self.feature_cols:
            if col not in df.columns:
                df[col] = 0.0 if col.endswith("_missing") else np.nan

        X = df[self.feature_cols].astype(float).fillna(0.0)
        return X

    def predict(self, payload: dict) -> float:
        X = self.preprocess(payload)
        y = self.model.predict(X)
        y = np.clip(y, self.score_clip[0], self.score_clip[1])
        return float(y[0])

@lru_cache(maxsize=1)
def get_model() -> CibilModel:
    return CibilModel(DEFAULT_MODEL_DIR)
