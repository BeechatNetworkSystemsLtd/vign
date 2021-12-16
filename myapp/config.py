

class Config():
    SECRET_KEY = "asldfhlasfk$2934908lflasfdjlfks"
    SESSION_TYPE = "sqlalchemy"
    SQLALCHEMY_DATABASE_URI = "sqlite:///database.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # SESSION_SQLALCHEMY_TABLE = 'sessions'