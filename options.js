document.addEventListener("DOMContentLoaded", async () => {
  const apikeyEl = /** @type {HTMLInputElement} */ (document.getElementById("apikey"));
  const modelEl = /** @type {HTMLSelectElement} */ (document.getElementById("model"));
  const book_nameEl = /** @type {HTMLInputElement} */ (document.getElementById("book_name"));
  const btn = /** @type {HTMLButtonElement} */ (document.getElementById("btn"));

  // 既存値の復元
  chrome.storage.sync.get(["ApiKey", "Model", "book_name"], (data) => {
    if (typeof data.ApiKey === "string") apikeyEl.value = data.ApiKey;
    if (typeof data.Model === "string") modelEl.value = data.Model;
    if (typeof data.book_name === "string") book_nameEl.value = data.book_name;
  });

  btn.addEventListener("click", (e) => {
    e.preventDefault();

    const ApiKey = apikeyEl.value;
    const Model = modelEl.value;
    const book_name = book_nameEl.value;

    chrome.storage.sync.set({
      ApiKey: ApiKey,
      Model: Model,
      book_name: book_name
    });

    window.close();
  });
});


window.addEventListener("keydown", (event) => {
  if (event.key === "k" || event.key === "K") {
    document.querySelectorAll(".plus").forEach((el) => {
      el.style.display = "block";
    });
  }
});