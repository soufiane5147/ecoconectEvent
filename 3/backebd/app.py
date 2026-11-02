from flask import Flask
from flask_cors import CORS
from extention import mongo, bcrypt, jwt


# Import des blueprints
from routes.auth import auth_bp
from routes.event import event_bp
from routes.newsletter import newsletter_bp 


def create_app():
    app = Flask(__name__)

    # ⚙️ Configuration de base
    app.config["MONGO_URI"] = "mongodb://localhost:27017/ecoconnect"
    app.config["JWT_SECRET_KEY"] = "super-secret-key"  # 🔒 change par une vraie clé

    # Initialisation des extensions
    mongo.init_app(app)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # Activer CORS (évite "failed to fetch" dans le frontend)
    CORS(app)

    # Enregistrement des blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(event_bp, url_prefix="/api/events")
    app.register_blueprint(newsletter_bp, url_prefix="/api/newsletter")

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, host="127.0.0.1", port=5000)
