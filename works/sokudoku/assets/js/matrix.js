/**
 * 『右脳開発トレーニングマトリックス』画面のＪＳコード
 *
 * @author KSN, KHU
 * @since 2012/09/28, 10/3
 */

var matrixStatus = 0;
// 0: show correct board during 10 seconds
// 1: wait for 5 seconds, showing white background
// 2: wait for 2 seconds, showing color to select
// 3: guess correct board during 10 seconds
// 4: result screen

// CANVAS の大きさ、余白
var matrixCanvasContext = null;
var matrixHorSpace = 0, matrixVerSpace = 0;
var matrixBoxSize = 0;

// 枠線の厚さ、塗り色
var matrixStrokeWidth = 2;
var matrixColors = {1: '#00FF00', 2: '#0000FF', 3: '#FFFF00'};
var matrixBoard = [];
var matrixCCBoard = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]; // CC: Center colored board

// 記録情報（合算）
var matrixRecords = {}; // 1: {}, 2: {}, ... 5: {}
var matrixRecCurr = -1;
var matrixCurResult = 0; // no result, 1: OK, 2: NG

var matrixSelectedBoxes = [];
var matrixSelectedBoard = [];
var matrixColorToSelect = 0;

// Timers
var matrixStepTimerID = 0; // 10s or 5s intervaled-timer
var matrixFlickerTimerID = 0; // flicking correct board
var matrixFlickerCnt = 0;

// 10 or 5 second Timer
var matrixTimeBarWidth = 0;
var matrixTimerAniID = 0; // 1s intervaled-timer
var matrixTimerCnt = 0;
var matrixTimerType = 0; // 5s / 10s

