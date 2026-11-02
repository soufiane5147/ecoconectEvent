import os

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev_secret"
    MONGO_URI = "mongodb://localhost:27017/ecoconnect"
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or "jwt_secret"
    DEBUG = True
