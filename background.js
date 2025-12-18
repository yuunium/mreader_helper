// const MODEL = "gemini-2.0-flash"; // 使えるモデルに合わせて変更OK
// const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.type === "SEND_QUESTION") {
//     handleQuestion(message.payload, sendResponse);
//     return true; // ← asyncで返すとき必須
//   }
// });

// // Gemini APIを呼び出す関数（promptText ではなく「contents」を受け取る）
// async function callGemini(apiKey, contents) {
//   const res = await fetch(ENDPOINT, {//  ←ここでAPIを呼び出す、処理が終わるまで待つ
//     method: "POST",//データを送るのでPOST
//     headers: {//データの形式
//       "Content-Type": "application/json",
//       "x-goog-api-key": apiKey
//     },
//     body: JSON.stringify({//データの中身
//       contents: contents//プロンプトをセット
//     })
//   });

//   const data = await res.json();//APIのレスポンスをJSONとして取得
//   if (!res.ok) {
//     throw new Error(data?.error?.message || "Gemini API error");
//   }

//   return data.candidates?.[0]?.content?.parts?.map(function (p) { return p.text; }).join("") ?? "";//dataのcandidates[0]とcontentとpartsのどれか一つでも存在しなかった場合は空文字を返す。partに入っている文章を一つ一つとりだしたあとjoinで配列を一つの文字列にまとめる。
// }

// // 「問題文＋選択肢」を1つの文字列に整形（choicesは配列想定）
// function buildQuestionBlock(questionText, choicesArray) {
//   // choicesArray例: ["A. ...", "B. ...", "C. ..."]
//   const choicesText = choicesArray.join("\n");

//   return (
//     "【問題】\n" +
//     questionText + "\n\n" +
//     "【選択肢】\n" +
//     choicesText
//   );
// }

// // 拡張アイコンをクリックしたら実行
// chrome.action.onClicked.addListener(async function () {//
//   try {
//     const apiKey = "YOUR_API_KEY_HERE";// ここにAPIキーを入れてください、変数的にやるときは知らん
//     const bookname = "YOUR_BOOK_NAME_HERE";// ここに本の名前を入れてください、変数的にやるときは知らん
    


//     const instructionText =
//       "「" + bookname + "」この本の内容に関する質問をするので\n" +
//       "出力は次の形式で固定してください：\n" +
//       "- answer: 1/2/3/4 のいずれか1文字\n" //これが指示文「この本の内容に関する質問をするので～」。多分毎回送れば回答が安定する。

//     const questionText = "（ここに問題文が入っている想定）";
//     const choices = [
//       "1. （選択肢1）",
//       "2. （選択肢2）",
//       "3. （選択肢3）",
//       "4. （選択肢4）"
//     ];
//     // --- ここまで ---

//     const questionBlock = buildQuestionBlock(questionText, choices);// 「問題文＋選択肢」を1つの文字列に整形、要らんかったら消しといて。

//     // Gemini API呼び出し時のプロンプト
//     const contents = [
//       {
//         role: "user",
//         parts: [{ text: "【指示】\n" + instructionText }]
//       },
//       {
//         role: "user",
//         parts: [{ text: questionBlock }]
//       }
//     ];

//     const answer = await callGemini(apiKey, contents);//ここに答えが入る
//     console.log("Gemini answer:", answer);
//   } catch (e) {
//     console.error("Error:", e);
//   }
// });


/*************************************************
 * Gemini 設定
 *************************************************/


function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(
      { ApiKey: "", Model: "" , book_name: "" },
      (items) => resolve(items)
    );
  });
}

function endpointForModel(Model) {
  return `https://generativelanguage.googleapis.com/v1beta/models/${Model}:generateContent`;
}

/*************************************************
 * Gemini API 呼び出し
 *************************************************/
async function callGemini(apiKey, contents, Model) {
  const res = await fetch(endpointForModel(Model), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify({
      contents: contents
    })
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Gemini API error");
  }

  return (
    data.candidates?.[0]?.content?.parts
      ?.map(p => p.text)
      .join("") ?? ""
  );
}

/*************************************************
 * 問題文ブロック生成
 *************************************************/
function buildQuestionBlock(questionText, promptText, optionsArray) {
  return (
    "【問題】\n" +
    questionText + "\n\n" +
    "【補足】\n" +
    promptText + "\n\n" +
    "【選択肢】\n" +
    optionsArray.join("\n")
  );
}

/*************************************************
 * content.js からのメッセージ受信
 *************************************************/
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SEND_QUESTION") {
    handleQuestion(message.payload, sendResponse);
    return true; // async response 必須
  }
});

/*************************************************
 * 問題処理メイン
 *************************************************/
async function handleQuestion(payload, sendResponse) {
  try {

    const { ApiKey, Model , book_name} = await getSettings();
    
    const {
      q_text,
      prompt,
      options
    } = payload;

    // 指示文（毎回送ると回答が安定する）
    const instructionText =
      "あなたは次の本の内容に基づいて質問に答えてください。\n" +
      "本のタイトル: 「" + book_name + "」\n\n" +
      "出力形式は必ず以下で固定してください。\n" +
      "- answer: 1 / 2 / 3 / 4 のいずれか1文字のみ\n\n" +
      "それでは、以下の質問に答えてください。\n\n"+
      q_text +"\n" +
      prompt +"\n" +
      options + "\n";

    const contents = [
      {
        role: "user",
        parts: [{ text: instructionText }]
      }
    ];

    console.log("Gemini contents:", instructionText);
    console.log("model used:", Model);

    const answerText = await callGemini(ApiKey, contents, Model);
    console.log("Gemini raw answer:", answerText);

    // content.js に返す
    sendResponse({
      answer: answerText.trim()
    });

  } catch (error) {
    console.error("Gemini error:", error);
    sendResponse({
      answer: "ERROR"
    });
  }
}
