// first container is hidden in layout.html's head section.

$(".checkitem").click(function(){
    var item = $(".checkitem");
    if (item.hasClass("itemactive")){
      // It is activated. Deactivate it!
      item.removeClass("itemactive");
      $(".customcheck").css("background-color", "#d8d8d8")
      $("input[name='switch']").prop("checked", false);
      console.log("Advance mode off");

    //   getting adv container and hiding it.
    $('.adv_container').hide('slow');
    $('.simple_container').show("slow")
    } else {
      // It's deactivated. Activate it!
      item.addClass("itemactive");
      $(".customcheck").css("background-color", "rgba(0,119,182, 0.5)")
      $("input[name='switch']").prop("checked", true);
      
      console.log("Advance mode on");
      //   getting adv container and showing it.
    $('.adv_container').show("slow");
    $('.simple_container').hide("slow")
    }
  });
