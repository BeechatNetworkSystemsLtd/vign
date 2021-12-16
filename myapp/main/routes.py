from flask import Blueprint, render_template, request
from myapp.keys import dilithium as Dilithium
from blake3 import blake3
import shutil
from shutil import copyfile
import py7zr
from py7zr.py7zr import SevenZipFile
from myapp.keys import kyber as Kyber
import json
import os
from myapp.models import Contact, User, CurrentUser
import subprocess

main = Blueprint('main', __name__)


@main.route('/')
def home():
    users = User.query.all()
    cu = CurrentUser.query.first().user_id
    cUser = User.query.get(cu)
    contacts = Contact.query.filter_by(user_id=cu).all()


    return render_template("index.html", contacts=contacts,
                            users=users,cuser=cUser)


@main.route('/encrypt_and_sign', methods=['POST'])
def encript_and_sign():
    file = request.files['file']
    filename = file.filename
    print("Filename is: " + filename)
    contact_id = request.form.get('cid')

    file_in_cwd = False
    if not os.path.exists(filename):
        file.save(filename)
        file_in_cwd = True


    # Encription starts here
    print(f"Contact Id is: {contact_id}")
    contact_ky_pubkey = Contact.query.get(contact_id)
    cwd = os.getcwd()
    os.mkdir(cwd+"/"+filename+"_main")

    publickey = contact_ky_pubkey.kyber_public_key
    
    
    print("Encrypting for "+ blake3(publickey.encode()).hexdigest()+ "\n")
    KEMKey = Kyber.encapsulate(publickey)
    skey = KEMKey[1]
    
    #Generating Kyber password
    ciphertext = KEMKey[0]
    #Saving Kyber password
    f = open(cwd+"/"+filename+"_main/ek.key", 'w')
    f.write(ciphertext)
    f.close()
    print("Encapsulated Key (EK) written to ek.key")

    #Generating chachadata
    print("Encryption key is: "+skey)
    
    file_to_enc = None
    if os.path.exists(filename):
        os.stat(filename)
        print("Filesize is: " + str(os.stat(filename).st_size)+ " bytes")

        with SevenZipFile(filename+"_main/"+filename+".7z", 'w', password=skey) as archive:
            print("Processed bytes 1: " + str(os.stat(filename+"_main/"+filename+".7z").st_size))
            archive.writeall(cwd+"/"+filename, filename)
        
        with SevenZipFile(filename+'.enc.7z', 'w') as archive:
            print("Processed bytes 1: " + str(os.stat(filename+'.enc.7z').st_size))
            archive.writeall(cwd+"/"+filename+"_main",filename+"_main")
            try:
                shutil.rmtree(cwd+"/"+filename+"_main")
            except OSError as e:
                print ("Error: %s - %s." % (e.filename, e.strerror))
    # Encription ends here


    # Signing starts here
    # Changing filename to new encrypted filename
    old_filename = filename
    filename = filename + ".enc.7z"
    os.stat(filename)
    print("Filesize is: " + str(os.stat(filename).st_size)+ " bytes")

    #Optimised file hashing for VERY large files (over 100 Gigabytes)
    i = 0
    BUF_SIZE = 65536  # Read file in 64kb chunks
    h_obj = blake3()
    with open(filename, 'rb') as f:
        while True:
            data = f.read(BUF_SIZE)
            if not data:
                break
            h_obj.update(data)
            i +=BUF_SIZE
            print("Processed bytes: " + str(i))
    #Hashed result
    hashmessage = str(h_obj.hexdigest())
    print("Output hash: "+ hashmessage)

    cwd = os.getcwd()
    os.mkdir(cwd+"/"+filename+"_main")
    print("MADE: "+cwd+"/"+filename+"_main")

    # getting private key of current user
    cu = CurrentUser.query.first().user_id
    cUser = User.query.get(cu)
    if cUser==None:
        return "0"
    else:
        dil_private_key = cUser.dil_private_key

    signedhash = Dilithium.signmessage(dil_private_key,hashmessage)
    print("Signed hash:" + signedhash)
    print("Saving to file 'signature.txt'")
    f = open(cwd+"/"+filename+"_main/signature.txt", 'w')
    f.write(signedhash)
    f.close()
    print("SAVED TO: "+cwd+"/"+filename+"_main/signature.txt")
    print("")
    
    shutil.move(filename, cwd+"/"+filename+"_main/"+filename)

    with py7zr.SevenZipFile(filename+".signed.7z", 'w') as archive:
        archive.writeall("./"+filename+"_main")
        try:
            shutil.rmtree(cwd+"/"+filename+"_main")
        except OSError as e:
            print ("Error: %s - %s." % (e.filename, e.strerror))
    
    # Removing encrypted file and only keeping signed filess
    if file_in_cwd:
        os.remove(old_filename)
    try:
        os.remove(filename)
    except:
        pass
    # Signing ends here
    return f"{filename}"


