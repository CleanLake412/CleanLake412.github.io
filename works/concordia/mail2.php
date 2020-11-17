<?php

require_once './functions.php';

header("Content-Type:text/html;charset=utf-8");
//error_reporting(E_ALL | E_STRICT);

##-----------------------------------------------------------------------------------------------------------------##
#
#  PHPメールプログラム　フリー版 最終更新日2018/07/27
#　改造や改変は自己責任で行ってください。
#
#  HP: http://www.php-factory.net/
#
#  重要！！サイトでチェックボックスを使用する場合のみですが。。。
#  チェックボックスを使用する場合はinputタグに記述するname属性の値を必ず配列の形にしてください。
#  例　name="当サイトをしったきっかけ[]"  として下さい。
#  nameの値の最後に[と]を付ける。じゃないと複数の値を取得できません！
#
##-----------------------------------------------------------------------------------------------------------------##
if (version_compare(PHP_VERSION, '5.1.0', '>=')) {//PHP5.1.0以上の場合のみタイムゾーンを定義
	date_default_timezone_set('Asia/Tokyo');//タイムゾーンの設定（日本以外の場合には適宜設定ください）
}
/*-------------------------------------------------------------------------------------------------------------------
* ★以下設定時の注意点　
* ・値（=の後）は数字以外の文字列（一部を除く）はダブルクオーテーション「"」、または「'」で囲んでいます。
* ・これをを外したり削除したりしないでください。後ろのセミコロン「;」も削除しないください。
* ・また先頭に「$」が付いた文字列は変更しないでください。数字の1または0で設定しているものは必ず半角数字で設定下さい。
* ・メールアドレスのname属性の値が「Email」ではない場合、以下必須設定箇所の「$Email」の値も変更下さい。
* ・name属性の値に半角スペースは使用できません。
*以上のことを間違えてしまうとプログラムが動作しなくなりますので注意下さい。
-------------------------------------------------------------------------------------------------------------------*/


//---------------------------　必須設定　必ず設定してください　-----------------------

//サイトのトップページのURL　※デフォルトでは送信完了後に「トップページへ戻る」ボタンが表示されますので
$site_top = "./index.html";

//管理者のメールアドレス ※メールを受け取るメールアドレス(複数指定する場合は「,」で区切ってください 例 $to = "aa@aa.aa,bb@bb.bb";)
$to = "info@ryugaku-times.com";

//自動返信メールの送信元メールアドレス
//必ず実在するメールアドレスでかつ出来る限り設置先サイトのドメインと同じドメインのメールアドレスとすることを強く推奨します
$from = "info@ryugaku-times.com";

//フォームのメールアドレス入力箇所のname属性の値（name="○○"　の○○部分）
$Email = "contact-email";
//---------------------------　必須設定　ここまで　------------------------------------


//---------------------------　セキュリティ、スパム防止のための設定　------------------------------------

//スパム防止のためのリファラチェック（フォーム側とこのファイルが同一ドメインであるかどうかのチェック）(する=1, しない=0)
//※有効にするにはこのファイルとフォームのページが同一ドメイン内にある必要があります
$Referer_check = 1;

//リファラチェックを「する」場合のドメイン ※設置するサイトのドメインを指定して下さい。
//もしこの設定が間違っている場合は送信テストですぐに気付けます。
$Referer_check_domain = "concordiauniv.com";

/*セッションによるワンタイムトークン（CSRF対策、及びスパム防止）(する=1, しない=0)
※ただし、この機能を使う場合は↓の送信確認画面の表示が必須です。（デフォルトではON（1）になっています）
※【重要】ガラケーは機種によってはクッキーが使えないためガラケーの利用も想定してる場合は「0」（OFF）にして下さい（PC、スマホは問題ないです）*/
$useToken = 0;
//---------------------------　セキュリティ、スパム防止のための設定　ここまで　------------------------------------


//---------------------- 任意設定　以下は必要に応じて設定してください ------------------------


// 管理者宛のメールで差出人を送信者のメールアドレスにする(する=1, しない=0)
// する場合は、メール入力欄のname属性の値を「$Email」で指定した値にしてください。
//メーラーなどで返信する場合に便利なので「する」がおすすめです。
$userMail = 1;

