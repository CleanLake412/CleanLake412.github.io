/**
 * 『メールを速く読む』画面のＪＳコード
 *
 * @author K, SSJ
 * @since 2012/09/28
 */

var mailChars = 9;
var mailSpeedIdx = 2; // Index
var mailSoundOn = false;

var mailTrainingCount = [0, 0];

var mailHorPadding = 30;
var mailVerPadding = 30;
var mailTextFiles = 3; // mail_1.txt ~ mail_3.txt

var mailTimerID = 0;
var mailBuffer = "";
var mailBufferPos = 0;

var mailCanvasContext = null;
var mailCanvasWidth = 0; //640;
var mailCanvasHeight = 0; //750;
var mailX0 = 0, mailY0 = 0; // テキストの表示区域の左上座標
var mailChrOffsetX = 0, mailChrOffsetY = 0;

var mailMaxLines = 9;
var mailMaxCols = 13;
var mailBoxSize = 0;

// Timer relative variables
var mailTimerCounted = 0;
var mailTimerPasted = 0;
//var mailTimerStarted = 0;
var mailTimerDelay = 0;

$(function() {
	// 『新聞を速く読む』PAGE1: ガイド画面の表示時点
	$("#mail_page1").live('pagebeforeshow', function(prevPage) {
		//alert(g_mailStepNum);
		mail_refreshGuidePage();
		//alertObject(prevPage.target);
	});
	mail_refreshGuidePage();

	// prev, next buttons' handler
	$("#mail_navi_prev a").click(function() {
		if (g_mailStepNum == 1) {
			return false;
		}
		g_mailStepNum --;
		mail_refreshGuidePage();

		return false;
	});
	$("#mail_navi_next a").click(function() {
		if (g_mailStepNum == g_mailMaxStep) {
			return false;
		}
		g_mailStepNum ++;
		mail_refreshGuidePage();

		return false;
	});

	// 「新聞を読む」PAGE2: トレーニング画面
	// 初めての表示時点
	$("#mail_page2").live('pageinit', function(prevPage) {
		var mailCanvas = $("#mail_canvas")[0];
		if (!mailCanvas.getContext) { // canvas unsupported
			return;
		}
		mailCanvasContext = mailCanvas.getContext("2d");
		mailCanvasWidth = mailCanvas.width;
		mailCanvasHeight = mailCanvas.height;

		mailBoxSize = Math.min((mailCanvasWidth - mailHorPadding*2)/mailMaxCols, (mailCanvasHeight - mailVerPadding*2)/mailMaxLines);
		var fontSize = Math.floor(mailBoxSize * 0.875);
		mailCanvasContext.font = fontSize + "px ＭＳ Ｐゴシック Bold";

		mailX0 = Math.floor((mailCanvasWidth - mailBoxSize * mailMaxCols) / 2);
		mailY0 = Math.floor((mailCanvasHeight - mailBoxSize * mailMaxLines) / 2);

		mailChrOffsetX = (mailBoxSize - fontSize) / 2;
		mailChrOffsetY = fontSize - (mailBoxSize - fontSize) / 2;
	});

	$("#mail_page2").live('pagebeforeshow', function(prevPage) {
		//mailTimerStarted = (new Date()).valueOf();
		mailTimerPasted = 0;
		mail_resetTimer();
	});

	$("#mail_page2").live('pagebeforehide', function(prevPage) {
		if (mailTimerID != 0) {
			clearInterval(mailTimerID);
		}
	});

	// Speed, Characters, On/Off Buttons' handler
	// - Speed Spin
	$("#mail_speed .spin_minus").click(function() {
		if (mailSpeedIdx == 0) {
			return false;
		}
		mailSpeedIdx --;
		$("#mail_speed .spin_value").html(g_speedList[mailSpeedIdx]);
		mail_resetTimer();
		return false; // prevent to redirect 
	});
	$("#mail_speed .spin_plus").click(function() {
		if (mailSpeedIdx >= g_speedList.length) {
			return false;
		}
		mailSpeedIdx ++;
		$("#mail_speed .spin_value").html(g_speedList[mailSpeedIdx]);
		mail_resetTimer();
		return false; // prevent to redirect 
	});
	// Number of characters' Spin
	$("#mail_chars .spin_minus").click(function() {
		if (mailChars <= 5) {
			return false;
		}
		mailChars -= 2;
		$("#mail_chars .spin_value").html(mailChars);
		mail_resetTimer();
		return false; // prevent to redirect 
	});
	$("#mail_chars .spin_plus").click(function() {
		if (mailChars >= mailMaxCols) {
			return false;
		}
		mailChars += 2;
		$("#mail_chars .spin_value").html(mailChars);
		mail_resetTimer();
		return false; // prevent to redirect 
	});
	// On/Off Spin
	$("#mail_sound .spin_minus").click(function() {
		mailSoundOn = !mailSoundOn;
		$("#mail_sound .spin_value").html(mailSoundOn ? "On" : "Off");
		return false; // prevent to redirect 
	});
	$("#mail_sound .spin_plus").click(function() {
		mailSoundOn = !mailSoundOn;
		$("#mail_sound .spin_value").html(mailSoundOn ? "On" : "Off");
		return false; // prevent to redirect 
	});

	// show default setting value
	$("#mail_speed .spin_value").html(g_speedList[mailSpeedIdx]);
	$("#mail_chars .spin_value").html(mailChars);
	$("#mail_sound .spin_value").html(mailSoundOn ? "On" : "Off");

	// 「戻る」ボタンのクリックハンドラー
	$("#mail_page2 .btn_return").click(function() {
		if (mailTimerID > 0) {
			// １分タイマーを強制終了させる。
			clearInterval(mailTimerID);
			mailTimerID = 0;
		}
	});

	// 「新聞を読む」PAGE3: 休息の画面
	$("#mail_page3").live('pagebeforeshow', function(prevPage) {
		$("#mail_rest").removeClass("mail_rest_1");
		$("#mail_rest").removeClass("mail_rest_2");
		$("#mail_rest").removeClass("mail_rest_3");
		$("#mail_rest").removeClass("mail_rest_end");

		if (mailTrainingCount[g_mailStepNum-1] == 3) { // 一つのＳＴＥＰに対してトレーニングが終わり
			if (g_mailStepNum == g_mailMaxStep) { // 最後のＳＴＥＰのトレーニングが終わり
				$("#mail_rest").addClass("mail_rest_end"); // トレーニング終わりのお知らせ
				$("#mail_page3 a.btn_exit").css('display', 'block');
				$("#mail_page3 a.btn_return").css('display', 'none');
				$("#mail_page3 a.btn_restart").css('display', 'none');
				$("#mail_page3 a.btn_next").css('display', 'none');
			} else {
				$("#mail_rest").addClass("mail_rest_3"); // 次のステップへの案内
				$("#mail_page3 a.btn_exit").css('display', 'none');
				$("#mail_page3 a.btn_return").css('display', 'block');
				$("#mail_page3 a.btn_restart").css('display', 'none');
				$("#mail_page3 a.btn_next").css('display', 'block');
			}
		} else {
			$("#mail_rest").addClass("mail_rest_"+mailTrainingCount[g_mailStepNum-1]); // トレーニング中
			$("#mail_page3 a.btn_exit").css('display', 'none');
			$("#mail_page3 a.btn_return").css('display', 'block');
			$("#mail_page3 a.btn_restart").css('display', 'block');
			$("#mail_page3 a.btn_next").css('display', 'none');
		}
	});
	$("#mail_page3 a.btn_next").click(function() {
		if (g_mailStepNum < g_mailMaxStep) {
			g_mailStepNum ++;
		}
	});
});

