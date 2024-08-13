document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-include]").forEach((include) => {
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

      // Execute any scripts in the loaded HTML
      const scripts = include.querySelectorAll('script');
      scripts.forEach(script => {
        const newScript = document.createElement('script');
        newScript.textContent = script.textContent;
        document.body.appendChild(newScript);
        document.body.removeChild(newScript); // Optionally remove the script tag after execution
      });
    };
    request.send();
  });
});
