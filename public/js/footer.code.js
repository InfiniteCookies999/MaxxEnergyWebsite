document.addEventListener("DOMContentLoaded", () => {
  const include = document.querySelector('[data-include="footer"]');
  const file = include.getAttribute("data-include") + ".html";

  const request = new XMLHttpRequest();
  request.open("GET", file, true);
  request.onreadystatechange = () => {
    if (request.readyState !== 4) return;

    if (request.status !== 200) {
      console.error(`Error loading file "${file}" with status code ${request.status}`);
      return;
    }

    include.innerHTML = request.responseText;
  };
  request.send();
});
