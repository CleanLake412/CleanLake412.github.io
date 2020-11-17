
let forkText1 = `
何についてのお問い合わせでしょうか？
- データの作り方・修正方法
  どのようなデザインでしょうか？
  - 共通事項
    共通事項についてのお問い合わせですね。
    お知りになりたい内容をもう少し詳しくお知らせください。
    - 連続する番号を作りたい
      連続する番号はどのように使用しますか？
      - 部屋番号として分割して使用する
        データを1つずつに分けて入稿してください。
      - 分割して使用しない
        誠に恐れ入りますが製作を承ることはできません。
  - 画像データでの入稿
    画像データでの入稿についてのお問い合わせですね。
    お知りになりたい内容をもう少し詳しくお知らせください。
    - 注文できるか知りたい
      どのような内容でお考えですか？
      - 手元にある実物と同じものを作りたい
        大変お手数ではございますが、データをご用意いただくか、手元にある実物をスキャナーでスキャンしてデータ化してからオーダーフォームから入稿してください。
      - 指示書や手書きのイメージ図
        誠に恐れ入りますが、承ることはできません。デザインとして完成しているデータをご用意ください。
  - Illsutatorデータでの入稿
    ご不明点はなんですか？
    - ガラスの内側から貼りたい
    - ガラスの内側から貼りたい場合
      ※1、Illustratorのデータは左右反転した状態で作成してください。
      ※1 ガラスの外側から見て正しい方向に見えるという意味。ガラスの外側から見ると粘着面が見えている状態となります。
    - データ上のサイズ
      必ず原寸大でデータ作成してください。なお製作可能サイズは60cm x 300cm以内です。
    - データ上の色の設定
      最終的な仕上がりはどういう配色のイメージでしょうか？
      - 仕上がりのシートカラーはホワイト
        Illustratorで作成したデータ上のシートとして残したい部分は必ず黒色で作成してください。
      - 仕上がりのシートカラーはホワイト以外
        Illustratorで作成したデータ上の、シートとして残したい部分は必ず黒色で作成してください。
      - 仕上がりのシートカラーは2色以上使う
        Illustratorで作成したデータ上の、シートとして残したい部分は必ず実際に使用するシートカラーに似た色で作成してください。

- 納期・金額
  納期・金額についてのお問い合わせですね。
  お知りになりたい内容をもう少し詳しくお知らせください。
  - 納期・金額を早く知りたい
    納期、金額についてお電話やお問い合わせフォームから一切回答しておりません。以下のページより操作してください。
    お見積り：お見積り依頼
    概算のお見積り：料金シミュレーター
    概算の納期のみ：納期・配送を計算
    金額：各シートの価格のみ記載

- 製品・シートカラー
  製品・シートカラーについてのお問い合わせですね。
  お知りになりたい内容をもう少し詳しくお知らせください。
  - 製品
    お知りになりたい内容をもう少し詳しくお知らせください。
    - 印刷してほしい
      印刷物の注文は承っておりません。カッティングシートのみの取り扱いです。カッティングシートと印刷の違いとは。
    - フルカラーで作りたい
      カッティングシートは印刷ではないため承ることはできません。
    - 糊の強度
      全て屋外仕様です。各シートのページに記載がありますので確認してください。
  - シートカラー
    お知りになりたい内容をもう少し詳しくお知らせください。
    - 取り扱いのないシートで製作希望
      価格・色見本のページに記載のないシートは取り扱いがないため作れません。

- 貼り方・剥がし方
  貼り方・剥がし方についてのお問い合わせですね。
  お知りになりたい内容をもう少し詳しくお知らせください。
  - 貼れるかどうか知りたい
    どういう物や場所に貼る予定ですか？
    - 〇〇に貼れますか？
      実物を確認できないため、カラーサンプルを請求してご自身で確認してください。
      貼れる場所貼れない場所のページを確認してください。
      ページにない場合はカラーサンプルを取り寄せて実際に貼ってみてください。


- 見積もり・注文
  見積もり・注文についてのお問い合わせですね。
  お知りになりたい内容をもう少し詳しくお知らせください。
  - 早く見積もりが欲しい
    誠に恐れ入りますがデータチェック、お見積りは順番にお返ししております。順番を入れ替えて優先的に返すことはありませんので、もう暫くお待ちください。

`;


/**
 * お問い合わせ分岐のテキストから分岐データを取得する。
 * 2020.11.12 CleanLake 新規作成
 *
 * @param forkText
 * @return object
 */
function parseChatForksText(forkText) {
    let tmpLines = forkText.split("\n");
    let lines = [];

    tmpLines.forEach((val, i) => {
        if (val.trim().length > 0) {
            lines.push(val);
        }
    });

    let forks = analyzeChatForks(lines, 0, -1);
    return forks.forkNode;
}

/**
 * テキスト行を分析して親子関係を確認する。
 *
 * Fork Node :  {title:"",instruction:"",children:[nodes]}
 *
 * @param lines
 * @return {forkNode,lineNo}
 */
function analyzeChatForks(lines, lineNo, parentLevel) {

    if (lineNo >= lines.length) {
        return null;
    }

    let forkNode = {
        title      : "",
        instruction: "",
        children   : []
    };

    // title
    if (lineNo > 0 && lineNo < lines.length) {
        if (countHeadSpace(lines[lineNo]) == parentLevel*2
            && lines[lineNo].trim().substr(0, 2) == '- '
        ) {
            forkNode.title = lines[lineNo].trim().substr(2);
            lineNo ++;
        } else {
            console.warn("This line should title of node. Line " + lineNo + ", " + lines[lineNo]);
        }
    }

    // instruction
    while (lineNo < lines.length) {
        if (lines[lineNo].trim().substr(0, 2) == '- ') {
            break;
        }

        forkNode.instruction = forkNode.instruction.length > 0 ? forkNode.instruction + "\n" : forkNode.instruction;
        forkNode.instruction = forkNode.instruction + lines[lineNo].trim();
        lineNo ++;
    }

    if (forkNode.title.length == 0 && forkNode.instruction.length == 0) {
        console.warn("Invalid depth of node. Line " + lineNo + ", " + lines[lineNo]);
    }

    // children
    while (true) {
        if (lineNo >= lines.length
            || countHeadSpace(lines[lineNo]) != (parentLevel+1)*2 // children level
        ) {
            break;
        }

        let childNode = analyzeChatForks(lines, lineNo, parentLevel+1);
        if (childNode == null) {
            break;
        }
        lineNo = childNode.lineNo;
        forkNode.children.push(childNode.forkNode);
    }

    if (forkNode.title.length == 0 && forkNode.instruction.length == 0 && forkNode.children.length == 0) {
        console.warn("Empty node. Line " + lineNo + ", " + lines[lineNo]);
        return null;
    }

    return {forkNode, lineNo};
}

/**
 * Count number of space
 *
 * @param lineText
 * @return {number|*}
 */
function countHeadSpace(lineText) {
    for (let i = 0; i < lineText.length; i++) {
        if (lineText.substr(i, 1) !== ' ') {
            return i;
        }
    }
    return lineText.length;
}
