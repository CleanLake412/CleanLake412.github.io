/**
 * 『右脳開発トレーニング 間違い探し』画面のＪＳコード
 *
 * @author K, SSJ
 * @since 2012/09/28
 */

var differStatus = 0;
// 0: show correct board during 10 seconds
// 1: wait for 5 seconds
// 2: guess correct board during 10 seconds
// 3: result screen

var differCanvasContext = null;
var differCanvasWidth = 0; //480;
var differCanvasHeight = 0; //300;

var differHorSpace = 50;
var differVerSpace = 0;
var differBoxSize = 0;

var differStrokeWidth = 1;

var differCorrectBoardIdx = 0;
var differGuessedBoardIdx = -1;
var differDrawnBoards = [];

var differColors = {1: '#00FF00', 2: '#0000FF', 3: '#FFFF00'};

// 記録情報（合算）
var differRecPrev = 0;
var differRecCurr = -1;
var differRecMax = 0;
var differRecTotal = 0;
var differRecCorrect = 0;

var differCurResult = 0; // no result, 1: OK, 2: NG

// Timers
var differStepTimerID = 0; // 10s or 5s intervaled-timer
var differFlickerTimerID = 0; // flicking correct board
var differFlickerCnt = 0;

// 10 or 5 second Timer
var differTimeBarWidth = 0;
var differTimerAniID = 0; // 1s intervaled-timer
var differTimerCnt = 0;
var differTimerType = 0; // 5s / 10s

$(function() {
	// 『右脳開発トレーニング 間違い探し』画面の初めての表示時点
	$("#differ_page1").live('pagebeforeshow', function(event, data) {
		if (differRecCurr >= 0) {
			differRecPrev = differRecCurr;
			differRecMax = Math.max(differRecMax, differRecCurr);
		}
		differRecCurr = -1;

		// 記録情報を表示する。
		g_showScore("differ_result1", differRecPrev);
		g_showScore("differ_result2", differRecMax);
		g_showScore("differ_result3", differRecTotal);
		g_showScore("differ_result4", differRecCorrect);
		g_showScore("differ_result5", (differRecTotal == 0) ? 0 : Math.floor(differRecCorrect * 10000 / differRecTotal + 0.5) / 100);
	});
	$("#differ_page1").trigger('pagebeforeshow');

	// 『右脳開発トレーニング 間違い探し』画面の初めての表示時点
	$("#differ_page2").live('pageinit', function(event, data) {
		var differCanvas = $("#differ_canvas")[0];
		if (!differCanvas.getContext) { // canvas unsupported
			return;
		}
		differCanvasContext = differCanvas.getContext("2d");
		differCanvasWidth = differCanvas.width;
		differCanvasHeight = differCanvas.height;

		differBoxSize = (differCanvasWidth - differHorSpace * 2) / 9;
		differVerSpace = Math.floor(differCanvasHeight - differBoxSize * 6);

		differCanvasContext.lineWidth = differStrokeWidth;

		differTimeBarWidth = $("#differ_timebar div").width();

		// 中断ボタンのハンドラー
		$("#differ_page2 .btn_stop").click(function() {
			if (confirm("トレーニングを終了しますか？\n（記録は保存されません。）")) {
				if (differStepTimerID > 0) {
					clearTimeout(differStepTimerID);
					differStepTimerID = 0;
				}
				differ_removeTimerAnimation();
				$.mobile.changePage("#differ_page1", {
					//type: "post",
					//data: $("form#search").serialize(), 
					transition : "slide"
				});
			}
			return false;
		});
		// 次へボタンのハンドラー
		$("#differ_page2 .btn_next").click(function() {
			differ_removeTimerAnimation();
			differ_resetTraining();
			return false;
		});
		// 終了ボタンのハンドラー
		$("#differ_page2 .btn_exit").click(function() {
			if (differCurResult == 1) { // correct
				if (!confirm("トレーニングを終了しますか？")) {
					return false; // not redirect
				}
			}
		});

		// ボードを選らんだ時のイベントハンドラー
		$("#differ_canvas").bind("vclick", function(e) {
			if (differCurResult != 0) {
				return;
			}

			var rect = e.target.getBoundingClientRect();
			var mouseX = e.clientX - rect.left;
			var mouseY = e.clientY - rect.top;
			var i = 0, j = 0;
			
			for (j = 0; j < 2; j ++) {
				for (i = 0; i < 3; i ++) {
					if (mouseX >= (differBoxSize * 3 + differHorSpace) * i && 
					    mouseX <= (differBoxSize * 3 + differHorSpace) * i + differBoxSize * 3 && 
					    mouseY >= (differBoxSize * 3 + differVerSpace) * j && 
					    mouseY <= (differBoxSize * 3 + differVerSpace) * j + differBoxSize * 3
					  ) {
						differGuessedBoardIdx = j * 3 + i;
						differCurResult = (differGuessedBoardIdx == differCorrectBoardIdx) ? 1/*OK*/ : 2;
						differ_processTraining3(differCurResult);
					}
				}
			}
		});
	});
	// 『右脳開発トレーニング 間違い探し』画面の表示時点
	$("#differ_page2").live('pagebeforeshow', function(prevPage) {
		if (differRecCurr < 0) {
			differRecCurr = 0;
		}
		g_showScore("differ_correct_cnt", differRecCurr);
		differ_resetTraining();
	});

	// 『右脳開発トレーニング 間違い探し』画面の初めての表示時点 - 結果表示の画面
	$("#differ_page3").live('pageinit', function(event, data) {
	});
	// 『右脳開発トレーニング 間違い探し』画面の表示時点 - 結果表示の画面
	$("#differ_page3").live('pagebeforeshow', function(prevPage) {
		g_showScore2("differ_page3_result1", differRecCurr);  // 今回の記録
		g_showScore2("differ_page3_result2", differRecPrev);  // 前回の記録
		g_showScore2("differ_page3_result3", differRecMax);  // 最高記録

		if (differRecCurr > differRecMax) {
			$("#differ_page3_updated").css('display', 'block');
		} else {
			$("#differ_page3_updated").css('display', 'none');
		}
	});
});

