document.addEventListener("DOMContentLoaded", function () {
  const heroBackground = document.getElementById("hero-background");
  const heroBackgrounds = ['hero-bg-1', 'hero-bg-2', 'hero-bg-3'];

  // Detect base URL based on the current environment
  const baseUrl = window.location.href.includes('104.131.6.214/webdev') ? '/webdev/' : '/';
  
  // Set the base URL as a CSS variable
  document.documentElement.style.setProperty('--base-url', `url('${baseUrl}`);

  // Finds all the dots that users can click to change the background image.
  const heroDots = document.querySelectorAll('.hero-dot');
  let currentHeroIndex = 0;

  // Set the initial background and active dot
  heroBackground.classList.add(heroBackgrounds[currentHeroIndex]);
  heroDots[currentHeroIndex].classList.add('active');

  // Function that changes the background image and updates the active dot.
  function updateHeroBackground(index = null) {
    heroBackground.classList.remove(heroBackgrounds[currentHeroIndex]);

    // Either go to the clicked image or move to the next one automatically.
    if (index !== null) {
      currentHeroIndex = index;
    } else {
      currentHeroIndex = (currentHeroIndex + 1) % heroBackgrounds.length;
    }

    // Sets the new background image for the hero section.
    heroBackground.classList.add(heroBackgrounds[currentHeroIndex]);
    // Changes which dot is highlighted to match the current background.
    heroDots.forEach(dot => dot.classList.remove('active'));
    heroDots[currentHeroIndex].classList.add('active');
  }

  // Listens for clicks on the dots to change the background image.
  heroDots.forEach((dot, index) => {
    dot.addEventListener('click', function () {
      updateHeroBackground(index);
    });
  });

  // Automatically switches the background image every 8 seconds.
  setInterval(updateHeroBackground, 8000);
});
