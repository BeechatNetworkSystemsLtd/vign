// Selecting all required elements
const enc_drag_area = document.querySelector(".encryption_drag-area");

let enc_sign_button = document.querySelector("#encryption_sign_browse_button");
let enc_sign_file = document.querySelector("#encryption_sign_browse_file");
let enc_file;
// when user clicks on browse button
enc_sign_button.addEventListener("click", ()=>{
    enc_sign_file.click();
});

// when file added
enc_sign_file.addEventListener("change", function(){
  enc_file = this.files[0];
  console.log(enc_file)
  let txt = "File '" + enc_file.name + "' Selected";
  document.querySelector(".encryption_sign_header").innerText = txt;
  show_enc_pub();
});

// If user drag file over Drop Area
enc_drag_area.addEventListener("dragover", (event)=>{
  event.preventDefault();
  console.log('Drop over')
});

// If user leave dragged file from Drop Area
enc_drag_area.addEventListener("dragleave", ()=>{
  console.log('File is outside from drag area')
});

enc_drag_area.addEventListener("drop", (event)=>{
  event.preventDefault();
  enc_file = event.dataTransfer.files[0]
  console.log(enc_file)
  let txt = "File '" + enc_file.name + "' Selected";
  document.querySelector(".encryption_sign_header").innerText = txt;
  show_enc_pub();
});


function show_enc_pub(){
  let enc_button = document.querySelector("#encryption_sign_browse_button");
  let enc_file = document.querySelector("#encryption_sign_browse_file");
  let enc_icon = document.querySelector('.encryption_icon');
  let enc_or = document.querySelector('.encryption_or');
  
  enc_button.style.display = 'none';
  enc_file.style.display = 'none';
  enc_icon.style.display = 'none';
  enc_or.style.display = 'none';

 
  let enc_show_contacts_btn = document.querySelector("#enc_show_contacts_btn");
  // clicking to raising popup
  enc_show_contacts_btn.click()
  showEncBtn();
}


let enc_contact_selected2 = false
let enc_contact_id2 = ''
function encContact(id){
  enc_contact_selected2 = true;

  // closing modal
  document.querySelector("#enc_contacts_close_btn").click()
  enc_contact_id2 = id
  console.log("id: "+ enc_contact_id)
  
}



function showEncBtn(){
    // enc_div.style.display = 'none';
    let pub_key = document.querySelector("#encrypt_btn");
    pub_key.style.display = 'block';
};

// adding event listener to encryption button
let enc_it_btn = document.querySelector("#encrypt_btn");
enc_it_btn.addEventListener("click", encryptIt);






function encryptIt(){
  const encrypt = new XMLHttpRequest();
  encrypt.open("POST", "/encrypt", true);

  // encrypt.setRequestHeader("Content-Type", "application/json");
  // console.log("contact id is: " + enc_contact_id2)
  // query = JSON.stringify({ "myname": enc_contact_id2, 
  // "filename": enc_file.name})

  encForm = new FormData();
  encForm.append("file", enc_file)
  encForm.append("enc_cid", enc_contact_id2)
  encrypt.send(encForm)

  encrypt.onprogress = function(){
    console.log("Encryption Started!");
  }

  encrypt.onload = function(){
    let resp = this.responseText;
    let respcode = this.status;
    if (respcode == 200){
      console.log(resp);
    alert("File Encrypted successfully");
    window.location.reload();
    }else{
      console.log(this.status)
      alert("Problem!")
    }
    
  };


};

