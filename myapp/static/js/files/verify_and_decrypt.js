// this file is linked with templates/sections/file_receiving.html

// opening the contacts popup to select contact
$('.vd_btn').click(function(){
    $('#vd_contacts_btn').click();
});

function SelectContact_verifyDecrypt(id){
    let filename = sessionStorage.getItem("vd_filename");
    sessionStorage.removeItem("vd_filename");
    $('#vd_contacts_close').click();
    verify_and_decrypt(filename, id);
};

// send request to verify and decrypt the file.
function verify_and_decrypt(filename, id){
    // sending a request to verify and decrypt the file.
    const verify = new XMLHttpRequest();
    verify.open('POST', '/verify_and_decrypt', true);
    verify.setRequestHeader('Content-type', 'application/json');
    query = JSON.stringify({'filename': filename, 'id': id})
    verify.send(query)

    verify.onprogress = function(){
        // alert("verifying and decrypting the file!")
        if (this.responseText=="verify and decrypted"){
            alert("File has been verified and encrypted successfully.")
        }else if(this.responseText=="vfailed"){
            alert("Verifcation Failed!");
        }else if (this.responseText=="dfailed"){
            alert("Verification completed but decryption failed!");
        }
        $('.dsm').click();
    }

    verify.onload = function(){
        // checking the verification is successfull or not
        let res = this.responseText;
        console.log(res)
    };
};

