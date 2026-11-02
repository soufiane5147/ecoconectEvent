from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from extention import mongo

event_bp = Blueprint("event", __name__)

# 📌 Récupérer tous les événements
@event_bp.route("/", methods=["GET"])
def get_events():
    events = list(mongo.db.events.find({}, {"_id": 0}))
    return jsonify(events), 200


# 📌 Ajouter un événement (protégé par JWT)
@event_bp.route("/", methods=["POST"])
@jwt_required()
def add_event():
    data = request.get_json()
    if not data or not data.get("title") or not data.get("date"):
        return jsonify({"msg": "Titre et date requis"}), 400

    event = {
        "title": data["title"],
        "date": data["date"],
        "categorie": data.get("categorie", "autre"),
        "location": data.get("location", None)  # <-- garder l’objet {lat, lng, text}
    }

    mongo.db.events.insert_one(event)

    return jsonify({"msg": "Événement ajouté"}), 201
