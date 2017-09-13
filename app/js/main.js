$(document).ready(function() {
  $(".select__current").click(function() {
    $(this).closest(".select").toggleClass("open");
  });

  $(".select__dropdown").click(function() {
    $(this).closest(".select").toggleClass("open");
  });

  $("body").on("click", ".select.open li", function() {
    var $sel = $(this).closest(".select.open");
    $sel.find(".select__current").text($(this).text());
    $sel.find("option").attr("selected", false);
    $sel.find("option[value="+$(this).data("value")+"]").attr("selected", "selected");
    $sel.toggleClass("open");
  });

  $(document).mouseup(function(e) {
    if($(e.target).closest(".select.open").length <= 0){
      $(".select.open").toggleClass("open");
    }
  });

  $(".header .hamburger").click(function() {
    $("body").toggleClass("open-menu");
  });

  $(".header .nav__close").click(function() {
    $("body").toggleClass("open-menu");
  });

});