$(function() {
	// 『右脳開発トレーニングマトリックス』PAGE1: 初期化の時点
	$("#matrix_page1").live('pageinit', function(event, data) {
		// 成績を初期化する。
		for (var i = 1; i <= g_matrixMaxLevel; i ++) {
			matrixRecords[i] = {'prev': 0, 'max': 0, 'total': 0, 'correct': 0};
		}

		// prev, next buttons' handler
		$("#matrix_navi_prev a").click(function() {
			if (g_matrixLevel == 1) {
				return false;
			}
			g_matrixLevel --;
			matrix_refreshGuidePage();

			return false;
		});
		$("#matrix_navi_next a").click(function() {
			if (g_matrixLevel == g_matrixMaxLevel) {
				return false;
			}
			g_matrixLevel ++;
			matrix_refreshGuidePage();

			return false;
		});
	});
	// 『右脳開発トレーニングマトリックス』PAGE1: ガイド画面の表示時点
	$("#matrix_page1").live('pagebeforeshow', function(prevPage) {
		if (matrixRecCurr >= 0) {
			matrixRecords[g_matrixLevel]['prev'] = matrixRecCurr;
			matrixRecords[g_matrixLevel]['max'] = Math.max(matrixRecords[g_matrixLevel]['max'], matrixRecCurr);
		}
		matrixRecCurr = -1;

		matrix_refreshGuidePage();
	});
	$("#matrix_page1").trigger('pageinit');
	$("#matrix_page1").trigger('pagebeforeshow');

	// 『右脳開発トレーニングマトリックス』画面の初めての表示時点
	$("#matrix_page2").live('pageinit', function(event, data) {
		var matrixCanvas = $("#matrix_canvas")[0];
		if (!matrixCanvas.getContext) { // canvas unsupported
			return;
		}
		matrixCanvasContext = matrixCanvas.getContext("2d");

		if (matrixCanvas.width > matrixCanvas.height) {
			matrixVerSpace = Math.floor(matrixStrokeWidth);
			matrixBoxSize = (matrixCanvas.height - matrixVerSpace * 2) / 5;
			matrixHorSpace = Math.floor((matrixCanvas.width - matrixBoxSize * 5) / 2);
		} else {
			matrixHorSpace = matrixStrokeWidth;
			matrixBoxSize = (matrixCanvas.width - matrixHorSpace * 2) / 5;
			matrixVerSpace = Math.floor((matrixCanvas.height - matrixBoxSize * 5) / 2);
		}

		// 枠線の厚さ
		matrixCanvasContext.lineWidth = matrixStrokeWidth;

		// タイマーバーの幅
		matrixTimeBarWidth = $("#matrix_timebar div").width();

		// 中断ボタンのハンドラー
		$("#matrix_page2 .btn_stop").click(function() {
			if (confirm("トレーニングを終了しますか？\n（記録は保存されません。）")) {
				if (matrixStepTimerID > 0) {
					clearTimeout(matrixStepTimerID);
					matrixStepTimerID = 0;
				}
				matrix_removeTimerAnimation();
				$.mobile.changePage("#matrix_page1", {
					//type: "post",
					//data: $("form#search").serialize(), 
					transition : "slide"
				});
			}
			return false;
		});
		// 次へボタンのハンドラー
		$("#matrix_page2 .btn_next").click(function() {
			matrix_removeTimerAnimation();
			matrix_resetTraining();
			return false;
		});
		// 終了ボタンのハンドラー
		$("#matrix_page2 .btn_exit").click(function() {
			if (matrixCurResult == 1) { // correct
				if (!confirm("トレーニングを終了しますか？")) {
					return false; // not redirect
				}
			}
		});

		// ボードを選らんだ時のイベントハンドラー
		$("#matrix_canvas").bind("vclick", function(e) {
			if (matrixStatus != 3 || matrixCurResult != 0) {
				return;
			}
			if (matrixSelectedBoxes.length >= g_matrixLevel+1) {
				return;
			}

			var rect = e.target.getBoundingClientRect();
			var mouseX = e.clientX - rect.left;
			var mouseY = e.clientY - rect.top;
			var x = 0, y = 0;

			x = Math.floor((mouseX-matrixHorSpace) / matrixBoxSize);
			y = Math.floor((mouseY-matrixVerSpace) / matrixBoxSize);
			matrixSelectedBoxes[matrixSelectedBoxes.length] = y * 5 + x;
			matrixSelectedBoard[y * 5 + x] = matrixColorToSelect;

			// 選択されたボックスを描く。
			matrix_drawBoard(matrixSelectedBoard);

			// 判定
			if (matrixSelectedBoxes.length == g_matrixLevel+1) { // selection is done
				matrixCurResult = 1; /*OK - correct*/
				for (var i = 0; i < matrixSelectedBoxes.length; i ++) {
					if (matrixBoard[matrixSelectedBoxes[i]] != matrixColorToSelect) {
						matrixCurResult = 2; /* NG */
					}
				}

				matrix_processTraining4(matrixCurResult);
			}
		});
	});
	// 『右脳開発トレーニングマトリックス』画面の表示時点
	$("#matrix_page2").live('pagebeforeshow', function(prevPage) {
		if (matrixRecCurr < 0) {
			matrixRecCurr = 0;
		}
		g_showScore("matrix_level_no", g_matrixLevel);
		g_showScore("matrix_correct_cnt", matrixRecCurr);
		matrix_resetTraining();
	});
	$("#matrix_page2").live('pageshow', function(prevPage) {
		
	});

	// 『右脳開発トレーニングマトリックス』画面の初めての表示時点 - 結果表示の画面
	$("#matrix_page3").live('pageinit', function(event, data) {
	});
	// 『右脳開発トレーニングマトリックス』画面の表示時点 - 結果表示の画面
	$("#matrix_page3").live('pagebeforeshow', function(prevPage) {
		g_showScore2("matrix_page3_result1", matrixRecCurr);  // 今回の記録
		g_showScore2("matrix_page3_result2", matrixRecords[g_matrixLevel]['prev']);  // 前回の記録
		g_showScore2("matrix_page3_result3", matrixRecords[g_matrixLevel]['max']);  // 最高記録

		if (matrixRecCurr > matrixRecords[g_matrixLevel]['max']) {
			$("#matrix_page3_updated").css('display', 'block');
		} else {
			$("#matrix_page3_updated").css('display', 'none');
		}
	});
});

/**
 * ＳＴＥＰ番号によって画面表示を変更する。
 */
