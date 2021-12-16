from flask import (Blueprint, request, 
                        redirect, url_for, flash)
from myapp.models import User, CurrentUser, Contact
from myapp import db
from blake3 import blake3


accounts = Blueprint('accounts', __name__)


@accounts.before_app_first_request
def set_account():
    c_user = CurrentUser.query.first()
    if c_user==None:
        user = User.query.first()
        if user==None:
            flash("No user exists. please make a user first.")
        else:
            current_user = CurrentUser(user_id=user.id)
            db.session.add(current_user)
            db.session.commit()



@accounts.route('/add_account', methods=['POST'])
def add_account():
    name = request.form.get('name')

    kyber_private_key = request.form.get('ki')
    dilithium_private_key = request.form.get('di')

    kyber_public_key = request.form.get('kp')
    dilithium_public_key = request.form.get('dp')


    # making address from dil private and kyber private keys.
    address = str(blake3((dilithium_public_key+kyber_public_key).encode()).hexdigest())

    user = User(account_name=name, address=address, ky_public_key=kyber_public_key,
                ky_private_key=kyber_private_key, dil_public_key=dilithium_public_key,
                dil_private_key=dilithium_private_key)

    db.session.add(user)
    db.session.commit()


    flash(f"{name} has been added as a new user.","success")
    return redirect(url_for('main.home'))


@accounts.route('/change_user', methods=['POST'])
def change_user():
    user_id = request.json['id']
    c_user = CurrentUser.query.first()
    c_user.user_id = user_id
    db.session.commit()
    return "1"


@accounts.route('/delete_user', methods=['POST'])
def delete_user():
    _ids = request.form.getlist('delete_id')
    for i in _ids:
        # first deleting attached contacts
        contacts = Contact.query.filter_by(user_id=i).all()
        if contacts!=None:
            [db.session.delete(n) for n in contacts]
        
        c = User.query.get(i)
        if c:
            db.session.delete(c)
    db.session.commit()

    flash("Your Selected Accounts has been deleted!", "danger")
    return redirect(url_for('main.home'))


@accounts.route('/edit_account', methods=['POST'])
def edit_account():
    _id = request.form.get('_id')
    account_name = request.form.get('name')
    ky_pub_key = request.form.get('kp')
    ky_private_key = request.form.get('ki')
    dil_pub_key = request.form.get('dp')
    dil_private_key = request.form.get('di')

    # making address from dil private and kyber private keys.
    address = str(blake3((dil_pub_key+ky_pub_key).encode()).hexdigest())

    user = User.query.get(int(_id))
    user.account_name = account_name
    user.address = address
    user.ky_public_key = ky_pub_key
    user.ky_private_key = ky_private_key
    user.dil_public_key = dil_pub_key
    user.dil_private_key = dil_private_key

    db.session.commit()

    return redirect(url_for('main.home'))
