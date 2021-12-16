

dg = 180
let dd_btn = document.querySelector('.dd_btn');
dd_btn.addEventListener('click', toggleDropDown);

function toggleDropDown(){
  let dd_div = document.querySelector('.dd');
  console.log(dd_div.style.display)
  if (dd_div.style.display == 'none'){
    dd_div.style.display = 'flex';
  }else{
    dd_div.style.display = 'none';
  }

  // rotating circle icon
  document.querySelector('.ac_circle').style.transform = `rotate(${dg}deg)`
  dg += 180

};

// sending xhr request for changing user
function changeUser(id){
  const ChangeUser = new XMLHttpRequest();
  ChangeUser.open("POST", "/change_user", true);
  ChangeUser.setRequestHeader("Content-type", "application/json")
  query = JSON.stringify({'id': id})
  ChangeUser.send(query)

  ChangeUser.onload = function(){
    window.location.reload();
  };
};




