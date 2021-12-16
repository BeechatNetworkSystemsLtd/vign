// Selecting all required elements
const dropArea = document.querySelector(".drag-area");

let sign_button = document.querySelector("#sign_browse_button");
let sign_file = document.querySelector("#sign_browse_file");

let Sfile; // global file variable

// when user clicks on browse button
sign_button.addEventListener("click", ()=>{
  sign_file.click();
});

// when file added
sign_file.addEventListener("change", function(){
  Sfile = this.files[0];
  console.log(Sfile)
  let txt = "File '" + Sfile.name + "' Selected";
  document.querySelector(".sign_header").innerText = txt;
  show_sign_button();
});

// If user drag file over Drop Area
dropArea.addEventListener("dragover", (event)=>{
  event.preventDefault();
  // console.log('Drop over')
});

// If user leave dragged file from Drop Area
dropArea.addEventListener("dragleave", ()=>{
  console.log('File is outside from drag area')
});

// If user drop file on Drag Area
dropArea.addEventListener("drop", (event)=>{
  event.preventDefault();
  // console.log('File is dropped in drop area');
  Sfile = event.dataTransfer.files[0]
  console.log(Sfile)
  file_name = Sfile.name
  let txt = "File '" + file_name + "' Selected";
  document.querySelector(".sign_header").innerText = txt;
  show_sign_button();
});

function show_sign_button(){
  let sign_button = document.querySelector("#sign_browse_button");
  let sign_file = document.querySelector("#sign_browse_file");
  let icon = document.querySelector('.icon');
  let _or = document.querySelector('.or');
  
  sign_button.style.display = 'none';
  sign_file.style.display = 'none';
  icon.style.display = 'none';
  _or.style.display = 'none';

  let sign = document.querySelector("#sign");
  sign.style.display = 'block'

  // Raise popup to select contact
  let enc_show_contacts_btn = document.querySelector("#enc_sign_show_contacts_btn");
  // clicking to raising contacts popup
  enc_show_contacts_btn.click()
}

// when a contact is selected from contacts popup
let enc_contact_selected = false
let enc_contact_id = ''
function SelectContact(cid){
  
  enc_contact_selected = true;

  // closing modal
  document.querySelector("#enc_sign_contacts_close_btn").click()
  enc_contact_id = cid
  console.log("id: "+ enc_contact_id)

}


// sign button event to sign files
let sign = document.querySelector("#sign");
sign.addEventListener("click", function(){
  console.log(Sfile.name)
  if (enc_contact_selected==true){
    // show loading gif
    $('.pacman_sign').show()
    const signRequest = new XMLHttpRequest();

    signRequest.open('POST', '/encrypt_and_sign', true)
  
    // query = JSON.stringify({'filename': Sfile.name,
    //  'cid': enc_contact_id})
    
    esForm = new FormData();
    esForm.append("file", Sfile)
    esForm.append("cid", enc_contact_id)
    signRequest.send(esForm);


    signRequest.onload = function(){
      let rtext = this.responseText;
      console.log(rtext)
      if (rtext=="0"){
        alert("Please add your keys file first!")
      }else{
        raw = rtext.split('.', 2)
        raw_file = raw[0] + '.' + raw[1]
        signed_file = rtext + '.signed.7z' 
        $('.file_status').text('"' + raw_file + '"' + ' has been encrypted and signed as ' + '"' + signed_file + '"');
        $('.file_status').show()
        showExport();
      }
      
    };
  
  }else{
    alert("Please select a contact first")
    // Raise popup to select contact
    let enc_show_contacts_btn = document.querySelector("#enc_sign_show_contacts_btn");
    // clicking to raising contacts popup
    enc_show_contacts_btn.click()
  }

});

function showExport(){
  // hiding loading gif
  $('.pacman_sign').hide()

  // hiding filename and sign button
  let filename = document.querySelector(".sign_header");
  let sign_button = document.querySelector("#sign");
  filename.style.display = 'none';
  sign_button.style.display = 'none';
  

  // showing finish button
  document.querySelector("#finish").style.display = 'inline';

};