/**
 * トレーニング回数の初期化
 * 指定のステップがあったら、そのステップのトレーニング回数は維持する。
 *
 * @param curStep {Integer}
 */
function mail_resetTraningCount(curStep) {
	for (var i = 0; i < g_mailMaxStep; i++) {
		if (i+1 == curStep) {
			continue;
		}
		mailTrainingCount[i] = 0;
	}
}

/**
 * トレーニングが終わったのか、チェックする。
 *
 * @return {Integer} 終わらなかったＳＴＥＰ番号
 */
function mail_checkCompleted() {
	for (var i = 0; i < g_mailMaxStep; i++) {
		if (mailTrainingCount[i] < 3) {
			return i+1;
		}
	}
	return 0;
}

/**
 * ＳＴＥＰ番号によって画面表示を変更する。
 */
function mail_refreshGuidePage() {
	if (g_mailStepNum < 1) {
		g_mailStepNum = 1;
	}
	if (g_mailStepNum > g_mailMaxStep) {
		g_mailStepNum = g_mailMaxStep;
	}

	// change background image (guideline)
	$("#mail_guide").css("background-image", "url(assets/img/guide/guide_d"+g_mailStepNum+".png)");

	// 'previous' button
	if (g_mailStepNum == 1) {
		$("#mail_navi_prev a").removeClass("mail_hoverable_prev");
	} else {
		$("#mail_navi_prev a").addClass("mail_hoverable_prev");
	}

	// 'next' button
	if (g_mailStepNum == g_mailMaxStep) {
		$("#mail_navi_next a").removeClass("mail_hoverable_next");
	} else {
		$("#mail_navi_next a").addClass("mail_hoverable_next");
	}

	// Step number
	$("#mail_navi_step").css("background-image", "url(assets/img/step/step"+g_mailStepNum+".png)");
}

/**
 * Timerをリセットして再起動させる。
 */
function mail_resetTimer() {
	if (mailTimerID > 0) {
		clearInterval(mailTimerID);
		mailTimerID = 0;
	}

	// interval = 60000 / g_speedList[mailSpeedIdx]
	// interval : １文字当たり読むに掛かる時間 (ms)
	mailTimerCounted = 0;
	mailTimerDelay = Math.floor(60000 / g_speedList[mailSpeedIdx] * mailChars);
	mailTimerID = setInterval(mail_onTimer, mailTimerDelay);

	if (mailBufferPos < 0) {
		mailBufferPos = 0;
	}

	// 即時、タイマー処理を行う。
	mailTimerPasted -= mailTimerDelay; // 即時、呼び出すから１回分だけ差し引く。
	mail_onTimer();
}

