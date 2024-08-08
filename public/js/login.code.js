const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 40;
const PASSWORD_SPECIAL_CHARACTER_PATTERN = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
const EMAIL_PATTERN = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const PASSWORD_TOO_SHORT_FLAG  = 0x01;
const PASSWORD_NO_SPECIAL_FLAG = 0x02;
const PASSWORD_NO_DIGIT_FLAG   = 0x04;

const EMAIL_EMPTY_FLAG           = 0x01;
const EMAIL_INVALID_PATTERN_FLAG = 0x02;

function getPasswordErrorFlags() {
  const password = $('#password-input').val();
  let errorFlags = 0;

  if (password.length < MIN_PASSWORD_LENGTH) {
    errorFlags |= PASSWORD_TOO_SHORT_FLAG;
  }

  // See: https://stackoverflow.com/questions/32311081/check-for-special-characters-in-string
  if (!password.match(PASSWORD_SPECIAL_CHARACTER_PATTERN)) {
    errorFlags |= PASSWORD_NO_SPECIAL_FLAG;
  }

  if (!password.match(/\d/)) {
    errorFlags |= PASSWORD_NO_DIGIT_FLAG;
  }

  return errorFlags;
}

function getEmailErrorFlags() {
  const email = $('#email-input').val();
  let errorFlags = 0;

  // https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
  if (email.length === 0) {
    errorFlags |= EMAIL_EMPTY_FLAG;
  } else if (!email.toLowerCase().match(EMAIL_PATTERN)) {
    errorFlags |= EMAIL_INVALID_PATTERN_FLAG;
  }

  return errorFlags;
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
      
      tryAppendError(errContainer, `Too short. Min. Length: ${MIN_PASSWORD_LENGTH}`, passwordErrorFlags,
        PASSWORD_TOO_SHORT_FLAG);
      
      tryAppendError(errContainer, "Missing special character", passwordErrorFlags,
        PASSWORD_NO_SPECIAL_FLAG);
      
      tryAppendError(errContainer, "Missing digit", passwordErrorFlags,
        PASSWORD_NO_DIGIT_FLAG);
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
