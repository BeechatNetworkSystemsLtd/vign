// Selecting all required elements
const dropArea2 = document.querySelector(".drag-area2");

let sign_button2 = document.querySelector("#sign_browse_button2");
let sign_file2 = document.querySelector("#sign_browse_file2");
let file;
// when user clicks on browse button
sign_button2.addEventListener("click", ()=>{
  sign_file2.click();
});

// when file added
sign_file2.addEventListener("change", function(){
  file = this.files[0];
  let txt = "File '" + file.name + "' Selected";
  document.querySelector(".sign_header2").innerText = txt;
  showContactsPopup();
});

// If user drag file over Drop Area
dropArea2.addEventListener("dragover", (event)=>{
  event.preventDefault();
  console.log('Drop over')
});

// If user leave dragged file from Drop Area
dropArea2.addEventListener("dragleave", ()=>{
  console.log('File is outside from drag area')
});

// If user drop file on Drag Area
dropArea2.addEventListener("drop", dropIt);

function dropIt(event){
    event.preventDefault();
  file = event.dataTransfer.files[0]
  file_name = file.name
  let txt = "File '" + file.name + "' Selected";
  document.querySelector(".sign_header2").innerText = txt;
  showContactsPopup();
}


function showContactsPopup(){
  let show_contacts_btn = document.querySelector("#show_contacts_btn");
  show_contacts_btn.click()
  showVerifyButton();
}

let contact_selected = false
let contact_id = ''
function selectContact(id){
  contact_selected = true;

  // closing modal
  document.querySelector("#contacts_close_btn").click()
  contact_id = id
  console.log(id)
}

function showVerifyButton(){
    let sign_button = document.querySelector("#sign_browse_button2");
    sign_button.style.display = 'none';
    let the_or_btn = document.querySelector(".or2");
    the_or_btn.style.display = "none";
    let verify_btn = document.querySelector("#verify_btn");
    verify_btn.style.display = 'block';

};

// adding event listener on verify button
let verify_btn = document.querySelector("#verify_btn");
verify_btn.addEventListener("click", verifyIt);

function verifyIt(){
  if (contact_selected==false){
    alert("Please select a contact first");
    // invoking contacts list again
    showContactsPopup();
  }else{
  const verify = new XMLHttpRequest();
  verify.open("POST", "/verify", true);

  // verify.setRequestHeader("Content-Type", "application/json");

  vForm = new FormData();
  vForm.append("file", file)
  vForm.append("id", contact_id)
  for (var key of vForm.entries()){
    console.log(key)
  }
  verify.send(vForm);

  verify.onprogress = function(){
    console.log("Verification Started!");
  }

  verify.onload = function(){
    let resp = this.responseText;
    let result = document.querySelector("#verification_result");
    console.log(resp);
    if (resp=="dil_error"){
        alert("Please upload your Keys first!")
    }else if (resp=='0'){
      console.log("Verifcation Unsuccesfull!");
      result.innerHTML = "Verification Failed";
    }else if (resp=='1'){
      console.log("Verification Successfull.")
      result.innerHTML = "Verification Successful";
      alert("File has been verified and saved.")
    };
  };

  }//else end here


};
