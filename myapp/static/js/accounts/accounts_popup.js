// Opening menu, getting "pencil_icon" from drop_down.html
$('.pencil_icon').click(function(){
  $('.user_menu_btn').click();
  $('.dd_btn').click();
});


let ac_main_contacts = document.querySelector(".ac_main_contacts");
let ac_add_contact_btn = document.querySelector("#ac_add_contact_btn");
let ac_add_contact_form = document.querySelector("#ac_add_contact_form");


ac_add_contact_btn.addEventListener("click", showContactsAdditionForm);

function showContactsAdditionForm(){
    console.log("Add contacts btn clicked")
    ac_main_contacts.style.display = "none";
    ac_add_contact_form.style.display = "block";
};

// adding back to contacts list
let ac_contacts_back_btn = document.querySelector("#ac_contacts_back_btn");
ac_contacts_back_btn.addEventListener("click", function(){
    ac_main_contacts.style.display = "block";
    ac_add_contact_form.style.display = "none";
});


// edit contact form
let ac_edit_contact_form = document.querySelector("#ac_edit_contact_form");
function ac_showEditForm(id, username, k_pub, k_pi, d_pub, d_pi, address){
    ac_edit_contact_form.style.display = "block"
    ac_main_contacts.style.display = "none";
    ac_add_contact_form.style.display = "none";

    // getting contact values
    console.log("id is" + id)
    contact_name = username;

    // setting values in edit form
    document.querySelector("#ac_name_ed").value = contact_name;
    document.querySelector("#ac_ki_ed").value = k_pi;
    document.querySelector("#ac_kp_ed").value = k_pub;
    document.querySelector("#ac_di_ed").value = d_pi;
    document.querySelector("#ac_dp_ed").value = d_pub;
    document.querySelector("#ac_address_ed").value = address;
    document.querySelector("#ac_edit_contact_id").value = id;
    console.log(`id: ${id}, name: ${contact_name}, pub_key: ${k_pub}`);
}

// edit form back button
let ac_edit_back_btn = document.querySelector("#ac_edit_back_btn");
ac_edit_back_btn.addEventListener("click", function(){
    ac_edit_contact_form.style.display = "none"
    ac_main_contacts.style.display = "block";
    ac_add_contact_form.style.display = "none";
});


// deleting contacts
let ac_delete_btn = document.querySelector("#ac_delete_btn");
ac_delete_btn.addEventListener("click", ac_deleteUser)

function ac_deleteUser(){
    if (confirm('Are you sure you want to delete User(s) from database?')) {
        // Save it!
        let ac_delete_form_btn = document.querySelector("#ac_submit_deletion_id");
        ac_delete_form_btn.click()
      } else {
        // Do nothing!
        console.log('canceled');
      }
    
};


// Reset form when click on add account btn
$('#ac_add_contact_btn').click(function(){
  document.querySelector('#account_addition_form').reset();
});


// generating private key, kyber
$('.kpi').click(function(){
  const GenKpi = new XMLHttpRequest();
  GenKpi.open('POST', '/generate_kpi', true);
  GenKpi.setRequestHeader("Content-type", "application/json");
  query = JSON.stringify({'dp_val': $('#ac_dp').val()});
  GenKpi.send(query)

  GenKpi.onload = function(){
    let resp = JSON.parse(this.responseText);
    let ki = resp['Ki'];
    let kp = resp['Kp'];
    address = resp['address']
    // console.log(ki)
    $('#ac_ki').val(ki);
    $('#ac_kp').val(kp);
    $('#c_address').val(address);
  };


});


// generating private key, Dilithium
$('.dpi').click(function(){
  const GenDpi = new XMLHttpRequest();
  GenDpi.open('POST', '/generate_dpi', true);
  GenDpi.setRequestHeader("Content-type", "application/json");
  query = JSON.stringify({'kp_val': $('#ac_kp').val()});
  GenDpi.send(query)

  GenDpi.onload = function(){
    let resp = JSON.parse(this.responseText);
    let di = resp['Di'];
    let dp = resp['Dp'];
    let address = resp['address']
    $('#ac_di').val(di);
    $('#ac_dp').val(dp);
    $('#c_address').val(address);
  };

});


