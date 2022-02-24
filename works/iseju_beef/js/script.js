$(document).ready(function () {
  // AOS ANIMATION
  AOS.init({
    duration: 500,
    easing: 'ease-in-out',
    anchorPlacement: 'center-bottom'
  });

  $(window).on('load resize', function () {
    AOS.refresh();
  });  
});