@main.route('/verify_and_decrypt', methods=['POST'])
def verify_and_decrypt():
    # verify start
    file = request.files["file"]
    filename = file.filename
    old_filename = filename
    contact_id = request.form.get("id")
    contact = Contact.query.get(contact_id)

    file_in_cwd = False
    if not os.path.exists(filename):
        file.save(filename)
        file_in_cwd = True

    print("Filename is: " + filename)
    cwd = os.getcwd()
    with py7zr.SevenZipFile(filename, 'r') as archive:
        archive.extractall(path=cwd)

    
    signedhash_filename = filename[:-10]+"_main/signature.txt"
    with open(signedhash_filename) as f:
        signedhash = f.read()
        signedhash = signedhash.strip()
        print(signedhash)


    dil_public_key = contact.dilithium_public_key 
    print(f"Dil pubkey is: {dil_public_key}")
    ##CHECKING SIGNATURE
    print("\nVerifying signature...")
    print(f"{contact.id}, {contact.name}")
    checkedhash = Dilithium.checkmessage(dil_public_key,signedhash)
    try:
        print("Verified hash: "+ checkedhash)
    except Exception as e:
        print(e)
        shutil.rmtree(filename[:-10]+"_main")
        return "0"

    ##HASHING MESSAGE
    #Optimised file hashing for VERY large files (over 100 Gigabytes)
    filename1 = filename[:-10]+"_main/"+filename[:-10]
    filename = filename1
    os.stat(filename)
    print("Filesize is: " + str(os.stat(filename).st_size)+ " bytes")
    i = 0
    BUF_SIZE = 65536  # Read file in 64kb chunks
    h_obj = blake3()
    with open(filename, 'rb') as f:
        while True:
            data = f.read(BUF_SIZE)
            if not data:
                break
            h_obj.update(data)
            i +=BUF_SIZE
            print("Processed bytes: " + str(i))

    #Hashed result
    hashmessage = str(h_obj.hexdigest())
    print("Output hash: "+ hashmessage)

    print("Checking if "+ checkedhash + " = " + hashmessage)
    
    if checkedhash == None :
        verifcation_success = False
        return "vfailed"
    if checkedhash == hashmessage:
        verifcation_success = True
    else :
        verifcation_success = False
        return "vfailed"

    # verify ends

    # decrypt start
    cwd = os.getcwd()
    print(f"Current working diretory: {cwd}")
    #file_to_dec = None

    print(f"filename: {filename}")
    if os.path.exists(filename):
        print("OK.")

    with SevenZipFile(filename, mode='r') as z:
        z.extractall()

    ctkey = None
    f = open(filename[:-7].split('/')[-1] + '_main/ek.key', 'r')
    ctkey = f.read()
    f.close()
    #print("EK File read successfully.")

    #Decrypting Kyber password, getting ky private key of current user
    cu = CurrentUser.query.first().user_id
    cUser = User.query.get(cu)
    if cUser==None:
        return "dfailed"
    else:
        key = cUser.ky_private_key
    print(f"My kyber public key is: {key}")
    decapsulatedkey = Kyber.decapsulate(ctkey, key)
    print("Decryption key:"+decapsulatedkey)
    print("Extracting into: "+ filename[:-7].split('/')[-1] + '_main/' + filename[:-7].split('/')[-1]  + '.7z')
    with SevenZipFile(filename[:-7].split('/')[-1] + '_main/' + filename[:-7].split('/')[-1]  + '.7z', mode='r', password=decapsulatedkey) as z:
        z.extractall(cwd+"/decrypted_"+filename[:-7])
        print(f"Filename is: {filename}")
        try:
            shutil.rmtree(filename[:-7].split('/')[-1] + '_main/')
            print(f"one directory removed: {filename[:-7].split('/')[-1] + '_main/' + filename[:-7].split('/')[-1]  + '.7z'}")
            shutil.rmtree(cwd+"/"+filename.split('/')[0])
            print(os.path.exists(cwd+"/decrypted_"+filename[:-7]))
            shutil.move(cwd+"/decrypted_"+filename[:-7] + "/" + filename.split('/')[0].split('.enc')[0], cwd)
            print("file moved, removing the directory now")
            print(cwd+"/decrypted_"+filename.split('/')[0])
            shutil.rmtree(cwd+"/decrypted_"+filename.split('/')[0])
            print(cwd+"/decrypted_"+filename.split('/')[0])
            print(os.path.exists(cwd+"/decrypted_"+filename.split('/')[0]))
            print("Extracted succesfully from try")
        except OSError as e:
            print ("Error: %s - %s." % (e.filename, e.strerror))

    if file_in_cwd:
        os.remove(old_filename)
    # decrypt ends
    return "verify and decrypted"



