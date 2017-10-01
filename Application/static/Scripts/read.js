const LOCAL_STORAGE_NAME = "source_data";
let current_question = 0;
let total_questions;
let sentence_list = [];
let source_style = [];
let source_words;
let question_list;

// start the application

function startApp() {
  document.getElementById("progress").style.width = 0;
  let source_text = window.localStorage.getItem(LOCAL_STORAGE_NAME);
  let parsed_text = window.localStorage.getItem(LOCAL_STORAGE_NAME + "2");
  source_words = JSON.parse(parsed_text).text.split(" ");
  fetch("http://localhost:5000/generate_questions", {
        method: 'POST',
        headers: {
                  'Accept': 'application/json',
                  'Content-Type': 'application/json',
                  'Access-Control-Allow-Origin': '*',
              },
      body: JSON.stringify({"data": source_text, "parsed": parsed_text}),
      })
      .then(function (a) {
          return a.json();
      })
      .then(function (json) {
        question_list = Object.values(json.data);
        total_questions = question_list.length;
        console.log(question_list);
        document.getElementById("question").innerHTML = question_list[current_question][1];
      });
  sentence_indices = [];
  for (let i in source_words) {
    source_style.push("color: black;");
    sentence_indices.push(i);
    if (source_words[i].endsWith(".")) {
      sentence_list.push(sentence_indices);
      sentence_indices = [];
    }
  }
  sentence_list.push(sentence_indices);
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
  fetch("http://localhost:5000/generate_hints", {
      method: 'POST',
      headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({"question": question_list[current_question], "answer": answer_text}),
    })
    .then(function (a) {
      return a.json();
    })
    .then(function (json) {
      switch (json.data) {
      case "correct":
        const progress_percent = 100 * current_question / total_questions;
        document.getElementById("progress").style.width = `${progress_percent}%`;
        if (current_question + 1 >= total_questions) {
          document.getElementById("question").textContent = "You win!";
        } else {
          current_question += 1;
          document.getElementById("question").textContent = question_list[current_question][1];
        }
        break;
      case "sentence":
        for (let i in source_style) {
          source_style[i] = "color: black;";
        }
        if (current_question > 0) {
          for (let i in sentence_list[question_list[current_question - 1][0]]) {
            console.log(i);
            source_style[i] = "color: red;";
          }
        }
        for (let i in sentence_list[question_list[current_question][0]]) {
          console.log(i);
          source_style[i] = "color: red;";
        }
        if (current_question < total_questions - 1) {
          for (let i in sentence_list[question_list[current_question + 1][0]]) {
            console.log(i);
            source_style[i] = "color: red;";
          }
        }
        drawApp();
      }
    });
}

// add all event listeners when ready

document.addEventListener("DOMContentLoaded", function () {
  startApp();
  document.getElementById("answer-box").addEventListener("submit", function (e) {
    e.preventDefault();
    submitAnswer(e.target.elements.text.value);
    e.target.elements.text.value = "";
    return false;
  });
});
