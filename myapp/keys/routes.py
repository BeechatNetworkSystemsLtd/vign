from flask import (Blueprint, request,
                        redirect, url_for)
from myapp.keys import kyber as Kyber
from myapp.keys import dilithium as Dilithium
from blake3 import blake3
from myapp.models import Contact, User, CurrentUser
from myapp import db


keys = Blueprint('keys', __name__)



def create_kyber_keys():
    mykybkeys = Kyber.createkeys()
    kybprivatekey = mykybkeys[0]
    kybpublickey = mykybkeys[1]

    myuser = {
        "Ki": kybprivatekey,
        "Kp": kybpublickey
    }

    return myuser


def create_dilithium_keys():
    mydilkeys = Dilithium.createkeys()
    dilprivatekey = mydilkeys[0]
    dilpublickey = mydilkeys[1]

    myuser = {
        "Di": dilprivatekey,
        "Dp": dilpublickey
    }
    return myuser

@keys.route('/create_new_keys')
def create_new_keys():
    cuser_id = CurrentUser.query.first().user_id
    user = User.query.get(cuser_id)
    
    k = create_kyber_keys()
    d = create_dilithium_keys()
    data = {
        "Ki": k['Ki'],
        "Kp": k['Kp'],
        "Di": d['Di'],
        "Dp": d['Dp'],
    }
    user.ky_private_key = data["Ki"]
    user.ky_public_key = data["Kp"]
    user.dil_private_key = data["Di"]
    user.dil_public_key = data["Dp"]
    db.session.commit()

    return redirect(url_for('main.home'))


@keys.route('/download_keys')
def download_keys():
    cuser_id = CurrentUser.query.first().user_id
    user = User.query.get(cuser_id)
    all_contacts = Contact.query.filter_by(user_id=cuser_id).all()
    contacts = []
    for i in all_contacts:
        cdata = {'name': i.name, 'kp': i.kyber_public_key, 
                 'dp': i.dilithium_public_key, 'address': i.address}
        contacts.append(cdata)
    try:
        data = {
            "Account_name": user.account_name,
            "Ki": user.ky_private_key,
            "Kp": user.ky_public_key,
            "Di": user.dil_private_key,
            "Dp": user.dil_public_key,
            "contacts": contacts,
        }
    except:
        return "error"
    return data


@keys.route('/get_pub_keys')
def get_pub_keys():
    cuser_id = CurrentUser.query.first().user_id
    user = User.query.get(cuser_id)
    try:
        data = {
            "Kp": user.ky_public_key,
            "Dp": user.dil_public_key,
        }
    except:
        return "error"
    return data


@keys.route('/generate_kpi', methods=['POST'])
def generate_kpi():
    dil_pub_keys = request.json['dp_val']
    k = create_kyber_keys()
    address = str(blake3((dil_pub_keys+k['Kp']).encode()).hexdigest())
    data = {
        'Ki': k['Ki'],
        'Kp': k['Kp'],
        'address': address,
    }
    return data

@keys.route('/generate_dpi', methods=['POST'])
def generate_dpi():
    d = create_dilithium_keys()
    ky_pub_keys = request.json['kp_val']
    address = str(blake3((d['Dp']+ky_pub_keys).encode()).hexdigest())
    data = {
        'Di': d['Di'],
        'Dp': d['Dp'],
        'address': address,
    }
    return data

# Exporting public keys
@keys.route('/get_public_keys', methods=['POST'])
def get_public_keys():
    id = request.json['id']
    user = User.query.get(id)
    data = {'Kp': user.ky_public_key, 'Dp': user.dil_public_key}
    return data

# Exporting private keys
@keys.route('/get_private_keys', methods=['POST'])
def get_private_keys():
    id = request.json['id']
    user = User.query.get(id)
    data = {'Ki': user.ky_private_key, 'Di': user.dil_private_key}
    return data

# Exporting private keys
@keys.route('/get_private_keys_contacts', methods=['POST'])
def get_private_keys_contacts():
    id = request.json['id']
    user = User.query.get(id)
    all_contacts = Contact.query.filter_by(user_id=id).all()
    contacts = []
    for i in all_contacts:
        cdata = {'name': i.name, 'kp': i.kyber_public_key, 
                 'dp': i.dilithium_public_key, 'address': i.address}
        contacts.append(cdata)
    data = {'Ki': user.ky_private_key, 
            'Di': user.dil_private_key,
            'contacts': contacts}
    return data