/**
 * 一定の時間ごとに発生するイベントハンドラー
 */
function mail_onTimer() {
	var coord; // {x: 100, y: 200}
	var i, j;
	var chr = "";
	
	// 1. 白板を描く。
	if (mailTimerCounted == 0) {
		mailCanvasContext.fillStyle = "white";
		mailCanvasContext.fillRect(0, 0, mailCanvasWidth, mailCanvasHeight);
	} else if (g_mailStepNum == 2) { // STEP2 : ２行目以後の場合、以前の赤枠を消す。
		coord = mail_getCoord(mailTimerCounted-1, (mailMaxCols-mailChars)/2);
		mailCanvasContext.fillStyle = "white";
		mailCanvasContext.fillRect(coord.x-1, coord.y-1, mailBoxSize * mailChars+2, mailBoxSize+2);
	}

	// 2. テキストを描く。
	mailCanvasContext.fillStyle="#000000";
	if (g_mailStepNum == 1) { // STEP1
		for (i = 0; i < mailChars; i ++) {
			mail_drawOneChar(i, (mailMaxLines-1)/2, ((mailMaxCols-mailChars)/2)+i);
		}
	} else if (mailTimerCounted == 0) { // STEP2
		for (j = 0; j < mailMaxLines; j ++) {
			for (i = 0; i < mailChars; i ++) {
				mail_drawOneChar(j*mailChars+i, j, ((mailMaxCols-mailChars)/2)+i);
			}
		}
	} else { // STEP2 : ２行目以後の場合、赤枠と一緒に消されたテキストを描く。
		for (i = 0; i < mailChars; i ++) {
			mail_drawOneChar((mailTimerCounted-1)*mailChars+i, mailTimerCounted-1, ((mailMaxCols-mailChars)/2)+i);
		}
	}
	
	// 3. 赤色の四角形を描く。
	if (g_mailStepNum == 2) {
		mailCanvasContext.strokeStyle="#FF0000"; // red
		coord = mail_getCoord(mailTimerCounted, (mailMaxCols-mailChars)/2);
		mailCanvasContext.strokeRect(coord.x, coord.y, mailBoxSize * mailChars, mailBoxSize);
		//mailCanvasContext.stroke();
	}

	// カウント、経過時間をチェックする。
	mailTimerCounted ++;
	if (g_mailStepNum == 1) { // STEP1 （1行）
		mailTimerCounted = 0;
		mailBufferPos += mailChars;

		// play sound
		if (mailSoundOn) {
			g_playSound('cursor');
		}
	} else { // STEP2 （マルチ行）
		if (mailTimerCounted >= mailMaxLines) {
			mailTimerCounted = 0;
			mailBufferPos += mailChars * mailMaxLines;

			// play sound
			if (mailSoundOn) {
				g_playSound('cursor');
			}
		}
	}

	// １分経過のチェック
	//if ((new Date()).valueOf() - mailTimerStarted >= g_trainingPeriod) { // 60000ms : 1 min
	mailTimerPasted += mailTimerDelay;
	if(mailTimerPasted >= g_trainingPeriod) {
		clearInterval(mailTimerID);
		if (mailTrainingCount[g_mailStepNum-1] < 3) {
			mailTrainingCount[g_mailStepNum-1] ++;
		}
		$.mobile.changePage("#mail_page3", {
			//type: "post",
			//data: $("form#search").serialize(), 
			transition : "slide"
		});
	}
}

/**
 * 表示するテキストを抽出して描く。
 * 
 * @param cursor {Integer}
 * @param line {Integer}
 * @param row {Integer}
 * @return {String}
 */
function mail_drawOneChar(cursor, line, row) {
	var coord; // {x: 100, y: 200}
	var chr = "";
	var x = 0, y = 0;

	if (mailBuffer.length-1 <= mailBufferPos+cursor) {
		// 新しいファイルを読み込む。
		var textFileNo = Math.floor(Math.random() * (mailTextFiles * mailTextFiles)) % mailTextFiles + 1;
		g_readTextFile('mail_'+textFileNo+'.txt', function(contents, errNo){
			if (errNo == 0) {
				mailBuffer = contents;
				mailBuffer = mailBuffer.replace(new RegExp("\r\n", "g"), "\n");
			} else { // fatal error: failed to read text file
				//@todo
			}
		}, true);

		mailBufferPos = -cursor;
		//return -1;
	}

	chr = mailBuffer.substr(mailBufferPos+cursor, 1);
	coord = mail_getCoord(line, row);
	x = mailChrOffsetX + coord.x;
	y = mailChrOffsetY + coord.y;

	mailCanvasContext.fillText(chr, x, y);
	return true;
}

/**
 * 文字の行・列番号から座標を計算する。
 * 
 * @param line {Integer} 0-8
 * @param col {Integer} 0-12
 */
function mail_getCoord(line, col, forText) {
	var x = mailX0 + col * mailBoxSize;
	var y = mailY0 + line * mailBoxSize;
	return {'x': x, 'y': y};
}
