/**
 * 『新聞を速く読む』画面のＪＳコード
 *
 * @author K, SSJ
 * @since 2012/09/24
 */

var newsChars = 9;
var newsSpeedIdx = 2; // Index
var newsSoundOn = false;

var newsTrainingCount = [0, 0, 0, 0, 0];

var newsHorPadding = 30;
var newsVerPadding = 30;
var newsTextFiles = 3; // news_1.txt ~ news_3.txt

var newsTimerID = 0;
var newsBuffer = "";
var newsBufferPos = 0;

var newsCanvasContext = null;
var newsCanvasWidth = 0; //640;
var newsCanvasHeight = 0; //750;
var newsX0 = 0, newsY0 = 0; // テキストの表示区域の左上座標
var newsChrOffsetX = 0, newsChrOffsetY = 0;

var newsMaxLines = 9;
var newsMaxCols = 13;
var newsBoxSize = 0;

// Timer relative variables
var newsTimerCounted = 0;
var newsTimerPasted = 0;
//var newsTimerStarted = 0;
var newsTimerDelay = 0;

$(function() {
	// 『新聞を速く読む』PAGE1: ガイド画面の表示時点
	$("#news_page1").live('pagebeforeshow', function(prevPage) {
		//alert(g_newsStepNum);
		news_refreshGuidePage();
		//alertObject(prevPage.target);
	});
	news_refreshGuidePage();

	// prev, next buttons' handler
	$("#news_navi_prev a").click(function() {
		if (g_newsStepNum == 1) {
			return false;
		}
		g_newsStepNum --;
		news_refreshGuidePage();

		return false;
	});
	$("#news_navi_next a").click(function() {
		if (g_newsStepNum == g_newsMaxStep) {
			return false;
		}
		g_newsStepNum ++;
		news_refreshGuidePage();

		return false;
	});

	// 「新聞を読む」PAGE2: トレーニング画面
	// 初めての表示時点
	$("#news_page2").live('pageinit', function(prevPage) {
		var newsCanvas = $("#news_canvas")[0];
		if (!newsCanvas.getContext) { // canvas unsupported
			return;
		}
		newsCanvasContext = newsCanvas.getContext("2d");
		newsCanvasWidth = newsCanvas.width;
		newsCanvasHeight = newsCanvas.height;

		newsBoxSize = Math.min((newsCanvasWidth - newsHorPadding*2)/newsMaxLines, (newsCanvasHeight - newsVerPadding*2)/newsMaxCols);
		var fontSize = Math.floor(newsBoxSize * 0.875);
		newsCanvasContext.font = fontSize + "px ＭＳ Ｐゴシック Bold";

		newsX0 = Math.floor((newsCanvasWidth - newsBoxSize * newsMaxLines) / 2);
		newsY0 = Math.floor((newsCanvasHeight - newsBoxSize * newsMaxCols) / 2);

		newsChrOffsetX = (newsBoxSize - fontSize) / 2;
		newsChrOffsetY = fontSize - (newsBoxSize - fontSize) / 2;
	});

	$("#news_page2").live('pagebeforeshow', function(prevPage) {
		//newsTimerStarted = (new Date()).valueOf();
		newsTimerPasted = 0;
		news_resetTimer();
	});

	$("#news_page2").live('pagebeforehide', function(prevPage) {
		if (newsTimerID != 0) {
			clearInterval(newsTimerID);
		}
	});

	// Speed, Characters, On/Off Buttons' handler
	// - Speed Spin
	$("#news_speed .spin_minus").click(function() {
		if (newsSpeedIdx == 0) {
			return false;
		}
		newsSpeedIdx --;
		$("#news_speed .spin_value").html(g_speedList[newsSpeedIdx]);
		news_resetTimer();
		return false; // prevent to redirect 
	});
	$("#news_speed .spin_plus").click(function() {
		if (newsSpeedIdx >= g_speedList.length) {
			return false;
		}
		newsSpeedIdx ++;
		$("#news_speed .spin_value").html(g_speedList[newsSpeedIdx]);
		news_resetTimer();
		return false; // prevent to redirect 
	});
	// Number of characters' Spin
	$("#news_chars .spin_minus").click(function() {
		if (newsChars <= 5) {
			return false;
		}
		newsChars -= 2;
		$("#news_chars .spin_value").html(newsChars);
		news_resetTimer();
		return false; // prevent to redirect 
	});
	$("#news_chars .spin_plus").click(function() {
		if (newsChars >= newsMaxCols) {
			return false;
		}
		newsChars += 2;
		$("#news_chars .spin_value").html(newsChars);
		news_resetTimer();
		return false; // prevent to redirect 
	});
	// On/Off Spin
	$("#news_sound .spin_minus").click(function() {
		newsSoundOn = !newsSoundOn;
		$("#news_sound .spin_value").html(newsSoundOn ?  "On" : "Off");
		return false; // prevent to redirect 
	});
	$("#news_sound .spin_plus").click(function() {
		newsSoundOn = !newsSoundOn;
		$("#news_sound .spin_value").html(newsSoundOn ?  "On" : "Off");
		return false; // prevent to redirect 
	});

	// show default setting value
	$("#news_speed .spin_value").html(g_speedList[newsSpeedIdx]);
	$("#news_chars .spin_value").html(newsChars);
	$("#news_sound .spin_value").html(newsSoundOn ? "On" : "Off");

	// 「戻る」ボタンのクリックハンドラー
	$("#news_page2 .btn_return").click(function() {
		if (newsTimerID > 0) {
			// １分タイマーを強制終了させる。
			clearInterval(newsTimerID);
			newsTimerID = 0;
		}
	});

	// 「新聞を読む」PAGE3: 休息の画面
	$("#news_page3").live('pagebeforeshow', function(prevPage) {
		$("#news_rest").removeClass("news_rest_1");
		$("#news_rest").removeClass("news_rest_2");
		$("#news_rest").removeClass("news_rest_3");
		$("#news_rest").removeClass("news_rest_end");

		if (newsTrainingCount[g_newsStepNum-1] == 3) { // 一つのＳＴＥＰに対してトレーニングが終わり
			if (g_newsStepNum == g_newsMaxStep) { // 最後のＳＴＥＰのトレーニングが終わり
				$("#news_rest").addClass("news_rest_end"); // トレーニング終わりのお知らせ
				$("#news_page3 a.btn_exit").css('display', 'block');
				$("#news_page3 a.btn_return").css('display', 'none');
				$("#news_page3 a.btn_restart").css('display', 'none');
				$("#news_page3 a.btn_next").css('display', 'none');
			} else {
				$("#news_rest").addClass("news_rest_3"); // 次のステップへの案内
				$("#news_page3 a.btn_exit").css('display', 'none');
				$("#news_page3 a.btn_return").css('display', 'block');
				$("#news_page3 a.btn_restart").css('display', 'none');
				$("#news_page3 a.btn_next").css('display', 'block');
			}
		} else {
			$("#news_rest").addClass("news_rest_"+newsTrainingCount[g_newsStepNum-1]); // トレーニング中
			$("#news_page3 a.btn_exit").css('display', 'none');
			$("#news_page3 a.btn_return").css('display', 'block');
			$("#news_page3 a.btn_restart").css('display', 'block');
			$("#news_page3 a.btn_next").css('display', 'none');
		}
	});
	$("#news_page3 a.btn_next").click(function() {
		if (g_newsStepNum < g_newsMaxStep) {
			g_newsStepNum ++;
		}
	});
});