function matrix_refreshGuidePage() {
	if (g_matrixLevel < 1) {
		g_matrixLevel = 1;
	}
	if (g_matrixLevel > g_matrixMaxLevel) {
		g_matrixLevel = g_matrixMaxLevel;
	}

	// 'previous' button
	if (g_matrixLevel == 1) {
		$("#matrix_navi_prev a").removeClass("matrix_hoverable_prev");
	} else {
		$("#matrix_navi_prev a").addClass("matrix_hoverable_prev");
	}

	// 'next' button
	if (g_matrixLevel == g_matrixMaxLevel) {
		$("#matrix_navi_next a").removeClass("matrix_hoverable_next");
	} else {
		$("#matrix_navi_next a").addClass("matrix_hoverable_next");
	}

	// Step number
	$("#matrix_navi_step").css("background-image", "url(assets/img/record/record_num"+g_matrixLevel+".png)");

	// Box count
	$("#matrix_guide").css("background-image", "url(assets/img/matrix/e21_msg_num"+(g_matrixLevel + 1)+".png), url(assets/img/matrix/e21_pic"+g_matrixLevel+".png)");

	// 記録情報を表示する。
	g_showScore("matrix_result1", matrixRecords[g_matrixLevel]['prev']);
	g_showScore("matrix_result2", matrixRecords[g_matrixLevel]['max']);
	g_showScore("matrix_result3", matrixRecords[g_matrixLevel]['total']);
	g_showScore("matrix_result4", matrixRecords[g_matrixLevel]['correct']);
	g_showScore("matrix_result5", (matrixRecords[g_matrixLevel]['total'] == 0) ? 0 : Math.floor(matrixRecords[g_matrixLevel]['correct'] * 10000 / matrixRecords[g_matrixLevel]['total'] + 0.5) / 100);
}

/**
 * タイマーを再生させる。
 * 
 * @param interval {Integer}
 */
function matrix_restartTimer(interval) {
	if (matrixTimerAniID > 0) {
		clearInterval(matrixTimerAniID);
		matrixTimerAniID = 0;
	}

	matrixTimerCnt = 0;
	matrixTimerType = interval;

	$("#matrix_timebar div").css('width', "0");
	matrixTimerAniID = setInterval(matrix_refreshTimerBar, 1000/*1s*/);
}

/**
 * タイマーを停止させる。
 */
function matrix_pauseTimer(state) {
	if (state) { // running
		matrixTimerAniID = setInterval(matrix_refreshTimerBar, 1000/*1s*/);
	} else { // paused
		if (matrixTimerAniID > 0) {
			clearInterval(matrixTimerAniID);
			matrixTimerAniID = 0;
		}
	}
}

/**
 * タイマーアニメを無くす。
 */
function matrix_removeTimerAnimation() {
	if (matrixTimerAniID > 0) {
		clearInterval(matrixTimerAniID);
		matrixTimerAniID = 0;
	}
	matrixTimerType = 0;
	matrixTimerCnt = 0;
}

/**
 * タイマーの長さを変更する。
 */
function matrix_refreshTimerBar() {
	matrixTimerCnt ++;

	if (matrixTimerCnt > matrixTimerType) {
		matrix_removeTimerAnimation();
	} else {
		$("#matrix_timebar div").css('width', (matrixTimeBarWidth * matrixTimerCnt / matrixTimerType) + "px");
	}
}

/**
 * このトレーニングを初期化する。
 */
