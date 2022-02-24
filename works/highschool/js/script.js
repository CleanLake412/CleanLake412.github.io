$(document).ready(function () {
  // variables
  var $menu_btn = $('.menu_btn');
  var $nav = $('nav');
  var $menu_wrap = $('.menu_wrap');


  // toggle menu 
  $menu_btn.on('click', function() {
    if($menu_wrap.hasClass('hide')) {
      $menu_wrap.removeClass('hide');
      $menu_wrap.addClass('show');
    }
    else {
      $menu_wrap.removeClass('show');
      $menu_wrap.addClass('hide');
    }
  });

  $('.sp_nav > ul > li > a').on('click', function() {
    $(this).parent().addClass('is_active');
    $(this).parent().siblings().removeClass('is_active');
  })

  // fullpage customization
  $('#fullpage').fullpage({
    sectionsColor: ['#B8AE9C', '#348899', '#F2AE72', '#5C832F', '#B8B89F','#B8AE9C', '#348899', '#F2AE72', '#5C832F', '#B8B89F'],
    sectionSelector: '.vertical-scrolling',
    slideSelector: '.horizontal-scrolling',
    navigation: false,
    slidesNavigation: true,
    setResponsive: false,
    controlArrows: false,
    verticalCentered: false,
    scrollOverflow: true,
    anchors: ['firstSection', 'secondSection', 'thirdSection', 'fourthSection', 'fifthSection', 'sixthSection', 'seventhSection', 'eighthSection', 'ninthSection', 'tenthSection'],
    menu: '#menu',

    afterLoad: function (anchorLink, index) {     
      if (index == 10) {
        $('#moveDown').hide();
      }
    },

    onLeave: function (index, nextIndex, direction) {
      if (index == 10) {
        $('#moveDown').show();
      }
    },

    afterSlideLoad: function (anchorLink, index, slideAnchor, slideIndex) {
      if (anchorLink == 'fifthSection' && slideIndex == 1) {
        $.fn.fullpage.setAllowScrolling(false, 'up');
       
      }
    },

    onSlideLeave: function (anchorLink, index, slideIndex, direction) {
      if (anchorLink == 'fifthSection' && slideIndex == 1) {
        $.fn.fullpage.setAllowScrolling(true, 'up');
        $nav.css('color', 'transparent');
      }
    }
  });
  $(document).on('click', '#moveDown', function () {
    $.fn.fullpage.moveSectionDown();
  });
});