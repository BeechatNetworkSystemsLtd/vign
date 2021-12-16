from myapp import db


class Contact(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False, unique=False)
    kyber_public_key = db.Column(db.String(2000), nullable=False, unique=False)
    dilithium_public_key = db.Column(db.String(2000), nullable=False, unique=False)
    address = db.Column(db.String(300), nullable=False, unique=False)

    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def __repr__(self):
        return f"{self.name}"


class FrpcStatus(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    check = db.Column(db.String(10), nullable=True)
    

    def __repr__(self):
        return f"{self.check}"


class ProgressBar(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(100))
    total_length = db.Column(db.Integer)
    progress = db.Column(db.Integer)

    def __repr__(self):
        return f"{self.filename}"


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    account_name = db.Column(db.String(600), unique=True, nullable=False)
    address = db.Column(db.String(200))
    ky_public_key = db.Column(db.String(2000), unique=False, nullable=False)
    ky_private_key = db.Column(db.String(2000), unique=False, nullable=False)
    dil_public_key = db.Column(db.String(2000), unique=False, nullable=False)
    dil_private_key = db.Column(db.String(2000), unique=False, nullable=False)

    contacts = db.relationship("Contact", backref="user", lazy=True)

    def __repr__(self):
        return f"{self.account_name}"


class CurrentUser(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer)

    def __repr__(self):
        return f"{self.user_id}"
