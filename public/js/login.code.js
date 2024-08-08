$(document).ready(function () {
  
  $("form").submit((event) => {
    event.preventDefault();
    console.log("Will send login request!");
  });

  $('#show-password-check input').click(() => {
    const input = $('#password-input')[0];
    input.type = input.type === "password" ? "text" : "password";
  });
});
