$(document).ready(function () {
  
  // Prevent the user from inputting non-numbers into the phone number input field!
  $('#phone-number-input').keypress((event) => {
    if (event.which < 48 || event.which > 57) {
      event.preventDefault();
    }
  });

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
