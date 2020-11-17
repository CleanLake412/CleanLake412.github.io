/* javascriptのコードを記載 */
jQuery(function($){
	$.fn.extend({
        scrollToMe: function() {
            if($(this).length){
                var top = $(this).offset().top - 100;
                $('html,body').animate({scrollTop: top}, 600);
            }
        },
        scrollToJustMe: function(){
            if($(this).length){
                var top = $(this).offset().top;
                $('html,body').animate({scrollTop: top}, 600);
            }
        }
    });

    function changecheck() {
        $("#contact_form").find("label.is-required + *").removeClass("focusBox");

        var flg = false;

        $("#contact_form").find("label.is-required + *").each(function(){
            if(($(this).val() == "" || ($(this).attr("id") == "field-contact-email" && !$(this).val().match(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i)))) {
                if (!flg) {
                    $(this).addClass("focusBox");
                    flg = true;
                }
                $(this).parent().removeClass("validation-ok");
            } else {
                $(this).parent().addClass("validation-ok");
            }
        });

        return flg;
    }

    function validationcheck(el) {
        var flg = true;

        $(".require-note").remove();

        if(!$(el).find("input[name=contact-inquiry]:checked").val()) {
            flg = false;
            $(el).find("input[name=contact-inquiry]").parent().parent().find(".input-text-label").after('<p class="require-note">お問い合せ内容が選択されていません。</p>');
        }

        if(!$(el).find("#field-contact-name").val()) {
            flg = false;
            $(el).find("#field-contact-name").parent().find(".input-text-label").after('<p class="require-note">お名前が⼊⼒されていません。</p>');
        }

        if(!$(el).find("#field-contact-email").val()) {
            flg = false;
            $(el).find("#field-contact-email").parent().find(".input-text-label").after('<p class="require-note">メールアドレスが⼊⼒されていません。</p>');
        } else if(!$(el).find("#field-contact-email").val().match(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i)) {
            flg = false;
            $(el).find("#field-contact-email").parent().find(".input-text-label").after('<p class="require-note">メールアドレスの⼊⼒に誤りがあります。</p>');
        }    

        if(!$(el).find("#field-contact-age").val()) {
            flg = false;
            $(el).find("#field-contact-age").parent().find(".input-text-label").after('<p class="require-note">ご年齢が⼊⼒されていません。</p>');
        }

        if(!flg)
            $(".error-msg").fadeIn();

        return flg;
    }

    $("#contact_form").find("label.is-required + *").off("change").on("change", function(){
        changecheck();
    });

    $(document).ready(function() {

        var ua = navigator.userAgent;
        var formlink;
        if ((ua.indexOf('iPhone') > 0 || ua.indexOf('Android') > 0) && ua.indexOf('Mobile') > 0) {
            formlink = './sp/form.html';
        } else {
            formlink = './form.html';
        }

        $('a.btn-cta').attr('href', formlink);

        if ($.isFunction(window.ScrollHint)) {
    	   new ScrollHint('.js-scrollable');
        }

    	$("a[href*='#']").click(function(){
            if($($(this).attr("href")).length)
                $($(this).attr("href")).scrollToJustMe();
            else
                window.location.href=store_base_url + $(this).attr("href");
            return false;
        });

		$(".accordion .accordion-title").off("click").on("click", function(){
			if($(this).parent().hasClass("active"))
				$(this).parent().removeClass("active");
			else
				$(this).parent().addClass("active");
		});

		if($(this).scrollTop() > 1000) {
            $("#sticky-footer").addClass("show");
            $('#to-top').fadeIn();
        } else {
            $("#sticky-footer").removeClass("show");
            $('#to-top').fadeOut();
        }

		$(window).scroll(function(){
			if($(this).scrollTop() > 1000) {
                $("#sticky-footer").addClass("show");
                $('#to-top').fadeIn();
            } else {
                $("#sticky-footer").removeClass("show");
                $('#to-top').fadeOut();
            }
        });

        $("#to-top").click(function () {
            $("html, body").animate({scrollTop: 0}, 300);
        });

        $('input[type="number"]').on('keyup', function(){
            v = parseInt($(this).val());
            min = parseInt($(this).attr('min'));
            max = parseInt($(this).attr('max'));

            if (v < min){
                $(this).val(min);
            } else if (v > max){
                $(this).val(max);
            }
        });

        $("#contact_form").on("submit", function(){
            if(changecheck()) {
                $(this).find(".require-note").addClass("show");
                return false;
            }
            else {
                return true;
            }
        });

        $("#contact_us_form").on("submit", function(){
            return validationcheck($(this));
        });

        $("#contact_us_form").find("label.is-required ~ input").each(function(){
            $(this).off("focusout").on("focusout", function(){
                if(!$(this).val()) {
                    $(this).parent().find("p.require-note").remove();
                    $(this).before('<p class="require-note">入力されていません。</p>');
                }
                else {
                    $(this).parent().find("p.require-note").remove();

                    if($(this).attr("type") == "email" && !$(this).val().match(/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i)) {
                        $(this).before('<p class="require-note">メールアドレスの入力に誤りがあります。</p>');
                    }
                }
            });
        });
    });
});