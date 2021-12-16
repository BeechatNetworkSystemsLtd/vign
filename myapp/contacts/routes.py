from flask import Blueprint, request, redirect, url_for, flash
from myapp.models import Contact, User, CurrentUser
from myapp import db
from blake3 import blake3


contacts = Blueprint('contacts',__name__)


@contacts.route('/add_contact', methods=['POST'])
def add_contact():
    user = User.query.first()
    if user==None:
        flash("No user exist. please add a user first.", "warning")
        return redirect(url_for('main.home'))
    name = request.form.get('name')
    kyber_public_key = request.form.get('kp')
    dilithium_public_key = request.form.get('dp')
    address = str(blake3((dilithium_public_key+kyber_public_key).encode()).hexdigest())

    # getting current user for attaching with contact
    cuser = CurrentUser.query.first().user_id
    contact = Contact(name=name, kyber_public_key=kyber_public_key,
                dilithium_public_key=dilithium_public_key, address=address,
                user_id=cuser)

    db.session.add(contact)
    db.session.commit()

    flash(f"{name} has been added in your contact list","primary")
    return redirect(url_for('main.home'))


@contacts.route('/edit_contact', methods=["POST"])
def edit_contact():
    _id = request.form.get('_id')
    name = request.form.get('name')
    kyber_public_key = request.form.get('kp')
    dilithium_public_key = request.form.get('dp')

    contact = Contact.query.get(_id)
    contact.name = name
    contact.kyber_public_key = kyber_public_key
    contact.dilithium_public_key = dilithium_public_key

    address = str(blake3((dilithium_public_key+kyber_public_key).encode()).hexdigest())
    
    contact.address = address
    db.session.commit()



    flash(f"{name} has been edited successfully.", "info")
    return redirect(url_for('main.home'))


@contacts.route('/delete', methods=['POST'])
def delete():
    _ids = request.form.getlist('delete_id')
    for i in _ids:
        c = Contact.query.get(i)
        db.session.delete(c)
    db.session.commit()

    flash("Your Selected Contacts has been deleted!", "danger")
    return redirect(url_for('main.home'))