/**
 * タイマーを再生させる。
 * 
 * @param interval {Integer}
 */
function differ_restartTimer(interval) {
	if (differTimerAniID > 0) {
		clearInterval(differTimerAniID);
		differTimerAniID = 0;
	}

	differTimerCnt = 0;
	differTimerType = interval;

	$("#differ_timebar div").css('width', "0");
	differTimerAniID = setInterval(differ_refreshTimerBar, 1000/*1s*/);
}

/**
 * タイマーを停止させる。
 */
function differ_pauseTimer(state) {
	if (state) { // running
		differTimerAniID = setInterval(differ_refreshTimerBar, 1000/*1s*/);
	} else { // paused
		if (differTimerAniID > 0) {
			clearInterval(differTimerAniID);
			differTimerAniID = 0;
		}
	}
}

/**
 * タイマーアニメを無くす。
 */
function differ_removeTimerAnimation() {
	if (differTimerAniID > 0) {
		clearInterval(differTimerAniID);
		differTimerAniID = 0;
	}
	differTimerType = 0;
	differTimerCnt = 0;
}

/**
 * タイマーの長さを変更する。
 */
function differ_refreshTimerBar() {
	differTimerCnt ++;

	if (differTimerCnt > differTimerType) {
		differ_removeTimerAnimation();
	} else {
		$("#differ_timebar div").css('width', (differTimeBarWidth * differTimerCnt / differTimerType) + "px");
	}
}

/**
 * このトレーニングを初期化する。
 */
