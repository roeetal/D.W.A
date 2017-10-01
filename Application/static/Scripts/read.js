const LOCAL_STORAGE_NAME = "source_data";
let current_question = 0;
let total_questions;
let source_style = [];
let source_words;
let question_list;

// start the application

function startApp() {
  document.getElementById("progress").style.width = 0;
  let source_text = window.localStorage.getItem(LOCAL_STORAGE_NAME);
  source_words = source.split(" ");
  fetch("http://localhost:5000/generate_questions", {
        method: 'POST',
        headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
              },
        body: JSON.stringify({"data": source_text}),
      })
      .then(function (a) {
          return a.json();
      })
      .then(function (json) {
        question_list = json.data;
        total_questions = question_list.length();
      });
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
  const progress_percent = 100 * current_question / total_questions;
  document.getElementById("progress").style.width = `${progress_percent}%`;
  current_question += 1;
  fetch("http://localhost:5000/generate_hints", {
      method: 'POST',
      headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({"data": answer_text}),
    })
    .then(function (a) {
        return a.json();
    })
    .then(function (json) {
      document.getElementById("question").innerHTML = json.data;
      if (json.data
    })
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
