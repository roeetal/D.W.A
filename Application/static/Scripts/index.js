const LOCAL_STORAGE_NAME = "source_data";

// add all event listeners when ready

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("source").addEventListener("submit", function (e) {
    e.preventDefault();
    window.localStorage.setItem(LOCAL_STORAGE_NAME, e.target.elements.text.value);
    e.target.elements.text.value = "";

    const input = document.getElementById("source-file");
    const reader = new FileReader();
    if (input.files.length) {
      console.log('watever');
        var textFile = input.files[0];
        reader.readAsText(textFile);
        reader.onload = function (d) {
          window.localStorage.setItem(LOCAL_STORAGE_NAME + "2", d.target.result);
          window.location.href = "/read";
        };
    } else {
          window.location.href = "/read";
    }
  });
});
