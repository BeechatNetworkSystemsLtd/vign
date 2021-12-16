// Selecting all required elements
const sm_dropArea = document.querySelector(".only_drag-area");

let sm_sign_button = document.querySelector("#sm_sign_browse_button");
let sm_sign_file = document.querySelector("#sm_sign_browse_file");

let SignFile; // global file variable

// when user clicks on browse button
sm_sign_button.addEventListener("click", ()=>{
  sm_sign_file.click();
});

// when file added
sm_sign_file.addEventListener("change", function(){
  SignFile = this.files[0];
  console.log(SignFile)
  let txt = "File '" + SignFile.name + "' Selected";
  document.querySelector(".sm_sign_header").innerText = txt;
  sm_show_sign_button();
});

// If user drag file over Drop Area
sm_dropArea.addEventListener("dragover", (event)=>{
  event.preventDefault();
});

// If user leave dragged file from Drop Area
sm_dropArea.addEventListener("dragleave", ()=>{
  console.log('File is outside from drag area')
});

// If user drop file on Drag Area
sm_dropArea.addEventListener("drop", (event)=>{
  event.preventDefault();
  SignFile = event.dataTransfer.files[0]
  console.log(SignFile)
  file_name = SignFile.name
  let txt = "File '" + file_name + "' Selected";
  document.querySelector(".sm_sign_header").innerText = txt;
  sm_show_sign_button();
});

function sm_show_sign_button(){
  let sm_sign_button = document.querySelector("#sm_sign_browse_button");
  let sm_sign_file = document.querySelector("#sm_sign_browse_file");
  let sm_icon = document.querySelector('.sm_icon');
  let sm__or = document.querySelector('.sm_or');
  
  sm_sign_button.style.display = 'none';
  sm_sign_file.style.display = 'none';
  sm_icon.style.display = 'none';
  sm__or.style.display = 'none';

  let sm_sign = document.querySelector("#sm_sign");
  sm_sign.style.display = 'block'
}

// sign button event to sign files
let sm_sign = document.querySelector("#sm_sign");
sm_sign.addEventListener("click", function(){

    // show loading gif
    $('.pacman_sign').show()
    const signRequest = new XMLHttpRequest();

    signRequest.open('POST', '/only_sign')
    // signRequest.setRequestHeader("Content-type", "multipart/form-data");
    // query = JSON.stringify({'filename': SignFile.name})
    afm = new FormData();
    afm.append("file", SignFile)
    console.log(SignFile)
    for (var key of afm.entries()){
      console.log(key)
    }
    signRequest.send(afm);


  
    signRequest.onload = function(){
      let rtext = this.responseText;
      console.log(rtext)
      if (rtext=='0'){
        $('#sm_finish').show();
        $('.sm_file_status').text('signing failed. maybe the file exists already or you have not created your keys.');
        $('.sm_file_status').show()
        // hiding loading gif
        $('.pacman_sign').hide()
        // hiding filename and sign button
        let filename = document.querySelector(".sm_sign_header");
        let sm_sign_button = document.querySelector("#sm_sign");
        filename.style.display = 'none';
        sm_sign_button.style.display = 'none';
      }else{
        signed_file = rtext 
        $('.sm_file_status').text('"' + signed_file + '"' + ' has been signed.');
        $('.sm_file_status').show()
        sm_showExport();
      }

    };  

});

function sm_showExport(){
  // hiding loading gif
  $('.pacman_sign').hide()

  // hiding filename and sign button
  let filename = document.querySelector(".sm_sign_header");
  let sm_sign_button = document.querySelector("#sm_sign");
  filename.style.display = 'none';
  sm_sign_button.style.display = 'none';
  
  $('#sm_finish').show();
  
};



