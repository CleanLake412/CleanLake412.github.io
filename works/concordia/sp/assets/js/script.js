/* javascriptのコードを記載 */
jQuery(function($){
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

    $(document).ready(function() {
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