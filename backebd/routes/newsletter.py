from flask import Blueprint, request, jsonify
from extention import mongo

newsletter_bp = Blueprint("newsletter", __name__)

# 📩 Inscription à la newsletter
@newsletter_bp.route("/", methods=["POST"])
def subscribe():
    data = request.get_json()
    if not data or not data.get("email"):
        return jsonify({"msg": "Email requis"}), 400

    existing = mongo.db.newsletter.find_one({"email": data["email"]})
    if existing:
        return jsonify({"msg": "Email déjà inscrit"}), 400

    mongo.db.newsletter.insert_one({"email": data["email"]})
    return jsonify({"msg": "Inscription réussie"}), 201
