const LOCAL_STORAGE_NAME = "source_data";

// add all event listeners when ready

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("source").addEventListener("submit", function (e) {
    e.preventDefault();
    console.log("HELP");
    window.localStorage.setItem(LOCAL_STORAGE_NAME, e.target.elements.text.value);
    console.log(e.target.elements.text.value);
    e.target.elements.text.value = "";

    const input = document.getElementById("source-file");
    const reader = new FileReader();
        console.log("lol");
    if (input.files.length) {
      console.log('watever');
        var textFile = input.files[0];
        reader.readAsText(textFile);
        reader.onload = function (d) {
          window.localStorage.setItem(LOCAL_STORAGE_NAME + "2", d.target.result);
          window.location.href = "/read";
        };
    } else {
        console.log("HI");
          window.location.href = "/read";
    }
  });
});
