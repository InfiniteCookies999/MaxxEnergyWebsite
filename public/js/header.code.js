window.addEventListener("load", () => {
  const initializeHeader = () => {
    const menuToggle = document.querySelector('.menu-toggle');
    const menuList = document.querySelector('.menu-list');

    if (menuToggle && menuList) {
      menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('open');
        menuList.classList.toggle('open');
      });
    }
  };
  initializeHeader();
});
