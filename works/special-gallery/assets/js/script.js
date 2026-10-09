(function () {
  'use strict'
  let OsakaSections = {};
  let FontSize = {normal: 16, large: 20};

  OsakaSections.SwiperSlideshow = (function () {
    function SwiperSlideshow () {
      this.selectors = {
        container: '.js-swiper-slider'
      }

      this.$containers = document.querySelectorAll(this.selectors.container);
      this._initSliders();
    }

    SwiperSlideshow.prototype = Object.assign({}, SwiperSlideshow.prototype, {
      _initSliders() {
        this.$containers.forEach(function($sliderContainer) {
          if ($sliderContainer.classList.contains('swiper-container-initialized')) {
            return;
          }

          let settings = {
            autoplay: 0,
            slidesPerView: 1,
            loop: true,
            navigation: {
              nextEl: ".slideshow__next",
              prevEl: ".slideshow__prev"
            }
          };

          if ($sliderContainer.classList.contains('swiper-number-pagination')) {
            settings = Object.assign(settings, {
              pagination: {
                "el": ".swiper-pagination-number",
                "type": "bullets",
                "clickable": true,
                renderBullet: function(index, className) {
                  return '<span class="' + className + '">' + (index + 1) + '</span>';
                }
              }
            });
          }

          if ($sliderContainer.dataset.settings) {
            settings = Object.assign(settings, JSON.parse($sliderContainer.dataset.settings));
          }

          if ($sliderContainer.querySelectorAll('.swiper-slide').length > 1) {
            // eslint-disable-next-line no-undef
            new Swiper($sliderContainer, settings);
          } else {
            $sliderContainer.classList.add('swiper-container-initialized');
            const $active_slide = $sliderContainer.querySelector('.swiper-slide');
            $active_slide && $active_slide.classList.add('swiper-slide-active');
          }
        });
      }
    });

    return SwiperSlideshow;
  })();

  OsakaSections.ThemeSwitcher = (function () {
    function ThemeSwitcher () {
      this.selectors = {
        container: '.size-color-switcher'
      }

      this._initSwitcher();
    }

    ThemeSwitcher.prototype = Object.assign({}, ThemeSwitcher.prototype, {
      _initSwitcher() {
        const savedTheme = sessionStorage.getItem('theme');

        if (savedTheme) {
          $("html").attr("data-bs-theme", savedTheme);
          $(this.selectors.container).find(".switcher__theme > a").removeClass("active");
          $(this.selectors.container).find('.switcher__theme > a[data-theme="' + savedTheme + '"]').addClass("active");
        }
        const savedFontSize = sessionStorage.getItem('font_size') ?? FontSize.normal;

        if (savedFontSize) {
          $("html").css("font-size", savedFontSize + "px");
        }
        if (!savedFontSize || savedFontSize == FontSize.large) {
          $(".switcher__font-size > a.font-size__up").removeClass("active").addClass("active");
        } else {
          $(".switcher__font-size > a.font-size__default").removeClass("active").addClass("active");
        }

        $(this.selectors.container).find(".switcher__theme > a").on("click", function() {
          const curTheme = $(this).data("theme");
          $("html").attr("data-bs-theme", curTheme);
          $(this).parent().children("a").removeClass("active");
          $(this).addClass("active");
          sessionStorage.setItem('theme', curTheme);
        });

        $(this.selectors.container).find(".switcher__font-size > a.font-size__up").on("click", function() {
          // const cur_font_size = (sessionStorage.getItem('font_size'))?sessionStorage.getItem('font_size'):(($(window).width() < 768)?10:16);
          $("html").css("font-size", FontSize.large + "px");
          sessionStorage.setItem('font_size', FontSize.large);
          window.adjustGalleryLayout && adjustGalleryLayout();
        });

        $(this.selectors.container).find(".switcher__font-size > a.font-size__default").on("click", function() {
          // $("html").css("font-size", (($(window).width() < 768)?10:16) + "px");
          // sessionStorage.setItem('font_size', (($(window).width() < 768)?10:16));
          $("html").css("font-size", FontSize.normal + "px");
          sessionStorage.setItem('font_size', FontSize.normal);
          window.adjustGalleryLayout && adjustGalleryLayout();
        });
      }
    });

    return ThemeSwitcher;
  })();

  class Osaka {
    constructor() {
      new OsakaSections.SwiperSlideshow();
      new OsakaSections.ThemeSwitcher();
    }
  }

  document.addEventListener("DOMContentLoaded", function() {
    new Osaka();

    const sp = $(window).width() < 768;
    // $("html").css("font-size", (sp?12:16) + "px");
    // sessionStorage.setItem('font_size', (sp?12:16));

    if (sp) {
        // スマホ版の場合、画面初期表示時、画像一覧を閉じる
        ($(".product-thumbnail-toggle > button").length > 0) && collapseImageList();
    }

    // Animation effects
    if (typeof WOW !== 'undefined') new WOW({
      mobile:false
    }).init();
  });

  function collapseImageList() {
    $(".product-thumbnail-toggle > button").addClass("closed");
    $(".product-thumbnail-toggle > button").find("span").text(openGallery);
    $(".product-gallery .product-image-list").addClass("closed");
  }

  function expandImageList() {
    $(".product-thumbnail-toggle > button").removeClass("closed");
    $(".product-thumbnail-toggle > button").find("span").text(closeGallery);
    $(".product-gallery .product-image-list").removeClass("closed");
  }

  $(document).on("click", ".product-thumbnail-toggle > button", function(){
    if($(this).hasClass("closed")) {
      expandImageList();
    } else {
      collapseImageList();
    }
  });

  $(document).on("click", "#product_zoom_in", function(){
    if($(this).parent().children("input[type=range]").val() * 1 + 20 <= $(this).parent().children("input[type=range]").attr("max") * 1) {
      $(this).parent().children("input[type=range]").val($(this).parent().children("input[type=range]").val() * 1 + 20);
    } else {
      $(this).parent().children("input[type=range]").val($(this).parent().children("input[type=range]").attr("max") * 1);
    }
  });

  $(document).on("click", "#product_zoom_out", function(){
    if($(this).parent().children("input[type=range]").val() * 1 - 20 >= $(this).parent().children("input[type=range]").attr("min") * 1) {
      $(this).parent().children("input[type=range]").val($(this).parent().children("input[type=range]").val() * 1 - 20);
    } else {
      $(this).parent().children("input[type=range]").val($(this).parent().children("input[type=range]").attr("min") * 1);
    }
  });

  $(document).on('click', ".offcanvas-body a.has-submenu", function() {
    $('.offcanvas-body .sub-menu').toggleClass('visible opacity-100');
  });

  $(document).on('click', ".offcanvas-body .size-color-switcher>a", function() {
    $('.switcher-content-sp').toggleClass('visible opacity-100');
  });

  // $(document).on("click", ".page-header .navbar-toggler-icon", function() {
  //   if($("body").hasClass("mobile-menu-open")) {
  //     $("body").removeClass("mobile-menu-open");
  //   }
  //   else {
  //     $("body").addClass("mobile-menu-open");
  //   }
  // });

  // $(window).on("resize", function() {
  //   $("html").css("font-size", (($(window).width() < 768)?12:16) + "px");
  //   sessionStorage.setItem('font_size', (($(window).width() < 768)?12:16));
  // });

  $(window).on("scroll", function() {
    if($(window).scrollTop() > 100) {
      $("#to_top").addClass("show");
    } else {
      $("#to_top").removeClass("show");
    }
  });

  $(document).on("click", "#to_top", function() {
    window.scrollTo({top: 0, behavior: 'smooth'});
  })
})($);


function setCookie(cname, cvalue) {
  document.cookie = cname + "=" + cvalue + ";path=/";
}

function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