/**
 * トレーニング回数の初期化
 * 指定のステップがあったら、そのステップのトレーニング回数は維持する。
 *
 * @param curStep {Integer}
 */
function news_resetTraningCount(curStep) {
	for (var i = 0; i < g_newsMaxStep; i++) {
		if (i+1 == curStep) {
			continue;
		}
		newsTrainingCount[i] = 0;
	}
}

/**
 * トレーニングが終わったのか、チェックする。
 *
 * @return {Integer} 終わらなかったＳＴＥＰ番号
 */
function news_checkCompleted() {
	for (var i = 0; i < g_newsMaxStep; i++) {
		if (newsTrainingCount[i] < 3) {
			return i+1;
		}
	}
	return 0;
}

/**
 * ＳＴＥＰ番号によって画面表示を変更する。
 */
function news_refreshGuidePage() {
	if (g_newsStepNum < 1) {
		g_newsStepNum = 1;
	}
	if (g_newsStepNum > g_newsMaxStep) {
		g_newsStepNum = g_newsMaxStep;
	}

	// change background image (guideline)
	$("#news_guide").css("background-image", "url(assets/img/guide/guide_c"+g_newsStepNum+".png)");

	// 'previous' button
	if (g_newsStepNum == 1) {
		$("#news_navi_prev a").removeClass("news_hoverable_prev");
	} else {
		$("#news_navi_prev a").addClass("news_hoverable_prev");
	}

	// 'next' button
	if (g_newsStepNum == g_newsMaxStep) {
		$("#news_navi_next a").removeClass("news_hoverable_next");
	} else {
		$("#news_navi_next a").addClass("news_hoverable_next");
	}

	// Step number
	$("#news_navi_step").css("background-image", "url(assets/img/step/step"+g_newsStepNum+".png)");
}

