
function createLoadAnimation(canvas) {
  const context = canvas.getContext("2d");

  var tick = 0;

  setInterval(() => {
    
    context.clearRect(0, 0, canvas.width, canvas.height);

    const sa = tick % (Math.PI*2);
    context.beginPath();
    context.arc(canvas.width/2, canvas.height/2, 10,
      sa, sa + Math.PI, false);
    context.strokeStyle = "rgb(74, 154, 245)";
    context.lineWidth = 2;
    context.stroke();

    ++tick;

  }, 100);
}