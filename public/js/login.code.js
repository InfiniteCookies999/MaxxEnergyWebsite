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
    const emailErrorFlags = getEmailErrorFlags();

    // Displaying the error messages.
    {
      const errContainer = $('#password-error');

      errContainer.data("errorFlags", passwordErrorFlags);
      errContainer.empty();
      
      tryAppendError(errContainer, "Empty", passwordErrorFlags,
        PASSWORD_EMPTY_FLAG);

      /*tryAppendError(errContainer, `Too short. Min. Length: ${MIN_PASSWORD_LENGTH}`, passwordErrorFlags,
        PASSWORD_TOO_SHORT_FLAG);
      
      tryAppendError(errContainer, "Missing special character", passwordErrorFlags,
        PASSWORD_NO_SPECIAL_FLAG);
      
      tryAppendError(errContainer, "Missing digit", passwordErrorFlags,
        PASSWORD_NO_DIGIT_FLAG);*/
    }
    {
      const errContainer = $('#email-error');

      errContainer.data("errorFlags", emailErrorFlags);
      errContainer.empty();

      tryAppendError(errContainer, "Empty", emailErrorFlags,
        EMAIL_EMPTY_FLAG);

      tryAppendError(errContainer, "Expected a valid email address", emailErrorFlags,
        EMAIL_INVALID_PATTERN_FLAG);
    }

    if (passwordErrorFlags !== 0) {
      $('#password-input').addClass("is-invalid");
    }
    if (emailErrorFlags !== 0) {
      $('#email-input').addClass("is-invalid");
    }

    if (passwordErrorFlags !== 0 || emailErrorFlags !== 0) {
      // There was errors. Do not continue.
      return;
    }

    console.log("Sending login to server!");
  });

  checkForChangeInErrors($('#password-error'), $('#password-input'), getPasswordErrorFlags);
  checkForChangeInErrors($('#email-error'), $('#email-input'), getEmailErrorFlags);

  $('#show-password-check input').click(() => {
    const input = $('#password-input')[0];
    input.type = input.type === "password" ? "text" : "password";
  });
});
