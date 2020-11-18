$('.color-trigger').on('click', function () {
    $(this).parent().toggleClass('visible-palate');
});
$('.primaryColor').click(function(e){
    if($('.primaryColor').hasClass('display-none')){
        $('.primaryColor').removeClass('display-none');
        $('.primaryColor').addClass('display-block');
    }
    else {
        $('.primaryColor').removeClass('display-block');
        $('.primaryColor').addClass('display-none');
    }
});
$('.secondaryColor').click(function(e){
    if($('.secondaryColor').hasClass('display-none')){
        $('.secondaryColor').removeClass('display-none');
        $('.secondaryColor').addClass('display-block');
    }
    else {
        $('.secondaryColor').removeClass('display-block');
        $('.secondaryColor').addClass('display-none');
    }
});
$('body').click(function(evt){ 
    console.log('InOut');   
   if(evt.target.id == "pCOlor"){
    if($('.secondaryColor').hasClass('display-block')){
        $('.secondaryColor').removeClass('display-block');
        $('.secondaryColor').addClass('display-none');
    }
    console.log('If');
    return
   }
   else if(evt.target.id == "sCOlor"){
    if($('.primaryColor').hasClass('display-block')){
        $('.primaryColor').removeClass('display-block');
        $('.primaryColor').addClass('display-none');
    }
    console.log('If1');
    return
   }
   else{
    console.log('else');
    $('.primaryColor').removeClass('display-block');
    $('.primaryColor').addClass('display-none'); 
    $('.secondaryColor').removeClass('display-block');
    $('.secondaryColor').addClass('display-none'); 
   }
});