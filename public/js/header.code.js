document.addEventListener("DOMContentLoaded", () => {
  const includes = document.querySelectorAll("[data-include]");

  includes.forEach((include) => {
    const file = include.getAttribute("data-include") + ".html";

    fetch(file)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error loading file "${file}" with status ${response.status}`);
        }
        return response.text();
      })
      .then((data) => {
        include.innerHTML = data;

        // Attach the event listener for the hamburger toggle after the header content is loaded
        if (file.includes("header.html")) {
          const menuToggle = document.querySelector('.menu-toggle');
          const menuList = document.querySelector('.menu-list');

          if (menuToggle && menuList) {
            menuToggle.addEventListener('click', () => {
              menuToggle.classList.toggle('open');
              menuList.classList.toggle('open');
            });
          }
        }
      })
      .catch((error) => console.error(error));
  });
});
