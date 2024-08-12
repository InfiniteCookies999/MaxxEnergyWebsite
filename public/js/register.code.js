
const PASSWORD_TOO_SHORT_FLAG  = 0x01;
const PASSWORD_NO_SPECIAL_FLAG = 0x02;
const PASSWORD_NO_DIGIT_FLAG   = 0x04;

const REPEAT_PASSWORD_EMPTY_FLAG    = 0x01;
const REPEAT_PASSWORD_NO_MATCH_FLAG = 0x02;

const PHONE_NUMBER_EMPTY      = 0x01;
const PHONE_NUMBER_INCOMPLETE = 0x02;
const NAME_EMPTY              = 0x01;

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

function getRepeatPasswordErrorFlags() {
  const repeatPassword = $('#repeat-password-input').val();
  const password = $('#password-input').val();
  let errorFlags = 0;

  if (repeatPassword.length === 0) {
    errorFlags |= REPEAT_PASSWORD_EMPTY_FLAG;
  } else if (repeatPassword !== password) { // TODO: maybe this should not show the error if the password is empty?
    errorFlags |= REPEAT_PASSWORD_NO_MATCH_FLAG;
  }

  return errorFlags;
}

function getNameErrorFlags(nameInput) {
  const name = nameInput.val();
  return name.length === 0 ? NAME_EMPTY : 0;
}

function getFirstNameErrorFlags() {
  return getNameErrorFlags($('#first-name-input'));
}

function getLastNameErrorFlags() {
  return getNameErrorFlags($('#last-name-input'));
}

function getPhoneNumberFlags() {
  const phoneNumber = $('#phone-number-input').val().replaceAll("-", "");
  let errorFlags = 0;

  if (phoneNumber.length === 0) {
    errorFlags |= PHONE_NUMBER_EMPTY;
  } else if (phoneNumber.length < 9) {
    errorFlags |= PHONE_NUMBER_INCOMPLETE;
  }

  return errorFlags;
}