function differ_resetTraining() {//alertObject($("#differ_timebar div")[0]);
	var i = 0;

	// 1. Generate and draw six(6) of random colored box
	differDrawnBoards = null; // will be released gabage memory automatically
	differDrawnBoards = [];
	for (i = 0; i < 6; i ++) {
		differDrawnBoards[i] = g_genRandomColoredArray(3, 2, 9); // 3: number of colors, 2: boxes filled by every color, 9: 3 * 3
	}
	
	differCorrectBoardIdx = g_randomNumber(0, 5);
	differGuessedBoardIdx = -1;

	// 2. Set 'status' to 0 (inital status)
	differStatus = 0;
	differCurResult = 0;
	differ_drawBoards([differDrawnBoards[differCorrectBoardIdx], [], [], [], [], []]);

	$("#differ_canvas").css('display', '');
	$("#differ_timebar").css('display', '');
	$("#differ_comment").css('display', '');
	$("#differ_correct_cnt").css('display', '');

	$("#differ_comment").css('background-image', 'url(assets/img/unou/unou_training_txt5.png)'); // 左上の配色を記憶してください。

	differStepTimerID = setTimeout(differ_processTraining1, 10500/*10s*/);
	differ_restartTimer(10);

	// button's states
	$("#differ_page2 .btn_stop").css('display', 'block');
	$("#differ_page2 .btn_next").css('display', 'none');
	$("#differ_page2 .btn_exit").css('display', 'none');
}

/**
 * １０秒の間、正しいものを見せてもらった後の処理。
 */
function differ_processTraining1() {
	// ファイトボードを表示する。
	differ_drawBoards([], [], [], [], [], []);
	
	// ガイドのコメントを変える。
	$("#differ_comment").css('background-image', 'url(assets/img/unou/unou_training_txt2.png)'); // ５秒お待ちください。

	// タイマーを開始させる。（５秒）
	differ_restartTimer(5);

	differStatus = 1;
	differStepTimerID = setTimeout(differ_processTraining2, 5500/*5s*/);
}

/**
 * ５秒の間、ファイトボードを見せてもらった後の処理。
 */
function differ_processTraining2() {
	// ファイトボードを表示する。
	differ_drawBoards(differDrawnBoards);
	
	// ガイドのコメントを変える。
	$("#differ_comment").css('background-image', 'url(assets/img/unou/unou_training_txt6.png)'); // 同じ配色をご選択ください。

	// タイマーを開始させる。（１０秒）
	differ_restartTimer(10);

	differStatus = 2;
	differStepTimerID = setTimeout(differ_processTraining3, 10500/*10s*/);
}

/**
 * １０秒の間、正しいものを選択させてもらった後の処理。
 */
function differ_processTraining3(result) {
	if (differCurResult != 0 && typeof(result) == 'undefined') { // 正解・不正解が決まった後、タイムアウトになった場合
		return;
	}
	if (differStatus != 2) {
		return;
	}

	// タイマーを強制に終了させる。
	if (differCurResult != 0) {
		differ_pauseTimer(0);
		clearTimeout(differStepTimerID);
	}
	differStepTimerID = 0;

	differRecTotal ++;
	$("#differ_page2 .btn_stop").css('display', 'none');

	if (differCurResult == 0) { // 時間切れ
		$("#differ_comment").css('background-image', 'url(assets/img/result/resultStr3.png)');
		$("#differ_page2 .btn_next").css('display', 'none');
		$("#differ_page2 .btn_exit").css('display', 'block');

		differFlickerCnt = 0;
		differFlickerTimerID = setInterval(differ_flickerCorrectBoard, 200/*ms*/);
		differ_flickerCorrectBoard();

		g_playSound('ng');
	} else if (differCurResult == 1) { // 正解
		$("#differ_comment").css('background-image', 'url(assets/img/result/resultStr1.png)');
		differRecCurr ++;
		g_showScore("differ_correct_cnt", differRecCurr);
		differRecCorrect ++;
		$("#differ_page2 .btn_next").css('display', 'block');
		$("#differ_page2 .btn_exit").css('display', 'block');
		differ_drawSignImage(differGuessedBoardIdx, 1);

		g_playSound('ok');
	} else { // 不正解
		$("#differ_comment").css('background-image', 'url(assets/img/result/resultStr2.png)');
		$("#differ_page2 .btn_next").css('display', 'none');
		$("#differ_page2 .btn_exit").css('display', 'block');
		differ_drawSignImage(differGuessedBoardIdx, 0);

		differFlickerCnt = 0;
		differFlickerTimerID = setInterval(differ_flickerCorrectBoard, 200/*ms*/);
		differ_flickerCorrectBoard();

		g_playSound('ng');
	}

	differStatus = 3;
}

