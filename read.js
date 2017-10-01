const LOCAL_STORAGE_NAME = "source_data";
let progress_percent = 0;
let source_style = [];
let source_words;

// start the application

function startApp() {
  document.getElementById("progress").style.width = `${progress_percent}%`
  source_words = window.localStorage.getItem(LOCAL_STORAGE_NAME).split(" ");
  for (let i in source_words) {
    if (i % 5 == 0)
      source_style.push("color: red;");
    else if (i % 7 == 0)
      source_style.push("color: blue;");
    else
      source_style.push("color: black;");
  }
  drawApp();
}

// draw the application

function drawApp() {
  const source_html = [];
  for (let i in source_words) {
    source_html.push(`<div class="word" style="${source_style[i]}">${source_words[i]}</div>\n`);
  }
  document.getElementById("source-text").innerHTML = source_html.join("");
}

function submitAnswer(answer_text) {
  progress_percent += 10;
  document.getElementById("progress").style.width = `${progress_percent}%`
}

// add all event listeners when ready

document.addEventListener("DOMContentLoaded", function () {
  startApp();
  document.getElementById("answer-box").addEventListener("submit", function (e) {
    e.preventDefault();
    submitAnswer(e.target.elements.text.value);
    e.target.elements.text.value = "";
  });
});
