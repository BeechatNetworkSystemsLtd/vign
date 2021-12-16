// Selecting all required elements
const vd_dropArea = document.querySelector(".vd_drag-area");

let vd_button = document.querySelector("#vd_browse_button");
let vd_file = document.querySelector("#vd_browse_file");

let VDfile; // global file variable

// when user clicks on browse button
vd_button.addEventListener("click", ()=>{
  vd_file.click();
});

// when file added
vd_file.addEventListener("change", function(){
  VDfile = this.files[0];
  console.log(VDfile)
  let txt = "File '" + VDfile.name + "' Selected";
  document.querySelector(".vd_header").innerText = txt;
  show_vd_button();
});

// If user drag file over Drop Area
vd_dropArea.addEventListener("dragover", (event)=>{
  event.preventDefault();
  // console.log('Drop over')
});


// If user drop file on Drag Area
vd_dropArea.addEventListener("drop", (event)=>{
  event.preventDefault();
  // console.log('File is dropped in drop area');
  VDfile = event.dataTransfer.files[0]
  console.log(VDfile)
  file_name = VDfile.name
  let txt = "File '" + file_name + "' Selected";
  document.querySelector(".vd_header").innerText = txt;
  show_vd_button();
});

function show_vd_button(){
  let vd_button = document.querySelector("#vd_browse_button");
  let vd_file = document.querySelector("#vd_browse_file");
  let icon = document.querySelector('.vd_icon');
  let _or = document.querySelector('.vd_or');
  
  vd_button.style.display = 'none';
  vd_file.style.display = 'none';
  icon.style.display = 'none';
  _or.style.display = 'none';

  let vd = document.querySelector("#v_d");
  vd.style.display = 'block'

  // Raise popup to select contact
  let vd_contacts_btn = document.querySelector("#vd_show_contacts_btn");
  // clicking to raising contacts popup
  vd_contacts_btn.click()
}

// when a contact is selected from contacts popup
let vd_contact_selected = false
let vd_contact_id = ''
function SelectVDContact(cid){
  
  vd_contact_selected = true;

  // closing modal
  document.querySelector("#vd_contacts_close_btn").click()
  vd_contact_id= cid
}


// button for verify and decrypt the file
let vd = document.querySelector("#v_d");
vd.addEventListener("click", function(){
  console.log(VDfile.name)
  if (vd_contact_selected==true){
    // show loading gif
    $('.pacman_vd').show()
    const signRequest = new XMLHttpRequest();

    signRequest.open('POST', '/verify_and_decrypt', true)
  
    // query = JSON.stringify({'filename': VDfile.name,
    //  'id': vd_contact_id})

    vdForm = new FormData();
    vdForm.append("file", VDfile);
    vdForm.append("id", vd_contact_id)
    signRequest.send(vdForm);
    


    signRequest.onload = function(){
      let rtext = this.responseText;
      console.log(rtext)
      if (rtext=="0"){
        alert("Public key error!")
      }else{
        $('.vd_file_status').text(VDfile.name + ' has been verified and decrypted.');
        $('.vd_file_status').show()
        showVDExport();
      }
      
    };
  
  }else{
    alert("Please select a contact first")
    // Raise popup to select contact
    let vd_contacts_btn = document.querySelector("#vd_show_contacts_btn");
    // clicking to raising contacts popup
    vd_contacts_btn.click()
  }
  

});

function showVDExport(){
  // hiding loading gif
  $('.pacman_vd').hide()

  // hiding filename and sign button
  let filename = document.querySelector(".vd_header");
  let vd_button = document.querySelector("#v_d");
  filename.style.display = 'none';
  vd_button.style.display = 'none';
  
};