/**
 * ファイトボードを描く。
 *
 * @param boards {Array}
 */
function differ_drawBoards(boards) {
	var i = 0, j = 0;
	for (j = 0; j < 2; j ++) {
		for (i = 0; i < 3; i ++) {
			differ_drawOneBoard(
				(differBoxSize * 3 + differHorSpace) * i, 
				(differBoxSize * 3 + differVerSpace) * j, 
				boards[j * 3 + i]
			);
		}
	}
}

/**
 * 一つのボードを指定の場所に描く。
 * 
 * @param x0 {Integer}
 * @param y0 {Integer}
 * @param clr {Array}
 */
function differ_drawOneBoard(x0, y0, clr) {
	var i = 0;
	var x = 0, y = 0;

	// 0. fill white color on board
    differCanvasContext.fillStyle = "white";
	//differCanvasContext.strokeStyle="white";
    differCanvasContext.rect(x0, y0, differBoxSize * 3, differBoxSize * 3);
    differCanvasContext.fill();
	
	// 1. draw rectangle boxes
	if (typeof(clr) == 'object' && clr.length > 0) {
		for (i = 0; i < clr.length; i ++) {
			x = x0 + differBoxSize * (i % 3);
			y = y0 + differBoxSize * Math.floor(i / 3);

			differCanvasContext.fillStyle = (clr[i] == 0) ? '#FFFFFF' : differColors[clr[i]];
			differCanvasContext.fillRect(x, y, differBoxSize, differBoxSize);
		}
	}

	// 2. draw border lines
	differCanvasContext.strokeStyle="#000000"; // black
	differCanvasContext.beginPath();
	for (i = 0; i < 4; i ++) {
		// vertical
		differCanvasContext.moveTo(x0 + i * differBoxSize, y0);
		differCanvasContext.lineTo(x0 + i * differBoxSize, y0 + 3 * differBoxSize);

		// horizontal
		differCanvasContext.moveTo(x0, y0 + i * differBoxSize);
		differCanvasContext.lineTo(x0 + 3 * differBoxSize, y0 + i * differBoxSize);
	}
	differCanvasContext.stroke();
}

/**
 * ○、×の記号を表示する。
 * 
 * @param boardIdx {Integer}
 * @param sign {Boolean}
 */
function differ_drawSignImage(boardIdx, sign) {
	var x = boardIdx % 3;
	var y = Math.floor(boardIdx / 3);
	var imgSrc = $("#" + (sign ? "img_ok" : "img_ng"))[0];

	x = (differBoxSize * 3 + differHorSpace) * x;
	y = (differBoxSize * 3 + differVerSpace) * y;

	differCanvasContext.drawImage(imgSrc, x, y, differBoxSize * 3, differBoxSize * 3 );
}

/**
 * Flicker correct board
 */
function differ_flickerCorrectBoard() {
	var x = differCorrectBoardIdx % 3;
	var y = Math.floor(differCorrectBoardIdx / 3);
	x = (differBoxSize * 3 + differHorSpace) * x;
	y = (differBoxSize * 3 + differVerSpace) * y;

	if (differFlickerCnt % 2 == 0) {
		// draw white
		differ_drawOneBoard(x, y, []);
	} else {
		// draw board (original)
		differ_drawOneBoard(x, y, differDrawnBoards[differCorrectBoardIdx]);

		if (differFlickerCnt > 5) {
			clearInterval(differFlickerTimerID);
			differFlickerTimerID = 0;

			if (differCurResult == 2) { // incorrect
				$.mobile.changePage("#differ_page3", {
					//type: "post",
					//data: $("form#search").serialize(), 
					transition : "slide"
				});
			}
		}
	}
	differFlickerCnt ++;
}