def create_keys():
    #CREATE KEYS
    data = []
    try:
        print("Trying to open keys from 'dkeys.json'...")
        with open('dkeys.json') as json_file:        
            print("Keys opened successfully.")
            data = json.load(json_file)
            if (not data):
                raise ValueError
    except:
        print("No dilithium keys found. Creating keys...")
        mydilkeys = Dilithium.createkeys()
        dilprivatekey = mydilkeys[0]
        dilpublickey = mydilkeys[1]

        myuser = {
            "Di": dilprivatekey,
            "Dp": dilpublickey
        }

        with open('dkeys.json', 'w') as fp:
            json.dump(myuser, fp,  indent=4)
        data = myuser
        print("Keys saved to 'dkeys.json'")

    privatekey = data["Di"]
    publickey = data["Dp"]

    return [privatekey, publickey]


def create_enc_keys():
    #CREATE KEYS
    data = []
    try:
        print("Trying to open keys from 'kkeys.json'...")
        with open('kkeys.json') as json_file:        
            print("Keys opened successfully.")
            data = json.load(json_file)
            if (not data):
                raise ValueError
    except:
        print("No kyber keys found. Creating keys...")
        mykybkeys = Kyber.createkeys()
        kybprivatekey = mykybkeys[0]
        kybpublickey = mykybkeys[1]

        myuser = {
            "Ki": kybprivatekey,
            "Kp": kybpublickey
        }

        with open('kkeys.json', 'w') as fp:
            json.dump(myuser, fp,  indent=4)
        data = myuser
        print("Keys saved to 'kkeys.json'. Public key saved to mypubkey.txt")
        f = open("mypubkey.txt", 'w')
        f.write(kybpublickey)
        f.close()

    privatekey = data["Ki"]
    publickey = data["Kp"]
    return [privatekey, publickey]


