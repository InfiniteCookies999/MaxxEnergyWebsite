document.addEventListener('DOMContentLoaded', () => {
  const flagContainer = document.getElementById('flags');
  const navLeft = document.getElementById('left-button');
  const navRight = document.getElementById('right-button');
  const flagElements = document.querySelectorAll('.state-item');
  const flagWidth = flagElements[0].offsetWidth + 20; 
  const flagsVisible = 5; 
  let flagIndex = 0;

  const totalFlags = flagElements.length;
  for (let i = 0; i < flagsVisible; i++) {
      const duplicateFlag = flagElements[i].cloneNode(true);
      flagContainer.appendChild(duplicateFlag);
  }

  function moveFlagContainer() {
      const displacement = -flagIndex * flagWidth;
      flagContainer.style.transition = 'transform 0.4s ease';
      flagContainer.style.transform = `translateX(${displacement}px)`;
  }

  navRight.addEventListener('click', () => {
      if (flagIndex < totalFlags) {
          flagIndex++;
          moveFlagContainer();
      } else {
          flagIndex = 0;
          flagContainer.style.transition = 'none';
          flagContainer.style.transform = `translateX(${0}px)`;
          setTimeout(() => {
              flagIndex++;
              moveFlagContainer();
          }, 50);
      }
  });

  navLeft.addEventListener('click', () => {
      if (flagIndex > 0) {
          flagIndex--;
          moveFlagContainer();
      } else {
          flagIndex = totalFlags;
          flagContainer.style.transition = 'none';
          const displacement = -flagIndex * flagWidth;
          flagContainer.style.transform = `translateX(${displacement}px)`;
          setTimeout(() => {
              flagIndex--;
              moveFlagContainer();
          }, 50);
      }
  });
});
