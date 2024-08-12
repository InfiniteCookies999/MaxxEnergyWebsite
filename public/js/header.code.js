document.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll("[data-include]").forEach((include) => {
    const file = include.getAttribute("data-include") + ".html";
    
    // See: https://www.youtube.com/watch?v=yUGXqaV-qVw
    const request = new XMLHttpRequest();
    request.open("GET", file, true);
    request.onreadystatechange = () => {
      // Make sure it is done loading.
      if (request.readyState !== 4) {
        return;
      }
      // Check that the status code of the file is good.
      if (request.status !== 200) {
        console.log(`Error loading file "${file}" with status code ${request.status}`);
        return;
      }

      include.innerHTML = request.response;

    };
    request.send();

  });
});

