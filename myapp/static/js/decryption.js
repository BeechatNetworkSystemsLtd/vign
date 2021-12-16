// Selecting all required elements
const Dc_dropArea = document.querySelector(".decryption_drag-area");

let dc_sign_button = document.querySelector("#decryption_sign_browse_button");
let dc_sign_file = document.querySelector("#decryption_sign_browse_file");

let Dfile; // global file variable

// when user clicks on browse button
dc_sign_button.addEventListener("click", ()=>{
    dc_sign_file.click();
});

// when file added
dc_sign_file.addEventListener("change", function(){
  Dfile = this.files[0];
  console.log(Dfile)
  let txt = "File '" + Dfile.name + "' Selected";
  document.querySelector(".decryption_sign_header").innerText = txt;
  show_decryption_button();
});

// If user drag file over Drop Area
Dc_dropArea.addEventListener("dragover", (event)=>{
  event.preventDefault();
  console.log('Drop over decryption area')
});

// If user leave dragged file from Drop Area
Dc_dropArea.addEventListener("dragleave", ()=>{
  console.log('File is outside from decryption area')
});

// If user drop file on Drag Area
Dc_dropArea.addEventListener("drop", (event)=>{
  event.preventDefault();
  // console.log('File is dropped in drop area');
  Dfile = event.dataTransfer.files[0]
  console.log(Dfile)
  file_name = Dfile.name
  let txt = "File '" + file_name + "' Selected";
  document.querySelector(".decryption_sign_header").innerText = txt;
  show_decryption_button();
});

function show_decryption_button(){
  let dc_sign_button = document.querySelector("#decryption_sign_browse_button");
  let dc_sign_file = document.querySelector("#decryption_sign_browse_file");
  let dc_icon = document.querySelector('.decryption_icon');
  let dc_or = document.querySelector('.decryption_or');
  
  dc_sign_button.style.display = 'none';
  dc_sign_file.style.display = 'none';
  dc_icon.style.display = 'none';
  dc_or.style.display = 'none';

  let decrypt = document.querySelector("#decryption_btn");
  decrypt.style.display = 'block'
}


// sign button event to sign files
let decrypt = document.querySelector("#decryption_btn");
decrypt.addEventListener("click", function(){
  console.log(Dfile.name)
  const dc_Request = new XMLHttpRequest();

  dc_Request.open('POST', '/decrypt', true)

  decForm = new FormData();
  decForm.append("file", Dfile);
  dc_Request.send(decForm);


  dc_Request.onload = function(){
    let rtext = this.responseText;
    console.log(rtext);
    if (rtext=="ky_private_key_error"){
        alert("Upload your keys to decrypt this file!")
    }else if (this.status == 200){
        alert("File Decrypted Successfully.");
        window.location.reload();
    }else{
        alert("Failed to decrypt file!")
    }    
  };
  

});


