// contact.code.js
document.addEventListener("DOMContentLoaded", function () {
  const heroBackground = document.getElementById("hero-background");

  // Retrieve the base URL from the custom attribute
  const baseUrl = document.querySelector('[base-url]').getAttribute('base-url');

  // Set the background image using the provided preloadImage variable
  const backgroundImageUrl = baseUrl + '/images/contact-background.jpg';  // Replace with your actual image path if different

  // Set the background image
  heroBackground.style.backgroundImage = `url('${backgroundImageUrl}')`;
});
