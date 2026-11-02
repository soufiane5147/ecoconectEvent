from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from extention import mongo, bcrypt

auth_bp = Blueprint("auth", __name__)

# ✅ Inscription utilisateur
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"msg": "Email et mot de passe requis"}), 400

    user = mongo.db.users.find_one({"email": data["email"]})
    if user:
        return jsonify({"msg": "Utilisateur déjà existant"}), 400

    hashed_pw = bcrypt.generate_password_hash(data["password"]).decode("utf-8")
    mongo.db.users.insert_one({"email": data["email"], "password": hashed_pw})

    return jsonify({"msg": "Inscription réussie"}), 201


# ✅ Connexion utilisateur
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"msg": "Email et mot de passe requis"}), 400

    user = mongo.db.users.find_one({"email": data["email"]})
    if not user or not bcrypt.check_password_hash(user["password"], data["password"]):
        return jsonify({"msg": "Identifiants invalides"}), 401

    token = create_access_token(identity=str(user["_id"]))
    return jsonify({"token": token}), 200