// Bccで送るメールアドレス(複数指定する場合は「,」で区切ってください 例 $BccMail = "aa@aa.aa,bb@bb.bb";)
$BccMail = "wataru.sugo@gmail.com";

// 管理者宛に送信されるメールのタイトル（件名）
$subject = "コンコーディア国際大学に関するお問い合わせ";

// 送信確認画面の表示(する=1, しない=0)
$confirmDsp = 0;

// 送信完了後に自動的に指定のページ(サンクスページなど)に移動する(する=1, しない=0)
// CV率を解析したい場合などはサンクスページを別途用意し、URLをこの下の項目で指定してください。
// 0にすると、デフォルトの送信完了画面が表示されます。
$jumpPage = 0;

// 送信完了後に表示するページURL（上記で1を設定した場合のみ）※httpから始まるURLで指定ください。（相対パスでも基本的には問題ないです）
$thanksPage = "http://xxx.xxxxxxxxx/thanks.html";

// 必須入力項目を設定する(する=1, しない=0)
$requireCheck = 1;

/* 必須入力項目(入力フォームで指定したname属性の値を指定してください。（上記で1を設定した場合のみ）
値はシングルクォーテーションで囲み、複数の場合はカンマで区切ってください。フォーム側と順番を合わせると良いです。
配列の形「name="○○[]"」の場合には必ず後ろの[]を取ったものを指定して下さい。*/
$require = array('contact-inquiry','contact-name','contact-email','contact-age');


//----------------------------------------------------------------------
//  自動返信メール設定(START)
//----------------------------------------------------------------------

// 差出人に送信内容確認メール（自動返信メール）を送る(送る=1, 送らない=0)
// 送る場合は、フォーム側のメール入力欄のname属性の値が上記「$Email」で指定した値と同じである必要があります
$remail = 1;

//自動返信メールの送信者欄に表示される名前　※あなたの名前や会社名など（もし自動返信メールの送信者名が文字化けする場合ここは空にしてください）
$refrom_name = "コンコーディア国際大学受付窓口";

// 差出人に送信確認メールを送る場合のメールのタイトル（上記で1を設定した場合のみ）
$re_subject = "コンコーディア国際大学についてお問い合わせいただきありがとうございました";

//フォーム側の「名前」箇所のname属性の値　※自動返信メールの「○○様」の表示で使用します。
//指定しない、または存在しない場合は、○○様と表示されないだけです。あえて無効にしてもOK
$dsp_name = 'contact-name';

//自動返信メールの冒頭の文言 ※日本語部分のみ変更可
$remail_text = <<< TEXT

コンコーディア国際大学のお問い合わせをいただきありがとうございます。
2営業日以内にご返信させていただきますので、今しばらくお待ちください。

メールアドレスの受信設定の関係で、弊社からのご返信が届かない場合は
ご連絡ができない可能性がございますので、その場合はお手数ですが
弊社までメールでご連絡をいただければ幸いです。

TEXT;


//自動返信メールに署名（フッター）を表示(する=1, しない=0)※管理者宛にも表示されます。
$mailFooterDsp = 1;

//上記で「1」を選択時に表示する署名（フッター）（FOOTER〜FOOTER;の間に記述してください）
$mailSignature = <<< FOOTER

──────────────────────
コンコーディア国際大学受付窓口
運営会社： 株式会社国際教育交流センター
Email： info@ryugaku-times.com
営業時間： 11~21時（定休：日・月曜日）
──────────────────────

FOOTER;


//----------------------------------------------------------------------
//  自動返信メール設定(END)
//----------------------------------------------------------------------

//メールアドレスの形式チェックを行うかどうか。(する=1, しない=0)
//※デフォルトは「する」。特に理由がなければ変更しないで下さい。メール入力欄のname属性の値が上記「$Email」で指定した値である必要があります。
$mail_check = 1;

//全角英数字→半角変換を行うかどうか。(する=1, しない=0)
$hankaku = 1;

