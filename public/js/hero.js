document.addEventListener("DOMContentLoaded", function () {
  const heroBackground = document.getElementById("hero-background");
  const heroDots = document.querySelectorAll(".hero-dot");

  // Array of background image URLs
  const heroBackgrounds = [
    "/images/homepage.jpg",
    "/images/homepage2.jpg",
    "/images/homepage3.jpg",
  ];

  // Adjust the image paths for the server environment if needed
  const isServer = window.location.href.includes("104.131.6.214/webdev");
  if (isServer) {
    heroBackgrounds[0] = "/webdev/images/homepage.jpg";
    heroBackgrounds[1] = "/webdev/images/homepage2.jpg";
    heroBackgrounds[2] = "/webdev/images/homepage3.jpg";
  }

  let currentHeroIndex = 0;

  // Set the initial background and active dot
  setHeroBackground(currentHeroIndex);
  heroDots[currentHeroIndex].classList.add("active");

  // Function to set the hero background dynamically
  function setHeroBackground(index) {
    const img = new Image();
    img.src = heroBackgrounds[index];
    img.onload = () => {
      heroBackground.style.backgroundImage = `url(${heroBackgrounds[index]})`;
    };
  }

  // Function that changes the background image and updates the active dot
  function updateHeroBackground(index = null) {
    // Remove active class from current dot
    heroDots[currentHeroIndex].classList.remove("active");

    // Update index to the next background or the clicked one
    if (index !== null) {
      currentHeroIndex = index;
    } else {
      currentHeroIndex = (currentHeroIndex + 1) % heroBackgrounds.length;
    }

    // Set new background image
    setHeroBackground(currentHeroIndex);

    // Add active class to the new dot
    heroDots[currentHeroIndex].classList.add("active");
  }

  // Add click event listeners to the dots
  heroDots.forEach((dot, index) => {
    dot.addEventListener("click", function () {
      updateHeroBackground(index);
    });
  });

  // Automatically switch background images every 8 seconds
  setInterval(updateHeroBackground, 8000);
});