/**
 * Timerをリセットして再起動させる。
 */
function news_resetTimer() {
	if (newsTimerID > 0) {
		clearInterval(newsTimerID);
		newsTimerID = 0;
	}

	if (g_newsStepNum <= 2) { // STEP1 ~ STEP2
		// interval = 60000 / g_speedList[newsSpeedIdx]
		// interval : １文字当たり読むに掛かる時間 (ms)
		newsTimerDelay = Math.floor(60000 / g_speedList[newsSpeedIdx] / 2);
		newsTimerCounted = 0;
		newsTimerID = setInterval(news_onTimer, newsTimerDelay);
	} else { // STEP3, STEP4, STEP5
		newsTimerDelay = Math.floor(60000 / g_speedList[newsSpeedIdx] * newsChars);
		newsTimerCounted = 0;
		newsTimerID = setInterval(news_onTimer, newsTimerDelay);
	}

	if (newsBufferPos < 0) {
		newsBufferPos = 0;
	}

	// 新しいテキストを表示する。
	news_clearCanvas();
	
	// タイマーハンドラーを即時呼び出す。
	newsTimerPasted -= newsTimerDelay;
	news_onTimer();
}

/**
 * 一定の時間ごとに発生するイベントハンドラー
 */
function news_onTimer() {
	var coord; // {x: 100, y: 200}

	// 1. 以前の痕跡を消す。（青○など）
	if (g_newsStepNum == 1 || g_newsStepNum == 2 || g_newsStepNum == 3) { // STEP1-3
		coord = news_getCoord((newsMaxLines-1)/2, (newsMaxCols-newsChars)/2);
		newsCanvasContext.fillStyle = "white";
		newsCanvasContext.fillRect(coord.x-1, coord.y-1, newsBoxSize+2, (newsChars+0.5) * newsBoxSize+2);
	} else if (g_newsStepNum == 4) { // STEP4
		if (newsTimerCounted == 0) {
			news_clearCanvas();
		}
	} else { // STEP5
		if (newsTimerCounted == 0) {
			news_clearCanvas();
		} else {
			coord = news_getCoord(newsTimerCounted-1, (newsMaxCols-newsChars)/2);
			newsCanvasContext.fillStyle = "white";
			newsCanvasContext.fillRect(coord.x-1, coord.y-1, newsBoxSize+2, newsBoxSize * newsChars+2);
		}		
	}

	// 2. テキストを描く。
	newsCanvasContext.fillStyle="#000000";
	if (g_newsStepNum == 2 || g_newsStepNum == 3) { // STEP2, STEP3
		for (i = 0; i < newsChars; i ++) {
			news_drawOneChar(i, (newsMaxLines-1)/2, ((newsMaxCols-newsChars)/2)+i);
		}
	} else if (newsTimerCounted == 0 && (g_newsStepNum == 4 || g_newsStepNum == 5)) { // STEP4, STEP5
		for (j = 0; j < newsMaxLines; j ++) {
			for (i = 0; i < newsChars; i ++) {
				news_drawOneChar(j*newsChars+i, j, ((newsMaxCols-newsChars)/2)+i);
			}
		}
	} else if (g_newsStepNum == 5 && newsTimerCounted > 0) { // STEP5 （消されたテキストを再度描く）
		for (i = 0; i < newsChars; i ++) {
			news_drawOneChar((newsTimerCounted-1)*newsChars+i, (newsTimerCounted-1), ((newsMaxCols-newsChars)/2)+i);
		}
	}
	
	// 3. 赤色の丸(又は、四角形)を描く。
	newsCanvasContext.strokeStyle="#FF0000"; // red
	if (g_newsStepNum == 1 || g_newsStepNum == 2 || (g_newsStepNum == 4 && newsTimerCounted == 0)) {
		coord = news_getCoord((newsMaxLines-1)/2, (newsMaxCols-1)/2);
		newsCanvasContext.beginPath();
		newsCanvasContext.arc(coord.x + newsBoxSize/2, coord.y + newsBoxSize/2, newsBoxSize/2, 0, 2*Math.PI);
		newsCanvasContext.closePath();
		newsCanvasContext.stroke();
	} else if (g_newsStepNum == 5) {
		coord = news_getCoord(newsTimerCounted, (newsMaxCols-newsChars)/2);
		newsCanvasContext.strokeRect(coord.x, coord.y, newsBoxSize, newsBoxSize * newsChars);
		//newsCanvasContext.stroke();
	}

	// 4. 青色の丸を描く。
	if (g_newsStepNum == 1 || g_newsStepNum == 2) {
		coord = news_getCoord((newsMaxLines-1)/2, (newsMaxCols-newsChars)/2);
		newsCanvasContext.beginPath();
		newsCanvasContext.arc(coord.x + newsBoxSize/2, coord.y + newsTimerCounted * newsBoxSize / 2 + newsBoxSize/2, newsBoxSize/2, 0, 2*Math.PI);
		newsCanvasContext.strokeStyle="#0000FF"; // blue
		newsCanvasContext.stroke();
	}

	// カウント、経過時間をチェックする。
	newsTimerCounted ++;
	if (g_newsStepNum <= 2) { // STEP1 ~ STEP2
		if (newsTimerCounted >= newsChars * 2) {
			newsTimerCounted = 0;
			if (g_newsStepNum != 1) {
				newsBufferPos += newsChars;
			}

			// play sound
			if (newsSoundOn) {
				g_playSound('cursor');
			}
		}
	} else if (g_newsStepNum == 3) { // STEP3
		newsTimerCounted = 0;
		newsBufferPos += newsChars;

		// play sound
		if (newsSoundOn) {
			g_playSound('cursor');
		}
	} else { // STEP4, STEP5
		if (newsTimerCounted >= newsMaxLines) {
			newsTimerCounted = 0;
			newsBufferPos += newsChars * newsMaxLines;
		}

		// play sound
		if (newsSoundOn) {
			g_playSound('cursor');
		}
	}

	// １分経過のチェック
	//if ((new Date()).valueOf() - newsTimerStarted >= g_trainingPeriod) { // 60000ms : 1 min
	newsTimerPasted += newsTimerDelay;
	if (newsTimerPasted >= g_trainingPeriod) {
		clearInterval(newsTimerID);
		if (newsTrainingCount[g_newsStepNum-1] < 3) {
			newsTrainingCount[g_newsStepNum-1] ++;
		}
		$.mobile.changePage("#news_page3", {
			//type: "post",
			//data: $("form#search").serialize(), 
			transition : "slide"
		});
	}
}

