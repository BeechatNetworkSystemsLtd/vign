import sys
sys.path.append('./')

from myapp.keys import pydilithium_aes;

# Step 1: Create keys
def createkeys():
    pydilithium_aes.pqcrystals_dilithium2_ref_keypair()
    return(pydilithium_aes.pqcrystals_get_sk(),pydilithium_aes.pqcrystals_get_pk())


# Step 2: Sign message
def signmessage(sk,message):
    pydilithium_aes.pqcrystals_set_sk(sk)
    signed_message = pydilithium_aes.pqcrystals_dilithium2_ref(message, len(message))
    return(signed_message)


# Step 3: Check message
def checkmessage(pk,message):
    pydilithium_aes.pqcrystals_set_pk(pk)
    check = pydilithium_aes.pqcrystals_dilithium2_ref_open(message, len(message))
    return(check)
