// <!-- Google Analytics -->
let GA_MEASUREMENT_ID = '';
if (window.location.origin === 'https://dom.ocm.osaka') {
    GA_MEASUREMENT_ID = 'G-QV9CSK78HJ';
} else if (window.location.origin === 'https://dom-ocm-osaka.das-stg.geoa.tech') {
    GA_MEASUREMENT_ID = 'G-QH5CP12MEE';
}
if (GA_MEASUREMENT_ID !== '') {
    let headTag = document.getElementsByTagName('head')[0];
    let gtagJS = document.createElement('script');
    gtagJS.async = true;
    gtagJS.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_MEASUREMENT_ID;
    headTag.insertBefore(gtagJS, headTag.childNodes[0]);

    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID);
}
// <!-- End Google Analytics -->

document.addEventListener('DOMContentLoaded', function () {
  const show_btn = document.querySelector('#show-menu-button');
  const close_btn = document.querySelector('#close-menu-button');
  const menu = document.querySelector('.menu');
  const menu_content = document.querySelector('.menu-content');
  const menu_accessibility = document.querySelector('.accessibility-header-sp');

  adjustScreenLayout();

  // SPメニューボタンの設定
  show_btn.addEventListener('click', (event) => {
    event.stopPropagation();

    menu_content.classList.toggle('d-none');
    menu_accessibility.classList.toggle('d-none');
    menu_accessibility.classList.toggle('d-flex');
    show_btn.classList.toggle('d-none');
    close_btn.classList.toggle('d-none');

    // メニューのスタイル設定
    menu.style.overflow = 'hidden';
    menu.style.height = '100dvh';
    menu.style.position = 'fixed';
    menu.style.top = '0';
    menu.style.left = '0';
    menu.style.right = '0';
    menu.style.zIndex = '1';
  });

  close_btn.addEventListener('click', (event) => {
    event.stopPropagation();

    menu_content.classList.toggle('d-none');
    menu_accessibility.classList.toggle('d-none');
    menu_accessibility.classList.toggle('d-flex');
    show_btn.classList.toggle('d-none');
    close_btn.classList.toggle('d-none');

    menu.style.position = 'static';
    menu.style.height = 'auto';
  });

  // 「共有」ボタンを押した場合
  $('#btn-share').on("click", function (e){
    var modalEl = $("#snsModal");
    var copyLinkEl = modalEl.find("#txt-copylink");

    copyLinkEl.val(window.location.href);
    modalEl.fadeIn();
  });

  function popupWindow(prefixUrl) {
    let popupWinWidth = Math.min(window.innerWidth-10, 560);
    let popupWinHeight = Math.min(window.innerHeight-10, 500);

    let left = (window.innerWidth - popupWinWidth) / 2;
    let top = (window.innerHeight - popupWinHeight) / 2;

    const currentUrl = window.location.href;
    window.open(prefixUrl+currentUrl, 'twitter', 'resizable=yes,toolbar=0,menubar=0,location=0,width=' + popupWinWidth + ',height=' + popupWinHeight + ',top=' + top + ',left=' + left);
  }
  $('#btn-twitter').click(function (e){
    popupWindow('https://twitter.com/intent/tweet?url=');
  });
  $('#btn-facebook').click(function (e){
    popupWindow('https://www.facebook.com/sharer/sharer.php?u=');
  });
  $('#btn-line').click(function (e){
    popupWindow('https://social-plugins.line.me/lineit/share?url=');
  });
  $('#btn-copylink').click(function (e){
    // Get the text field
    var copyText = document.getElementById("txt-copylink");

    // Select the text field
    copyText.select();
    copyText.setSelectionRange(0, 99999); // For mobile devices

    // Copy the text inside the text field
    document.execCommand("copy");

    alertify.success('コピーしました。');

    copyText.setSelectionRange(0, 0);
  });
  // When the user clicks on <span> (x), close the modal
  $('[data-bs-dismiss=sns-modal]').click(function (e){
    var modalEl = $("#snsModal");
    modalEl.fadeOut();
  });

  $(".link-to-treasure>a").attr("href", window.location.origin + "/treasure");

  function adjustScreenLayout() {
    let windowHeight = $(window).height();
    let headerHeight = $(".menu-header").outerHeight(true);
    let copyrightHeight = $(".menu-copyright").outerHeight(true);
    let accessibilityHeight = $(".accessbility-header-sp").outerHeight(true);
    let contentHeight = windowHeight - (headerHeight + accessibilityHeight+ copyrightHeight);

    $(".menu-content").height(contentHeight);
  }

  // 詳細画面の場合、メニューのイベント処理
  if ($("#ocm-sp-gallery").length === 0) {
    $("#btn-show-all").on("click", function() {
      if (window.opener && window.opener.filterCollections) {
        window.opener.filterCollections(false, '', null);
        window.opener.focus();
        window.close();
      } else {
        window.open('../?all', '_blank').focus();
      }
    });

    $("#category-group a").on("click", function() {
      const categoryName = $(this).attr("data-title");
      if (window.opener && window.opener.filterCollections) {
        window.opener.filterCollections(false, categoryName, null);
        window.opener.focus();
        window.close();
      } else {
        window.location.href = '../?category=' + categoryName;
      }
    });

    $("#facility-group a").on("click", function() {
      const facilityName = $(this).attr("data-title");
      if (window.opener && window.opener.filterCollections) {
        window.opener.filterCollections(true, facilityName, null);
        window.opener.focus();
        window.close();
      } else {
        window.location.href = '../?facility=' + facilityName;
      }
    });
  }

  // ウィンドウサイズ変更時の処理
  window.addEventListener('resize', () => {
    adjustScreenLayout();
  });
});
