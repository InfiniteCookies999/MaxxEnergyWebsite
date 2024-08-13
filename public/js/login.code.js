const PASSWORD_EMPTY_FLAG = 0x01;

function getPasswordErrorFlags() {
  const password = $('#password-input').val();
  return password.length === 0 ? PASSWORD_EMPTY_FLAG : 0;
}

$(document).ready(function () {

  $('#password-input').maxLength = MAX_PASSWORD_LENGTH;

  $("form").submit((event) => {
    event.preventDefault();

    const passwordErrorFlags = getPasswordErrorFlags();
    const emailErrorFlags    = getEmailErrorFlags();

    // Displaying the error messages.
    appendErrorMessages($('#password-error'), passwordErrorFlags, (container, flags) => {
      tryAppendError(container, "Empty", flags, PASSWORD_EMPTY_FLAG);  
    });
    
    appendEmailErrorMessages($('#email-error'), emailErrorFlags);

    if (passwordErrorFlags !== 0) {
      $('#password-input').addClass("is-invalid");
    }
    if (emailErrorFlags !== 0) {
      $('#email-input').addClass("is-invalid");
    }

    if (passwordErrorFlags !== 0 || emailErrorFlags !== 0) {
      // There were errors. Do not continue.
      return;
    }

    $('.bottom-btn-group button').prop("disabled", true);
    $('.bottom-btn-group canvas').css("display", "inline-block");

    // !! Testing: Re-enabling after a certain amount of time to simulate server response.
    setTimeout(() => {
      $('.bottom-btn-group button').prop("disabled", false);
      $('.bottom-btn-group canvas').css("display", "none");
    }, 1500);

  });

  createLoadAnimation(document.getElementById("load-animation"));

  checkForChangeInErrors($('#password-error'), $('#password-input'), getPasswordErrorFlags);
  checkForChangeInErrors($('#email-error'), $('#email-input'), getEmailErrorFlags);

  $('#show-password-check input').click(() => {
    const input = $('#password-input')[0];
    input.type = input.type === "password" ? "text" : "password";
  });
});