/**
 *
 */
function news_clearCanvas() {
	// 1. 白板を描く。
    newsCanvasContext.fillStyle = "white";
    newsCanvasContext.fillRect(0, 0, newsCanvasWidth, newsCanvasHeight);
}

/**
 * 表示するテキストを抽出して描く。
 * 
 * @param cursor {Integer}
 * @param line {Integer}
 * @param row {Integer}
 * @return {String}
 */
function news_drawOneChar(cursor, line, row) {
	var coord; // {x: 100, y: 200}
	var chr = "";
	var x = 0, y = 0;

	if (newsBuffer.length-1 <= newsBufferPos+cursor) {
		// 新しいファイルを読み込む。
		var textFileNo = Math.floor(Math.random() * (newsTextFiles * newsTextFiles)) % newsTextFiles + 1;
		g_readTextFile('news_'+textFileNo+'.txt', function(contents, errNo){
			if (errNo == 0) {
				newsBuffer = contents;
				newsBuffer = newsBuffer.replace(new RegExp("\r\n", "g"), "\n");
			} else { // fatal error: failed to read text file
				//@todo
			}
		}, true);

		newsBufferPos = -cursor;
		//return -1;
	}

	chr = newsBuffer.substr(newsBufferPos+cursor, 1);
	coord = news_getCoord(line, row);
	x = newsChrOffsetX + coord.x;
	y = newsChrOffsetY + coord.y;

	// 記号文字を縦表示用に変換する。
	if (chr == "。" || chr == "、") {
		x += newsBoxSize / 3;
		y -= newsBoxSize / 3;
	} else if (chr == "「") {
		chr = "﹁";
		y -= newsBoxSize / 3;
	} else if (chr == "」") {
		chr = "﹂";
		y += newsBoxSize / 3;
	} else if (chr == "（") {
		chr = "︵";
		//y -= newsBoxSize / 3;
	} else if (chr == "）") {
		chr = "︶";
		y += newsBoxSize / 3;
	} else if (chr == "→") {
		chr = "↓";
		//y += newsBoxSize / 3;
	} else if (chr == "←") {
		chr = "↑";
		//y += newsBoxSize / 3;
	} else if (chr == "ー") {
		chr = "｜";
		//y += newsBoxSize / 3;
	}
	
	newsCanvasContext.fillText(chr, x, y);
	return true;
}

/**
 * 文字の行・列番号から座標を計算する。
 * 
 * @param line {Integer} 0-8
 * @param col {Integer} 0-12
 */
function news_getCoord(line, col, forText) {
	var x = newsX0 + (newsMaxLines - line - 1) * newsBoxSize;
	var y = newsY0 + col * newsBoxSize;
	return {'x': x, 'y': y};
}