function matrix_resetTraining() {
	var i = 0;

	// 1. Generate and draw six(6) of random colored box
	matrixBoard = null;
	matrixBoard = g_genRandomColoredArray(3, g_matrixLevel + 1, 25); // 3: number of colors, 2: boxes filled by every color, 25: 5 * 5
	
	// 2. Set 'status' to 0 (inital status)
	matrixStatus = 0;
	matrixCurResult = 0;
	matrix_drawBoard(matrixBoard);

	matrixColorToSelect = g_randomNumber(1, 3);
	matrixCCBoard[12] = matrixColorToSelect; // set center-box's color
	matrixSelectedBoxes = null; matrixSelectedBoxes = [];
	matrixSelectedBoard = null; matrixSelectedBoard = []; for(i = 0; i < 25; i++) {matrixSelectedBoard[i] = 0;}

	$("#matrix_canvas").css('display', '');
	$("#matrix_timebar").css('display', '');
	$("#matrix_comment").css('display', '');
	$("#matrix_level_no").css('display', '');
	$("#matrix_correct_cnt").css('display', '');

	matrix_restartTimer(10);
	$("#matrix_comment").css('background-image', 'url(assets/img/unou/unou_training_txt1.png)'); // １０秒間で記憶してください。
	matrixStepTimerID = setTimeout(matrix_processTraining1, 10500/*10s*/);

	// button's states
	$("#matrix_page2 .btn_stop").css('display', 'block');
	$("#matrix_page2 .btn_next").css('display', 'none');
	$("#matrix_page2 .btn_exit").css('display', 'none');
}

/**
 * １０秒の間、マトリックスを見せてもらった後の処理。
 */
function matrix_processTraining1() {
	// ファイトボードを表示する。
	matrix_drawBoard([]);
	
	// ガイドのコメントを変える。
	$("#matrix_comment").css('background-image', 'url(assets/img/unou/unou_training_txt2.png)'); // ５秒お待ちください。

	// タイマーを開始させる。（５秒）
	matrix_restartTimer(5);

	matrixStatus = 1;
	matrixStepTimerID = setTimeout(matrix_processTraining2, 5500/*5s*/);
	matrix_restartTimer(5);
}

/**
 * ５秒の間、ファイトボードを見せてもらった後の処理。
 */
function matrix_processTraining2() {
	// 選択するべきの色を表示する。
	matrix_drawBoard(matrixCCBoard);
	
	// ガイドのコメントを変える。
	$("#matrix_comment").css('background-image', 'url(assets/img/unou/unou_training_txt3.png)'); // この色はどこにありましたか？

	// タイマーを開始させる。（２秒）
	matrix_restartTimer(2);

	matrixStatus = 2;
	matrixStepTimerID = setTimeout(matrix_processTraining3, 2500/*2s*/);
}

/**
 * ２秒の間、選択するべきの色を見せた後の処理。
 */
function matrix_processTraining3() {
	// ファイトボードを表示する。
	matrix_drawBoard([]);
	
	// ガイドのコメントを変える。
	$("#matrix_comment").css('background-image', 'url(assets/img/unou/unou_training_txt4.png)'); // 正確のマスを選択してください。
	
	// タイマーを開始させる。（１０秒）
	matrix_restartTimer(10);

	matrixStatus = 3;
	matrixStepTimerID = setTimeout(matrix_processTraining4, 10500/*10s*/);
}

/**
 * １０秒の間、正しいものを選択させてもらった後の処理。
 */
function matrix_processTraining4(result) {
	if (matrixCurResult != 0 && typeof(result) == 'undefined') { // 正解・不正解が決まった後、タイムアウトになった場合
		return;
	}
	if (matrixStatus != 3) {
		return;
	}

	// タイマーを強制に終了させる。
	if (matrixCurResult != 0) {
		matrix_pauseTimer(0);
		clearTimeout(matrixStepTimerID);
	}
	matrixStepTimerID = 0;

	matrixRecords[g_matrixLevel]['total'] ++;
	$("#matrix_page2 .btn_stop").css('display', 'none');

	if (matrixCurResult == 0) { // 時間切れ
		$("#matrix_comment").css('background-image', 'url(assets/img/result/resultStr3.png)');
		$("#matrix_page2 .btn_next").css('display', 'none');
		$("#matrix_page2 .btn_exit").css('display', 'block');

		matrixFlickerCnt = 0;
		matrixFlickerTimerID = setInterval(matrix_flickerCorrectBoard, 200/*ms*/);
		matrix_flickerCorrectBoard();

		g_playSound('ng');
	} else if (matrixCurResult == 1) { // 正解
		$("#matrix_comment").css('background-image', 'url(assets/img/result/resultStr1.png)');
		matrixRecCurr ++;
		g_showScore("matrix_correct_cnt", matrixRecCurr);
		matrixRecords[g_matrixLevel]['correct'] ++;
		$("#matrix_page2 .btn_next").css('display', 'block');
		$("#matrix_page2 .btn_exit").css('display', 'block');
		matrix_drawSignImage(1);

		g_playSound('ok');
	} else { // 不正解
		$("#matrix_comment").css('background-image', 'url(assets/img/result/resultStr2.png)');
		$("#matrix_page2 .btn_next").css('display', 'none');
		$("#matrix_page2 .btn_exit").css('display', 'block');
		matrix_drawSignImage(0);

		setTimeout(function() {
			matrixFlickerCnt = 0;
			matrixFlickerTimerID = setInterval(matrix_flickerCorrectBoard, 200/*ms*/);
			matrix_flickerCorrectBoard();
		}, 1000); // after 1s, start flickering correct color-arrangement

		g_playSound('ng');
	}

	matrixStatus = 4;
}

