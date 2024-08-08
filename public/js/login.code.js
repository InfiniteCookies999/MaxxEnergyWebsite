$(document).ready(function () {
  
  $("form").submit(function (event) {
    event.preventDefault();
    console.log("Will send login request!");
  });

  $('#show-password-check input').click(function() {
    const input = $('#password-input')[0];
    console.log("input: ", input);
    console.log("input.type: ", input.type);
    input.type = input.type === "password" ? "text" : "password";
  });
});
