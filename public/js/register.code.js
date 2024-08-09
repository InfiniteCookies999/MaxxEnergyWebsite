const PASSWORD_SPECIAL_CHARACTER_PATTERN = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

const PASSWORD_TOO_SHORT_FLAG  = 0x01;
const PASSWORD_NO_SPECIAL_FLAG = 0x02;
const PASSWORD_NO_DIGIT_FLAG   = 0x04;

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

$(document).ready(function () {

  $("form").submit((event) => {
    event.preventDefault();
    console.log("Will send register request!");
  });

  // Prevent the user from inputting non-numbers into the phone number input field!
  $('#phone-number-input').keypress((event) => {
    if (event.which < 48 || event.which > 57) {
      event.preventDefault();
    }
  });

  // TODO: Need to test for pasting code.
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
});