/**
 * 一つのボードを指定の場所に描く。
 * 
 * @param clr {Array}
 */
function matrix_drawBoard(clr) {
	var i = 0;
	var x = 0, y = 0;

	// 0. fill white color on board
    matrixCanvasContext.fillStyle = "white";
	//matrixCanvasContext.strokeStyle="white";
    matrixCanvasContext.rect(matrixHorSpace, matrixVerSpace, matrixBoxSize * 5, matrixBoxSize * 5);
    matrixCanvasContext.fill();
	
	// 1. draw rectangle boxes
	if (typeof(clr) == 'object' && clr.length > 0) {
		for (i = 0; i < clr.length; i ++) {
			x = matrixHorSpace + matrixBoxSize * (i % 5);
			y = matrixVerSpace + matrixBoxSize * Math.floor(i / 5);

			matrixCanvasContext.fillStyle = (clr[i] == 0) ? '#FFFFFF' : matrixColors[clr[i]];
			matrixCanvasContext.fillRect(x, y, matrixBoxSize, matrixBoxSize);
		}
	}

	// 2. draw border lines
	matrixCanvasContext.strokeStyle="#000000"; // black
	matrixCanvasContext.beginPath();
	for (i = 0; i < 6; i ++) {
		// vertical
		matrixCanvasContext.moveTo(matrixHorSpace + i * matrixBoxSize, matrixVerSpace);
		matrixCanvasContext.lineTo(matrixHorSpace + i * matrixBoxSize, matrixVerSpace + 5 * matrixBoxSize);

		// horizontal
		matrixCanvasContext.moveTo(matrixHorSpace, matrixVerSpace + i * matrixBoxSize);
		matrixCanvasContext.lineTo(matrixHorSpace + 5 * matrixBoxSize, matrixVerSpace + i * matrixBoxSize);
	}
	matrixCanvasContext.stroke();
}

/**
 * ○、×の記号を表示する。
 * 
 * @param sign {Boolean}
 */
function matrix_drawSignImage(sign) {
	var imgSrc = $("#" + (sign ? "img_ok" : "img_ng"))[0];

	matrixCanvasContext.drawImage(imgSrc, matrixHorSpace, matrixVerSpace, matrixBoxSize * 5, matrixBoxSize * 5 );
}

/**
 * Flicker correct board
 */
function matrix_flickerCorrectBoard() {

	if (matrixFlickerCnt % 2 == 0) {
		// draw white
		matrix_drawBoard([]);
	} else {
		var oneColorMatrix = [];
		for (var i = 0; i < 25; i ++) {
			oneColorMatrix[i] = (matrixColorToSelect == matrixBoard[i]) ? matrixColorToSelect : 0;
		}

		// draw board (correct color-arrangement)
		matrix_drawBoard(oneColorMatrix);

		if (matrixFlickerCnt > 5) {
			clearInterval(matrixFlickerTimerID);
			matrixFlickerTimerID = 0;

			if (matrixCurResult == 2) { // incorrect
				$.mobile.changePage("#matrix_page3", {
					//type: "post",
					//data: $("form#search").serialize(), 
					transition : "slide"
				});
			}
		}
	}
	matrixFlickerCnt ++;
}