//全角英数字→半角変換を行う項目のname属性の値（name="○○"の「○○」部分）
//※複数の場合にはカンマで区切って下さい。（上記で「1」を指定した場合のみ有効）
//配列の形「name="○○[]"」の場合には必ず後ろの[]を取ったものを指定して下さい。
$hankaku_array = array('お電話番号');

//-fオプションによるエンベロープFrom（Return-Path）の設定(する=1, しない=0)　
//※宛先不明（間違いなどで存在しないアドレス）の場合に 管理者宛に「Mail Delivery System」から「Undelivered Mail Returned to Sender」というメールが届きます。
//サーバーによっては稀にこの設定が必須の場合もあります。
//設置サーバーでPHPがセーフモードで動作している場合は使用できませんので送信時にエラーが出たりメールが届かない場合は「0」（OFF）として下さい。
$use_envelope = 0;

//機種依存文字の変換
/*たとえば?（かっこ株）や?（丸1）、その他特殊な記号や特殊な漢字などは変換できずに「？」と表示されます。それを回避するための機能です。
確認画面表示時に置換処理されます。「変換前の文字」が「変換後の文字」に変換され、送信メール内でも変換された状態で送信されます。（たとえば「?」の場合、「（株）」に変換されます）
必要に応じて自由に追加して下さい。ただし、変換前の文字と変換後の文字の順番と数は必ず合わせる必要がありますのでご注意下さい。*/

//変換前の文字
$replaceStr['before'] = array('?','?','?','?','?','?','?','?','?','?','?','?','?','?');
//変換後の文字
$replaceStr['after'] = array('(1)','(2)','(3)','(4)','(5)','(6)','(7)','(8)','(9)','(10)','No.','（有）','（株）','高');

//------------------------------- 任意設定ここまで ---------------------------------------------


// 以下の変更は知識のある方のみ自己責任でお願いします。

//----------------------------------------------------------------------
//  関数実行、変数初期化
//----------------------------------------------------------------------
//トークンチェック用のセッションスタート
if($useToken == 1 && $confirmDsp == 1){
	session_name('PHPMAILFORMSYSTEM');
	session_start();
}
$encode = "UTF-8";//このファイルの文字コード定義（変更不可）
if(isset($_GET)) $_GET = sanitize($_GET);//NULLバイト除去//
if(isset($_POST)) $_POST = sanitize($_POST);//NULLバイト除去//
if(isset($_COOKIE)) $_COOKIE = sanitize($_COOKIE);//NULLバイト除去//
if($encode == 'SJIS') $_POST = sjisReplace($_POST,$encode);//Shift-JISの場合に誤変換文字の置換実行
$funcRefererCheck = refererCheck($Referer_check,$Referer_check_domain);//リファラチェック実行

//変数初期化
$sendmail = 0;
$empty_flag = 0;
$post_mail = '';
$errm ='';
$header ='';

if($requireCheck == 1) {
	$requireResArray = requireCheck($require);//必須チェック実行し返り値を受け取る
	$errm = $requireResArray['errm'];
	$empty_flag = $requireResArray['empty_flag'];
}
//メールアドレスチェック
if(empty($errm)){
	foreach($_POST as $key=>$val) {
		if($val == "confirm_submit") $sendmail = 1;
		if($key == $Email) $post_mail = h($val);
		if($key == $Email && $mail_check == 1 && !empty($val)){
			if(!checkMail($val)){
				$errm .= "<p class=\"error_messe\">【".$key."】はメールアドレスの形式が正しくありません。</p>\n";
				$empty_flag = 1;
			}
		}
	}
}