@main.route('/encrypt', methods=['POST'])
def encrypt():
    file = request.files["file"]
    filename = file.filename
    contact_id = request.form.get("enc_cid")
    contact_ky_pubkey = Contact.query.get(contact_id)
    cwd = os.getcwd()
    file_in_cwd = False
    if not os.path.exists(filename):
        file.save(filename)
        file_in_cwd = True

    os.mkdir(cwd+"/"+filename+"_main")

    # publickey_filename = request.json['public_key']
    publickey = contact_ky_pubkey.kyber_public_key
    
    
    print("Encrypting for "+ blake3(publickey.encode()).hexdigest()+ "\n")
    KEMKey = Kyber.encapsulate(publickey)
    skey = KEMKey[1]
    
    #Generating Kyber password
    ciphertext = KEMKey[0]
    #Saving Kyber password
    f = open(cwd+"/"+filename+"_main/ek.key", 'w')
    f.write(ciphertext)
    f.close()
    print("Encapsulated Key (EK) written to ek.key")

    #Generating chachadata
    print("Encryption key is: "+skey)
    
    file_to_enc = None
    if os.path.exists(filename):
        os.stat(filename)
        print("Filesize is: " + str(os.stat(filename).st_size)+ " bytes")

        with SevenZipFile(filename+"_main/"+filename+".7z", 'w', password=skey) as archive:
            archive.writeall(cwd+"/"+filename, filename)
        
        with SevenZipFile(filename+'.enc.7z', 'w') as archive:
            archive.writeall(cwd+"/"+filename+"_main",filename+"_main")
            try:
                shutil.rmtree(cwd+"/"+filename+"_main")
            except OSError as e:
                print ("Error: %s - %s." % (e.filename, e.strerror))
        
    if file_in_cwd:
        os.remove(filename)

    print("Encrypted Data (ED) written to "+filename+".encrypted \nRemember you must send both files to your recipient so they can decrypt it.")
    return "encrypt"


@main.route('/decrypt', methods=['POST'])
def decrypt():
    cwd = os.getcwd()
    file = request.files['file']
    filename = file.filename
    print(f"filename: {filename}")

    file_in_cwd = False
    if not os.path.exists(filename):
        file.save(filename)
        file_in_cwd = True

    with SevenZipFile(filename, mode='r') as z:
        z.extractall()

    ctkey = None
    f = open(filename[:-7]+"_main/ek.key", 'r')
    ctkey = f.read()
    f.close()
    #print("EK File read successfully.")

    #Decrypting Kyber password
    cu = CurrentUser.query.first().user_id
    cUser = User.query.get(cu)
    if cUser==None:
        return "ky_private_key_error"
    else:
        key = cUser.ky_private_key

    print(f"My kyber public key is: {key}")
    decapsulatedkey = Kyber.decapsulate(ctkey, key)
    print("Decryption key:"+decapsulatedkey)
    print("Extracting into: "+ filename[:-7]+"_main/"+filename[:-7]+".7z")
    with SevenZipFile(filename[:-7]+"_main/"+filename[:-7]+".7z", mode='r', password=decapsulatedkey) as z:
        z.extractall(cwd+"/decrypted_"+filename[:-7])
        try:
            shutil.rmtree(cwd+"/"+filename[:-7]+"_main")
            print("Extracted succesfully from try")
        except OSError as e:
            print ("Error: %s - %s." % (e.filename, e.strerror))

    if file_in_cwd:
        os.remove(filename)
    return "decrypted"


