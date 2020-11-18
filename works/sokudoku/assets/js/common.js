/**
 * 共通関数
 *
 * @author K, SSJ
 * @since 2012/09/21
 */

var g_textFilePath = 'assets/string/';
var g_newsStepNum = 0; // 1-5
var g_mailStepNum = 0; // 1-2
var g_matrixLevel = 0; // 1-5

var g_newsMaxStep = 5;
var g_mailMaxStep = 2;
var g_trainingPeriod = 60000; // ms
var g_matrixMaxLevel = 5;

var g_speedList = [500, 750, 1000, 1500, 2000, 2500]; // 1分当たり読み文字数

/**
 * Play sound
 *
 * @param type {String}
 */
function g_playSound(type) {
	if (type != 'cursor' && type != 'ok' && type != 'ng') {
		return false;
	}
	var audioPlayer = document.getElementById(type + '_sound');
	if (audioPlayer && ('play' in audioPlayer)) {
		audioPlayer.play();
	} else {
		// @todo load and play sound file
	}	
}

/**
 * Read text file specified by name
 *
 * After reading, 'callback' function will be called.
 * The 'callback' function needs to accept some parameters;
 * - contents : {String} text data read
 * - errNo : 0 - no error, 1 - file not found, 2 - unknown
 *
 * @param fileName {String}
 * @param callback
 */
function g_readTextFile(fileName, callback, syncMode) {
	if (callback == undefined || callback == null)	{
		return;
	}
	var filePath = g_textFilePath + fileName;
	$.ajax({
		async: (typeof(syncMode) === 'undefined' ? true : !syncMode),
		type: "GET",
		dataType: "text",
		url: filePath,
		data: '',
		success: function(contents){
			//alert(msg);alert(callback);
			callback(contents, 0);
		},
		error: function (xmlHttpRequest, textStatus, errorThrown) {
			//this; // the options for this ajax request
			//alert(textStatus + ':' + errorThrown);
			callback(errorThrown, 2);
		}
	});
}

/**
 * Get Random Number between {start} and {end}
 * 
 * @param start {Integer}
 * @param end {Integer}
 * @return {Integer}
 */
function g_randomNumber(start, end) {
	var n = Math.max(start, end) - Math.min(start, end)+1;
	var ret = Math.floor(Math.random() * n * n) % n;

	return ret + Math.min(start, end);	
}

/**
 * Get random-colored array
 * 
 * @param colors {Integer}
 * @param boxesPerColor {Integer}
 * @param arrLength {Integer}
 * @return {Array}
 */
function g_genRandomColoredArray(colors, boxesPerColor, arrLength) {
	var i = 0, j = 0, k = 0;
	var result = [];
	var emptyCnt = 0;

	for (i = 0; i < arrLength; i ++) {
		result[i] = 0;
	}

	for (i = 0; i < colors * boxesPerColor; i++) {
		// random integer between 0 ~ (n-1)
		k = g_randomNumber(0, arrLength-1);

		emptyCnt = 0;
		for (j = 0; j < result.length; j++) {
			if (result[j] == 0) {
				if (emptyCnt == k) {
					result[j] = i % colors + 1;
					break;
				} else {
					emptyCnt ++;
				}
			}
		}

		arrLength --; // decrease empty boxes' count
	}
	
	return result;
}

/**
 * 数値を画像で表示する。
 *
 * @param targetID {String} 位置（Ex: differ_result1）
 * @param score {String} ポイント(Ex: 38.55)
 */
function g_showScore(targetID, score) {
	score = score + '';

	var i = 0;
	var tmp = 0;
	var scoreHTML = "";

	for (i = score.length-1; i >= 0 ; i--) {
		if ( '.' == score.charAt(i) ) {
			scoreHTML += "<div class=\"record_item record_point\"></div>";
		} else {
			scoreHTML += "<div class=\"record_item record_num" + score.charAt(i) + "\"></div>"; // 0-9
		}
	}

	$("#"+targetID).html(scoreHTML);
}

$(document).bind('pageinit', function(event, data) {
	//alertObject(event);
	//alertObject(data);
	//g_playSound('cursor');
});

/**
 * 数値を画像で表示する。
 *
 * @param targetID {String} 位置（Ex: differ_result1）
 * @param score {String} ポイント(Ex: 38.55)
 */
function g_showScore2(targetID, score) {
	score = score + '';

	var i = 0;
	var tmp = 0;
	var scoreHTML = "";

	for (i = score.length-1; i >= 0 ; i--) {
		if ( '.' == score.charAt(i) ) {
			//scoreHTML += "<div class=\"record_item record_point\"></div>";
		} else {
			scoreHTML += "<div class=\"record_item_s record_num" + score.charAt(i) + "_s\"></div>"; // 0-9
		}
	}

	$("#"+targetID).html(scoreHTML);
}

$(document).bind('pageinit', function(event, data) {
	//alertObject(event);
	//alertObject(data);
	//g_playSound('cursor');
});
