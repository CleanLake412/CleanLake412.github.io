/**
 * 『読書速度計測』画面のＪＳコード
 *
 * @author K, SSJ
 * @since 2012/09/21
 */

var measureBeginTime = 0;
var measureEndTime = 0;
var measureWittenLetters = 0;

var measureCanvasContext = null;
//var measureTextContents = "";
var measureCanvasWidth = 0; //640;
var measureCanvasHeight = 0; //700;//940 * 75%

var measureHorPadding = 30;
var measureVerPadding = 30;

var measureLettersPerLine = 20;
var measureLines = 15;

var measureTextFiles = 15; // text1.txt ~ text15.txt

$(function() {
	// 『読書速度計測』画面の初めての表示時点
	$("#measure_page2").live('pageinit', function(event, data) {
		var measureCanvas = $("#measure_canvas")[0];
		if (!measureCanvas.getContext) { // canvas unsupported
			return;
		}
		measureCanvasContext = measureCanvas.getContext("2d");
		measureCanvasWidth = measureCanvas.width;
		measureCanvasHeight = measureCanvas.height;
	});
	// 『読書速度計測』画面の表示時点
	$("#measure_page2").live('pagebeforeshow', function(prevPage) {
		if (null == measureCanvasContext) {
			$("#measure_page2").trigger('pageinit');
		}
		var textFileNo = Math.floor(Math.random() * (measureTextFiles * measureTextFiles)) % measureTextFiles + 1;
		
		g_readTextFile('text'+textFileNo+'.txt', function(contents, errNo){
			if (errNo == 0) {
				//measureTextContents = contents;
				measureWittenLetters = measure_drawText(contents);
			} else { // fatal error: failed to read text file
				//@todo
			}
		});
	});
	$("#measure_page2").live('pageshow', function(prevPage) {
		//measureBeginTime = event.timeStamp;
		//alert('読書速度計測: ' + measureFirstTime);
		measureBeginTime = (new Date()).valueOf();
	});

	// Canvas click (or touch) event
	$("#measure_canvas").bind("vclick", function() {
		measureEndTime = (new Date()).valueOf();
		if (measureCanvasContext == null || measureBeginTime == 0 || measureWittenLetters == 0) {
			return;
		}
		var speedPerMin = measureWittenLetters * 60000 / (measureEndTime-measureBeginTime);
		speedPerMin = Math.floor(speedPerMin);
		//alert(speedPerMin);
		measure_outputResult(speedPerMin);
	});
});

/**
 * 読書速度計測に利用するテキストを描く。
 * 20 文字、15 行（縦列)
 *
 * @param text {String}
 */
function measure_drawText(text) {
	if (measureCanvasContext == null) {
		return;
	}

	var textLen = 0;
	var x = 0, y = 0;
	var offsetX = 0, offsetY = 0;
	var col = 1; line = 0;
	var boxW, boxH, fontSize;
	var writtenLetters = 0;
	var chr = '';

	boxW = (measureCanvasWidth - measureHorPadding*2) / measureLines;
	boxH = (measureCanvasHeight - measureVerPadding*2) / measureLettersPerLine;
	fontSize = Math.floor(Math.min(boxW, boxH) * 0.875);

	offsetX = measureHorPadding + (boxW-fontSize) / 2;
	offsetY = measureVerPadding + fontSize - (boxH-fontSize) / 2;

	// Paint it white.
    measureCanvasContext.fillStyle = "white";
    measureCanvasContext.rect(0, 0, measureCanvasWidth, measureCanvasHeight);
    measureCanvasContext.fill();

	// Draw text
	measureCanvasContext.fillStyle="#000000";
	measureCanvasContext.font = fontSize + "px ＭＳ Ｐゴシック Bold";

	text = text.replace(new RegExp("\r\n", "g"), "\n");
	//text = text.replace("　", " "); // Full-Space >> Half-Space
	textLen = text.length;

	for (var i = 0; i < textLen; i++) {
		if (col >= measureLettersPerLine) { // change line whenever current line is full
			line ++;
			col = 0;
		}
		if (line >= measureLines) { // terminate when line number is over
			break;
		}

		chr = text.substr(i, 1);
		if (chr == "\n") {
			//if (line == 0 && col > 1) { // after title line
			//	line ++;
			//}
			line += 2;
			col = 0;
			continue;
		} else if (chr == " " || chr == "　" ) {
			col ++;
			continue;
		}

		// 文字を出力する座標。
		//drawString(strInRange, posX(x - col * d), posY(y + row * d), font);
		x = offsetX + boxW * (measureLines-line-1);
		y = offsetY + boxH * col;

		// 記号文字を縦表示用に変換する。
		if (chr == "。" || chr == "、") {
			x += boxW / 3;
			y -= boxH / 3;
		} else if (chr == "「") {
			chr = "﹁";
			y -= boxH / 3;
		} else if (chr == "」") {
			chr = "﹂";
			y += boxH / 3;
		} else if (chr == "（") {
			chr = "︵";
			//y -= boxH / 3;
		} else if (chr == "）") {
			chr = "︶";
			y += boxH / 3;
		} else if (chr == "→") {
			chr = "↓";
			//y += boxH / 3;
		} else if (chr == "←") {
			chr = "↑";
			//y += boxH / 3;
		} else if (chr == "ー") {
			chr = "｜";
			//y += boxH / 3;
		}
		measureCanvasContext.fillText(chr, x, y);
		writtenLetters ++;
		col ++;
	}

	return writtenLetters;
}

function measure_outputResult(speedPerMin) {
	var evaluationResult = '平均より少し速いです。';
	measureWittenLetters = 0; // disallow to retouch

	// 速度判定
	if (speedPerMin > 3000) {
		evaluationResult = "速読の領域に入っています。";
	} else if (speedPerMin > 2000) {
		evaluationResult = "とても速いです。";
	} else if (speedPerMin > 1000) {
		evaluationResult = "かなり速いです。";
	} else if (speedPerMin >  700) {
		evaluationResult = "平均より少し速いです。";
	} else if (speedPerMin >  500) {
		evaluationResult = "平均的です。";
	} else {
		evaluationResult = "平均以下です。";
	}

	// 12345 => 1 2 3 4 5 
	speedPerMin += "";
	speedPerMin = speedPerMin.split("").join(" ") + " ";

	// Paint it white.
    measureCanvasContext.fillStyle = "white";
    measureCanvasContext.rect(0, 0, measureCanvasWidth, measureCanvasHeight);
    measureCanvasContext.fill();

	//'あ な た の 読 書 速 度 は、';
	//'字 ／ 分です。';
	//'あなたの読書速度は、';
	//'平均より少し速いです。';

	// 'あ な た の 読 書 速 度 は、'
	measureCanvasContext.fillStyle="#000000";
	measureCanvasContext.font = "28px ＭＳ Ｐゴシック Bold";
	measureCanvasContext.fillText('あ な た の 読 書 速 度 は、', 120, 250);

	//'字 ／ 分です。';
	measureCanvasContext.font = "36px ＭＳ Ｐゴシック Bold";
	measureCanvasContext.fillText(speedPerMin + '字 ／ 分です。', 120, 350);

	// 'あなたの読書速度は、'
	measureCanvasContext.fillStyle="#000000";
	measureCanvasContext.font = "32px ＭＳ Ｐゴシック Bold";
	measureCanvasContext.fillText('あなたの読書速度は、', 120, 500);

	// output evaluation result
	measureCanvasContext.font = "32px ＭＳ Ｐゴシック Bold";
	measureCanvasContext.fillText(evaluationResult, 120, 550);
}