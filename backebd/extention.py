from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager

# Initialisation des extensions (sans les attacher à l'app ici)
mongo = PyMongo()
bcrypt = Bcrypt()
jwt = JWTManager()