if(($confirmDsp == 0 || $sendmail == 1) && $empty_flag != 1){

	//トークンチェック（CSRF対策）※確認画面がONの場合のみ実施
	if($useToken == 1 && $confirmDsp == 1){
		if(empty($_SESSION['mailform_token']) || ($_SESSION['mailform_token'] !== $_POST['mailform_token'])){
			exit('ページ遷移が不正です');
		}
		if(isset($_SESSION['mailform_token'])) unset($_SESSION['mailform_token']);//トークン破棄
		if(isset($_POST['mailform_token'])) unset($_POST['mailform_token']);//トークン破棄
	}

	//差出人に届くメールをセット
	if($remail == 1) {
		$userBody = mailToUser($_POST,$dsp_name,$remail_text,$mailFooterDsp,$mailSignature,$encode);
		$reheader = userHeader($refrom_name,$from,$encode);
		$re_subject = "=?iso-2022-jp?B?".base64_encode(mb_convert_encoding($re_subject,"JIS",$encode))."?=";
	}
	//管理者宛に届くメールをセット
	$adminBody = mailToAdmin($_POST,$subject,$mailFooterDsp,$mailSignature,$encode,$confirmDsp);
	$header = adminHeader($userMail,$post_mail,$BccMail,$to);
	$subject = "=?iso-2022-jp?B?".base64_encode(mb_convert_encoding($subject,"JIS",$encode))."?=";

	//-fオプションによるエンベロープFrom（Return-Path）の設定(safe_modeがOFFの場合かつ上記設定がONの場合のみ実施)
	if($use_envelope == 0){
		mail($to,$subject,$adminBody,$header);
		if($remail == 1 && !empty($post_mail)) mail($post_mail,$re_subject,$userBody,$reheader);
	}else{
		mail($to,$subject,$adminBody,$header,'-f'.$from);
		if($remail == 1 && !empty($post_mail)) mail($post_mail,$re_subject,$userBody,$reheader,'-f'.$from);
	}
}
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="Content-Script-Type" content="text/javascript" />
    <meta http-equiv="Content-Style-Type" content="text/css" />

    <title>完了画面｜お問い合わせ｜コンコーディア国際大学｜2年で学士資格が取得可能な海外留学</title>

    <meta name="description" content="2年で学士資格が取得できるコンコーディア国際大学の受付窓口となります。学費のこと、プログラムのことなど受験生が知りたい内容をお伝えさせていただきます。進路相談も受け付けておりますのでお気軽にご相談ください。" />
    <meta name="keywords" content="コンコーディア国際大学" />

    <link rel="icon" type="image/png" href="./assets/img/favicon.png">

    <!-- css -->
    <link rel="stylesheet" href="./assets/css/style.css">
    <style>
        .error_messe {
            color: red;
        }
    </style>

    <!-- javascript -->
    <script src="./libs/jquery/jquery-3.4.1.min.js"></script>
    <?php if(($confirmDsp == 0 || $sendmail == 1) && $empty_flag != 1) : ?>
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-N7F34TG');</script>
    <!-- End Google Tag Manager -->
    <?php endif; ?>
</head>

<body class="contact-form">
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-N7F34TG"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
    <header id="header" class="page-header">
        <div class="sec-inner">
            <a href="./index.html" class="logo">
                <img src="./assets/img/header-pc.png" alt="" />
            </a>
        </div>
    </header>
    <h1 class="page-title">お問い合わせ</h1>
    <div class="step-container">
        <div class="step-item">
            <span class="step-num">1</span><span>お客様情報⼊⼒</span>
        </div>
        <div class="step-item active">
            <span class="step-num">2</span><span>お問い合わせ完了</span>
        </div>
    </div>
    <section id="contact-us-success">
        <?php if($empty_flag == 1) : ?>
        <div class="sec-inner">
            <h2><span>入力にエラーがあります。</span></h2>
            <p>
                下記をご確認の上「戻る」ボタンにて修正をお願い致します。
            </p>
            <?php echo $errm; ?>
        </div>
        <div class="btn-container">
            <a href="#" onclick="javascript:history.back();return false;" class="button"><span>戻る</span></a>
        </div>
        <?php else: ?>
        <div class="sec-inner">
            <h2><span>お問い合わせ</span><span>ありがとうございました</span></h2>
            <p>送信ありがとうございました。<br>送信は正常に完了しました。<br><br>2営業日以内に担当者よりご連絡させていただきますので、<br>しばらくお待ちください。</p>
        </div>
        <div class="btn-container">
            <a href="<?php echo $site_top; ?>" class="button"><span>トップページへ</span></a>
        </div>
        <?php endif; ?>
    </section>
    <footer id="footer" class="footer-default">
        <div class="copyright">
            <p>Copyright © 留学タイムズ All Rights Reserved.</p>
        </div>
    </footer>

    <script src="./assets/js/script.js"></script>
</body>
</html>