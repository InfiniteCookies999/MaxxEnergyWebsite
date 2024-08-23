document.addEventListener("DOMContentLoaded", function () {
  const heroBackground = document.getElementById("hero-background"); 
  const heroBackgrounds = ['hero-bg-1', 'hero-bg-2', 'hero-bg-3'];
  const heroDots = document.querySelectorAll('.hero-dot');
  let currentHeroIndex = 0;

  function updateHeroBackground(index = null) {
    heroBackground.classList.remove(heroBackgrounds[currentHeroIndex]);
    if (index !== null) {
      currentHeroIndex = index;
    } else {
      currentHeroIndex = (currentHeroIndex + 1) % heroBackgrounds.length;
    }
    heroBackground.classList.add(heroBackgrounds[currentHeroIndex]);

    heroDots.forEach(dot => dot.classList.remove('active'));
    heroDots[currentHeroIndex].classList.add('active');
  }

  heroDots.forEach((dot, index) => {
    dot.addEventListener('click', function () {
      updateHeroBackground(index);
    });
  });

  setInterval(updateHeroBackground, 8000); 
});
