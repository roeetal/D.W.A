const LOCAL_STORAGE_NAME = "source_data";

// add all event listeners when ready

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("source").addEventListener("submit", function (e) {
    e.preventDefault();
    window.localStorage.setItem(LOCAL_STORAGE_NAME, e.target.elements.text.value);
    e.target.elements.text.value = "";
    window.location.href = "/read";
  });
});