$(document).ready(function () {

  $("form").submit((event) => {
    event.preventDefault();

    const passwordErrorFlags       = getPasswordErrorFlags();
    const emailErrorFlags          = getEmailErrorFlags();
    const repeatPasswordErrorFlags = getRepeatPasswordErrorFlags();
    const firstNameErrorFlags      = getFirstNameErrorFlags();
    const lastNameErrorFlags       = getLastNameErrorFlags();
    const phoneNumberErrorFlags    = getPhoneNumberFlags();
    
    // Displaying the error messages.
    appendErrorMessages($('#password-error'), passwordErrorFlags, (container, flags) => {
      tryAppendError(container, `Too short. Min. Length: ${MIN_PASSWORD_LENGTH}`, flags, PASSWORD_TOO_SHORT_FLAG);
      tryAppendError(container, "Missing special character", flags, PASSWORD_NO_SPECIAL_FLAG);
      tryAppendError(container, "Missing digit", flags, PASSWORD_NO_DIGIT_FLAG);
    });
    
    appendEmailErrorMessages($('#email-error'), emailErrorFlags);
    
    appendErrorMessages($('#repeat-password-error'), repeatPasswordErrorFlags, (container, flags) => {
      tryAppendError(container, "Empty", flags, REPEAT_PASSWORD_EMPTY_FLAG);
      tryAppendError(container, "Does not match password", flags, REPEAT_PASSWORD_NO_MATCH_FLAG);
    });
    
    appendErrorMessages($('#first-name-error'), firstNameErrorFlags, (container, flags) => {
      tryAppendError(container, "Empty", flags, NAME_EMPTY);
    });

    appendErrorMessages($('#last-name-error'), lastNameErrorFlags, (container, flags) => {
      tryAppendError(container, "Empty", flags, NAME_EMPTY);
    });

    appendErrorMessages($('#phone-number-error'), phoneNumberErrorFlags, (container, flags) => {
      tryAppendError(container, "Empty", flags, PHONE_NUMBER_EMPTY);
      tryAppendError(container, "Phone number incomplete", flags, PHONE_NUMBER_INCOMPLETE);
    });

    if (passwordErrorFlags !== 0) {
      $('#password-input').addClass("is-invalid");
    }
    if (emailErrorFlags !== 0) {
      $('#email-input').addClass("is-invalid");
    }
    if (repeatPasswordErrorFlags !== 0) {
      $('#repeat-password-input').addClass("is-invalid");
    }
    if (firstNameErrorFlags !== 0) {
      $('#first-name-input').addClass("is-invalid");
    }
    if (lastNameErrorFlags !== 0) {
      $('#last-name-input').addClass("is-invalid");
    }
    if (phoneNumberErrorFlags !== 0) {
      $('#phone-number-input').addClass("is-invalid");
    }

    if (passwordErrorFlags !== 0 ||
        emailErrorFlags !== 0 ||
        repeatPasswordErrorFlags !== 0 ||
        firstNameErrorFlags !== 0 ||
        lastNameErrorFlags !== 0 ||
        phoneNumberErrorFlags !== 0
      ) {
      // There were errors. Do not continue.
      return;
    }

    console.log("Will send register request!");
  });

  // Resetting errors
  checkForChangeInErrors($('#password-error'), $('#password-input'), getPasswordErrorFlags);
  checkForChangeInErrors($('#email-error'), $('#email-input'), getEmailErrorFlags);
  checkForChangeInErrors($('#repeat-password-error'), $('#repeat-password-input'), getRepeatPasswordErrorFlags);
  checkForChangeInErrors($('#first-name-error'), $('#first-name-input'), getFirstNameErrorFlags);
  checkForChangeInErrors($('#last-name-error'), $('#last-name-input'), getLastNameErrorFlags);
  checkForChangeInErrors($('#phone-number-error'), $('#phone-number-input'), getPhoneNumberFlags);

  // Prevent the user from inputting non-numbers into the phone number input field!
  $('#phone-number-input').keypress((event) => {
    if (event.which < 48 || event.which > 57) {
      event.preventDefault();
    }
  });
  $('#phone-number-input').on("paste", (event) => {
    // TODO: want to make sure this works on more machines.

    function doNotPaste(event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (event.originalEvent && event.originalEvent.clipboardData) {
      const content = event.originalEvent.clipboardData.getData("text");
      if (content === "" || content === undefined) {
        doNotPaste(event); 
        return;
      }

      if (!(/^\d+$/.test(content))) {
        doNotPaste(event);
      }

    } else {
      doNotPaste(event);
    }
  });

  // Insert - into the phone number.
  $('#phone-number-input').keyup((event) => {
    const input = event.target;
    const value = input.value;

    // Remove all - from the string.
    const noDashValue = value.replaceAll("-", "");
    // Only contains numbers now so we can take count.
    const numDigits = noDashValue.length;

    if (numDigits > 6) {
      input.value = noDashValue.replace(/(\d{3})\-?(\d{3})\-?(\d)/, "$1-$2-$3");
    } else if (numDigits > 3) {
      input.value = noDashValue.replace(/(\d{3})\-?(\d)/, "$1-$2");
    } else {
      input.value = noDashValue;
    }
  });

  // Making sure name inputs are alphanumeric.
  $('#first-name-input, #last-name-input').keypress((event) => {
    const key = event.which;
    if (!((key >= 97 && key <= 122) ||
          (key >= 65 && key <= 90) ||
          (key >= 48 && key <= 57)
        )) {
          event.preventDefault();
        }
  });

  $('#show-password-check input').click(() => {
    const input1 = $('#password-input')[0];
    const input2 = $('#repeat-password-input')[0];
    input1.type = input1.type === "password" ? "text" : "password";
    input2.type = input2.type === "password" ? "text" : "password";
  });
});