// Uploading accounts file when folder+ icon clicks
$('.ac_upload_keys').click(function(){
  console.log("folder clicked");  
  $('#ac_keys_file').click();
});

let account_keys_file = document.querySelector("#ac_keys_file");
account_keys_file.addEventListener("change", function(){

  console.log(this.files[0])
  var file_to_read = this.files[0];
  var fileread = new FileReader();
  fileread.onload = function(e) {
    var content = e.target.result;

    var intern = JSON.parse(content); // Array of Objects.
    let dp = intern['Dp']
    let kp = intern['Kp']
    let ki = intern['Ki']
    let di = intern['Di']
    let name = intern['Account_name']
    document.querySelector("#ac_ki").value = ki;
    document.querySelector("#ac_di").value = di;
    document.querySelector("#ac_kp").value = kp;
    document.querySelector("#ac_dp").value = dp;
    document.querySelector("#name").value = name;
  };
  fileread.readAsText(file_to_read);
});


// Exporting public keys of selected contacts
$("#exp_sel_pub_key").click(function(){
  let $chkBoxes = $("input:checkbox[name=delete_id]:checked");
  if ($chkBoxes.length==0){
    alert("Please select atleast one account!")
  }else{
    $chkBoxes.each(function(){
    let address = $(this).next().next().val();
    let filename = $(this).next().text().trim() + '-' + address + '.json';
    console.log('filename: ' + filename)
    SavePubKeys($(this).val(), filename);
  });
  }
  
});

// sending to myapp/keys/routes.py
function SavePubKeys(_id, filename){
  const spk = new XMLHttpRequest();
  spk.open("POST", '/get_public_keys', true);
  spk.setRequestHeader("Content-type", "application/json");
  query = JSON.stringify({'id': _id});
  spk.send(query);

  spk.onload = function(){
    let res = this.responseText;
    let fileName = filename;

    let fileToSave = new Blob([res], {
        type: 'application/json',
        name: fileName
    });

    window.saveAs(fileToSave, fileName);
  };
}


// Exporting private keys of selected contact
$("#exp_sel_pvt_key").click(function(){
  let $chkBoxes = $("input:checkbox[name=delete_id]:checked");
  // console.log($chkBoxes);
  if ($chkBoxes.length==0){
    alert("Please select atleast one account!")
  }else{
    $chkBoxes.each(function(){
    SavePvtKeys($(this).val());
  });
  }
});

function SavePvtKeys(_id){
  const spk = new XMLHttpRequest();
  spk.open("POST", '/get_private_keys', true);
  spk.setRequestHeader("Content-type", "application/json");
  query = JSON.stringify({'id': _id});
  spk.send(query);

  spk.onload = function(){
    let res = this.responseText;
    let fileName = 'private_keys.json';

    // console.log(res)
    let fileToSave = new Blob([res], {
        type: 'application/json',
        name: fileName
    });

    window.saveAs(fileToSave, fileName);
  };
};


// Exporting private keys and contacts
$("#exp_sel_all_data").click(function(){
  let $chkBoxes = $("input:checkbox[name=delete_id]:checked");
  if ($chkBoxes.length==0){
    alert("Please select atleast one account!")
  }else{
    $chkBoxes.each(function(){
    SavePvtKeys_Contacts($(this).val());
  });
  }
});

function SavePvtKeys_Contacts(_id){
  const spk = new XMLHttpRequest();
  spk.open("POST", '/get_private_keys_contacts', true);
  spk.setRequestHeader("Content-type", "application/json");
  query = JSON.stringify({'id': _id});
  spk.send(query);

  spk.onload = function(){
    let res = this.responseText;
    let fileName = 'private keys and contacts.json';

    // console.log(res)
    let fileToSave = new Blob([res], {
        type: 'application/json',
        name: fileName
    });

    window.saveAs(fileToSave, fileName);
  };
};