@main.route('/verify', methods=['POST'])
def verify():
    file = request.files['file']
    filename = file.filename
    contact_id = request.form.get('id')
    file_in_cwd = False
    if not os.path.exists(filename):
        file.save(filename)
        file_in_cwd = True
    
    contact = Contact.query.get(contact_id)
    print("Filename is: " + filename)
        #print(signedhash)
    cwd = os.getcwd()
    with py7zr.SevenZipFile(filename, 'r') as archive:
        archive.extractall(path=cwd)

    
    #signedhash_filename = input("Signature to verify: ")
    signedhash_filename = filename[:-10]+"_main/signature.txt"
    with open(signedhash_filename) as f:
        signedhash = f.read()
        signedhash = signedhash.strip()
        print(signedhash)

    print(f"Contact: {contact}")
    dil_public_key = contact.dilithium_public_key

    ##CHECKING SIGNATURE
    print("\nVerifying signature...")
    checkedhash = Dilithium.checkmessage(dil_public_key,signedhash)
    try:
        print("Verified hash: "+ checkedhash)
    except:
        shutil.rmtree(filename[:-10]+"_main")
        return "0"

    ##HASHING MESSAGE
    #Optimised file hashing for VERY large files (over 100 Gigabytes)
    filename1 = filename[:-10]+"_main/"+filename[:-10]
    old_filename = filename[:-10]+"_main"
    filename = filename1
    
    os.stat(filename)
    print("Filesize is: " + str(os.stat(filename).st_size)+ " bytes")
    i = 0
    BUF_SIZE = 65536  # Read file in 64kb chunks
    h_obj = blake3()
    with open(filename, 'rb') as f:
        while True:
            data = f.read(BUF_SIZE)
            if not data:
                break
            h_obj.update(data)
            i +=BUF_SIZE
            print("Processed bytes: " + str(i))

    #Hashed result
    hashmessage = str(h_obj.hexdigest())
    print("Output hash: "+ hashmessage)

    print("Checking if "+ checkedhash + " = " + hashmessage)
    if file_in_cwd:
        os.remove(file.filename)
        print("Removed file")
    if checkedhash == None :
        return "0"
    if checkedhash == hashmessage:
        os.rename(old_filename, old_filename+"_verified")
        return "1"
    else :
        return "0"
    
    return "1"


@main.route('/only_sign', methods=['POST'])
def only_sign():
    # filename = request.json['filename']
    _file = request.files['file']
    filename = _file.filename
    file_in_cwd = False
    if not os.path.exists(filename):
        _file.save(filename)
        file_in_cwd = True
        print("file not exists. saving the file.")
    os.stat(filename)
    print("Filesize is: " + str(os.stat(filename).st_size)+ " bytes")

    #Optimised file hashing for VERY large files (over 100 Gigabytes)
    i = 0
    BUF_SIZE = 65536  # Read file in 64kb chunks
    h_obj = blake3()
    with open(filename, 'rb') as f:
        while True:
            data = f.read(BUF_SIZE)
            if not data:
                break
            h_obj.update(data)
            i +=BUF_SIZE
            print("Processed bytes: " + str(i))
    #Hashed result
    hashmessage = str(h_obj.hexdigest())
    print("Output hash: "+ hashmessage)

    cwd = os.getcwd()
    try:
        os.mkdir(cwd+"/"+filename+"_main")
    except:
        # shutil.rmtree(cwd+"/"+filename+"_main")
        # os.mkdir(cwd+"/"+filename+"_main")
        return '0'
    print("MADE: "+cwd+"/"+filename+"_main")

    # getting private key from session
    cu = CurrentUser.query.first().user_id
    cUser = User.query.get(cu)
    if cUser==None:
        return "0"
    else:
        dil_private_key = cUser.dil_private_key

    signedhash = Dilithium.signmessage(dil_private_key,hashmessage)
    print("Signed hash:" + signedhash)
    print("Saving to file 'signature.txt'")
    f = open(cwd+"/"+filename+"_main/signature.txt", 'w')
    f.write(signedhash)
    f.close()
    print("SAVED TO: "+cwd+"/"+filename+"_main/signature.txt")
    print("")
    
    copyfile(filename, cwd+"/"+filename+"_main/"+filename)

    with py7zr.SevenZipFile(filename+".signed.7z", 'w') as archive:
        archive.writeall("./"+filename+"_main")
        try:
            shutil.rmtree(cwd+"/"+filename+"_main")
        except OSError as e:
            print ("Error: %s - %s." % (e.filename, e.strerror))

    # Signing ends here
    if file_in_cwd:
        os.remove(filename)
    return f"{filename}"


