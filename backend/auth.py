import os
from datetime import datetime, timedelta
from typing import Optional
from fastapi import Header, HTTPException, Depends
from jose import jwt, JWTError
from passlib.context import CryptContext

# ── SECRET CONFIG (Prefer .env in production) ──────────────────────────────────
SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "your-super-secret-key-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# Passlib + BCrypt 4.0+ fix (Global Monkeypatch)
import bcrypt
# Fix for bcrypt 4.0.0+ change in version reporting
if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type("About", (), {"__version__": bcrypt.__version__})

# GLOBAL FIX: Force bcrypt to truncate passwords itself
# This bypasses the Passlib "wrap bug" self-test crash.
original_bcrypt_hashpw = bcrypt.hashpw
def patched_bcrypt_hashpw(password, salt):
    # Ensure password is bytes for length check
    pw_bytes = password
    if isinstance(pw_bytes, str):
        pw_bytes = pw_bytes.encode("utf-8")
    
    if len(pw_bytes) > 72:
        pw_bytes = pw_bytes[:72]
    return original_bcrypt_hashpw(pw_bytes, salt)
bcrypt.hashpw = patched_bcrypt_hashpw

from passlib.context import CryptContext

# Configuration for passlib with bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# ── CONFIG ──────────────────────────────────────────────────────────────────
SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "your-super-secret-key-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

# ── Mock Admin (Usually stored in database but project uses mock for now) ──────
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", pwd_context.hash("shaadi@admin2026"))


def authenticate_admin(username, password) -> bool:
    """Check if the provided username and password match the admin credentials."""
    if username != ADMIN_USERNAME:
        return False
    # Passlib correctly handles the 72-byte truncation in bcrypt.
    try:
        return pwd_context.verify(password, ADMIN_PASSWORD_HASH)
    except ValueError:
        return False

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create a new JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def require_admin(authorization: str = Header(None)):
    """Dependency to verify JWT token in the Authorization header."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.split(" ")[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username != ADMIN_USERNAME:
            raise HTTPException(status_code=401, detail="Invalid token")
        return username
    except JWTError:
        raise HTTPException(status_code=401, detail="Token has expired or is invalid")
