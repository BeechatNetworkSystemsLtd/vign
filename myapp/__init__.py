from flask import Flask
from flask_session import Session
from myapp.config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO

db = SQLAlchemy()
socketio = SocketIO()

def create_app():

    app = Flask(__name__)
    app.config.from_object(Config)

    socketio.init_app(app)

    db.init_app(app)
    app.config["SESSION_SQLALCHEMY"] = db
    
    sess = Session()
    sess.init_app(app)
    
    

    from myapp.main.routes import main
    app.register_blueprint(main)

    from myapp.keys.routes import keys
    app.register_blueprint(keys)

    from myapp.contacts.routes import contacts
    app.register_blueprint(contacts)

    from myapp.accounts.routes import accounts
    app.register_blueprint(accounts)

    return app