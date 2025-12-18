let lazy = document.querySelectorAll('.lazy');

let book_name = "";
let q_text;
let prompt;
let options = []; // 配列として初期化

lazy.forEach(btn => {
  btn.addEventListener('click', handleClick);
});
function handleClick(event) {
  // クリックされた要素は event.currentTarget

  book_name = event.currentTarget.closest('td').querySelectorAll('div')[1].textContent;
  console.log("Selected book_name:", book_name);
  chrome.storage.sync.set({
    book_name: book_name
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {

    chrome.storage.sync.get(["book_name"], (data) => {
      if (typeof data.book_name === "string") {
        book_name = data.book_name;
        console.log("Loaded book_name:", book_name);
      }else{
        console.log("No book_name found in storage.");
      }
    });

    q_text = document.querySelectorAll('.qtext')[0].textContent;
    prompt = document.querySelectorAll('.prompt')[0].textContent;

    let temp_options = [];
    document.querySelectorAll('.answer > div > label').forEach((label) => {
      temp_options.push(label.textContent); // 配列に追加
    });
    options = temp_options;

    console.log("q_text:", q_text);
    console.log("prompt:", prompt);
    console.log("options:", options);

    chrome.runtime.sendMessage(
      {
        type: "SEND_QUESTION",
        payload: {
          q_text,
          prompt,
          options
        }
      },
      (response) => {
        console.log("Gemini result:", response.answer);
        alert("回答: " + response.answer);

        // ここで画面に反映もできる
        // alert(response.answer);
      }
    );
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "n" || event.key === "N") {

    let li = document.querySelectorAll('#sortable > li');
    for (let g = 1; g < 20;g++){
      let child = document.getElementById(g);
      console.log("child:", child);
      if(child != null){
        document.getElementById('sortable').appendChild(child);
      }
    }
  }

});