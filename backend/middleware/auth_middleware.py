# middleware/auth_middleware.py
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
import os, jwt

JWT_SECRET = os.getenv("JWT_SECRET_KEY", "supersecretkey123456")
JWT_ALGO = os.getenv("JWT_ALGORITHM", "HS256")

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=401,
                content={"detail": "Missing or invalid Authorization header"}
            )

        token = auth_header.split(" ")[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
            request.state.mobile_number = payload.get("sub")
        except jwt.InvalidTokenError:
            return JSONResponse(status_code=401, content={"detail": "Invalid or expired token"})

        return await call_next(request)
