from typing import Annotated

from fastapi import APIRouter, Depends, FastAPI, HTTPException, Path
from fastapi.responses import FileResponse, PlainTextResponse
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from ukulele_routes import ukulele_router
from User import User

app = FastAPI(title="Ukulele Library", version="1.0.0")


from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = "mongodb://127.0.0.1:27017"
client = AsyncIOMotorClient(MONGO_URL)
db = client["ukulele_app"]

from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "supersecretkey"
ALGORITHM = "HS256"


@app.get("/test-db")
async def test_db():
    await db.test.insert_one({"msg": "hello"})
    return {"message": "MongoDB connected!"}


def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


@app.get("/")
async def home():  # returns the frontend html folder
    return FileResponse("./frontend/index.html")


# Router need to be before the mount,
# Otherwise the route can not be found
app.include_router(ukulele_router, tags=["Library"], prefix="/library")
# This mounts frontend to backend


@app.post("/signup")
async def signup(user: User):
    existing = await db.users.find_one({"username": user.username})

    if existing:
        raise HTTPException(status_code=400, detail="User exists")

    safe_password = user.password[:72]
    hashed_password = pwd_context.hash(safe_password)

    await db.users.insert_one(
        {"username": user.username, "email": user.email, "password": hashed_password}
    )

    return {"message": "User created"}


@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db.users.find_one({"username": form_data.username})

    if not user or not pwd_context.verify(form_data.password[:72], user["password"]):
        raise HTTPException(status_code=401, detail="Invalid login")

    access_token = create_access_token({"sub": user["username"]})

    return {"access_token": access_token, "token_type": "bearer"}


# Always last
app.mount("/", StaticFiles(directory="frontend"), name="static")
