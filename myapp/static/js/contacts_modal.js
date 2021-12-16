let main_contacts = document.querySelector(".main_contacts");
let add_contact_btn = document.querySelector("#add_contact_btn");
let add_contact_form = document.querySelector("#add_contact_form");


add_contact_btn.addEventListener("click", showContactsAdditionForm);

function showContactsAdditionForm(){
    console.log("Add contacts btn clicked")
    main_contacts.style.display = "none";
    add_contact_form.style.display = "block";
};

// adding back to contacts list
let contacts_back_btn = document.querySelector("#contacts_back_btn");
contacts_back_btn.addEventListener("click", function(){
    main_contacts.style.display = "block";
    add_contact_form.style.display = "none";
});


// edit contact form
let edit_contact_form = document.querySelector("#edit_contact_form");
function showEditForm(e){
    edit_contact_form.style.display = "block"
    main_contacts.style.display = "none";
    add_contact_form.style.display = "none";

    // getting contact values
    id = e.nextElementSibling.value;
    contact_name = e.innerText;
    ky_pub_key = e.nextElementSibling.nextElementSibling.value
    dil_pub_key = e.nextElementSibling.nextElementSibling.nextElementSibling.value
    address = e.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling.value

    // setting values in edit form
    document.querySelector("#ed_name").value = contact_name;
    document.querySelector("#ed_kp").value = ky_pub_key;
    document.querySelector("#ed_dp").value = dil_pub_key;
    document.querySelector("#ed_address").value = address;
    document.querySelector("#edit_contact_id").value = id;
    console.log(`id: ${id}, name: ${contact_name}, pub_key: ${ky_pub_key}`);
}

// edit form back button
let edit_back_btn = document.querySelector("#edit_back_btn");
edit_back_btn.addEventListener("click", function(){
    edit_contact_form.style.display = "none"
    main_contacts.style.display = "block";
    add_contact_form.style.display = "none";
});


// deleting contacts
let delete_btn = document.querySelector("#delete_btn");
delete_btn.addEventListener("click", deleteContact)

function deleteContact(){
    if (confirm('Are you sure you want to delete contacts from database?')) {
        // Save it!
        let delete_form_btn = document.querySelector("#submit_deletion_id");
        delete_form_btn.click()
      } else {
        // Do nothing!
        console.log('canceled');
      }
    
};


