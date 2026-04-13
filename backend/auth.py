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

# Passlib + BCrypt 4.0+ fix (Monkeypatch)
import bcrypt
from passlib.handlers.bcrypt import _bcrypt
# Fix for bcrypt 4.0.0+ change in version reporting
if not hasattr(bcrypt, "__about__"):
    bcrypt.__about__ = type("About", (), {"__version__": bcrypt.__version__})

# Fix for "password cannot be longer than 72 bytes" in passlib's internal bug detection
# We wrap the hashpw function to manually truncate if it's too long, 
# which passlib's internal test sometimes triggers.
original_hashpw = _bcrypt.hashpw
def patched_hashpw(password, salt):
    if isinstance(password, str):
        password = password.encode("utf-8")
    if len(password) > 72:
        password = password[:72]
    return original_hashpw(password, salt)
_bcrypt.hashpw = patched_hashpw

# Configuration for passlib with bcrypt
# Fixed: BCrypt 4.0+ expects passwords to be truncated to 72 bytes.
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ── Mock Admin (Usually stored in database but project uses mock for now) ──────
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
# The hash for "admin" (default) or whatever is used.
# If they have no db user tables, we use a mock.
ADMIN_PASSWORD_HASH = os.getenv("ADMIN_PASSWORD_HASH", pwd_context.hash("admin"))

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
