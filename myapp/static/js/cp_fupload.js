// add contact form 
let paste_kypub_icon = document.querySelector(".paste_kypub");
let ky_input_bar = document.querySelector("#kp");

let upload_keys = document.querySelector(".upload_keys");
let keys_file = document.querySelector("#keys_file");
upload_keys.addEventListener("click", function(){
    keys_file.click();
})

keys_file.addEventListener("change", function(){
  var file_to_read = this.files[0];
  var fileread = new FileReader();
  fileread.onload = function(e) {
    var content = e.target.result;
    // console.log(content);
    var intern = JSON.parse(content); // Array of Objects.
    //console.log(intern); // You can index every object
    let dp = intern['Dp']
    let kp = intern['Kp']
    document.querySelector("#kp").value = kp;
    document.querySelector("#dp").value = dp;


  };
  fileread.readAsText(file_to_read);
})

// Edit contact form

let edit_upload_keys = document.querySelector(".upload_edit_keys");
let edit_keys_file = document.querySelector("#edit_keys_file");
edit_upload_keys.addEventListener("click", function(){
  edit_keys_file.click();
})

edit_keys_file.addEventListener("change", function(){
    // console.log(this.files[0])
  var file_to_read = this.files[0];
  var fileread = new FileReader();
  fileread.onload = function(e) {
    var content = e.target.result;
    // console.log(content);
    var intern = JSON.parse(content); // Array of Objects.
    let dp = intern['Dp']
    let kp = intern['Kp']
    document.querySelector("#ed_kp").value = kp;
    document.querySelector("#ed_dp").value = dp;


  };
  fileread.readAsText(file_to_read);
})

// copying data through clipboard.js
new ClipboardJS('.copy_ky_pub');

new ClipboardJS('.copy_dil_pub');

new ClipboardJS('.copy_address');



// Search feature
let s_icon = document.querySelector("#search-addon");
let search_box = document.querySelector("#search_box");

s_icon.addEventListener("click", function(){
  let val = search_box.value;
  
    console.log(val)
    // getting all the names
    let all_persons = document.querySelectorAll(".p_name");
    // console.log(all_persons)
    for (let index = 0; index < all_persons.length; index++) {
      let element = all_persons[index];
      if (element.innerHTML.toLowerCase().includes(val)){
        console.log(`found: ${val} in ${element.innerText}`)
        element.parentNode.parentNode.style.display = 'block'
        element.parentNode.parentNode.nextElementSibling.style.display = 'block'
      }else{
        element.parentNode.parentNode.style.display = 'none'
        element.parentNode.parentNode.nextElementSibling.style.display = 'none'
        
      }
      
    }
  
  
})

