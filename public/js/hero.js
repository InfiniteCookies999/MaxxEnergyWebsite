document.addEventListener("DOMContentLoaded", function () {
  const heroBackground = document.getElementById("hero-background");
  const heroDots = document.querySelectorAll(".hero-dot");

  const heroBackgrounds = [
    "/images/homepage.jpg",
    "/images/homepage2.jpg",
    "/images/homepage3.jpg",
  ];

  // Adjust image paths for the server environment
  const isServer = window.location.href.includes("104.131.6.214/webdev");
  if (isServer) {
    heroBackgrounds[0] = "/webdev/images/homepage.jpg";
    heroBackgrounds[1] = "/webdev/images/homepage2.jpg";
    heroBackgrounds[2] = "/webdev/images/homepage3.jpg";
  }

  let currentHeroIndex = 0;

  // Preload the initial image
  const img = new Image();
  img.src = heroBackgrounds[currentHeroIndex];
  img.onload = () => {
    heroBackground.style.backgroundImage = `url(${img.src})`;
  };

  // Function that changes the background image and updates the active dot
  function updateHeroBackground(index = null) {
    heroDots[currentHeroIndex].classList.remove("active");

    if (index !== null) {
      currentHeroIndex = index;
    } else {
      currentHeroIndex = (currentHeroIndex + 1) % heroBackgrounds.length;
    }

    // Preload and switch to the next image
    const newImg = new Image();
    newImg.src = heroBackgrounds[currentHeroIndex];
    newImg.onload = () => {
      heroBackground.style.backgroundImage = `url(${newImg.src})`;
    };

    heroDots[currentHeroIndex].classList.add("active");
  }

  heroDots.forEach((dot, index) => {
    dot.addEventListener("click", function () {
      updateHeroBackground(index);
    });
  });

  setInterval(updateHeroBackground, 8000);
});
