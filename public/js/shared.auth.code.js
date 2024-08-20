const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 40;
const PASSWORD_SPECIAL_CHARACTER_PATTERN = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
const EMAIL_PATTERN = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const PASSWORD_TOO_SHORT_FLAG  = 0x01;
const PASSWORD_NO_SPECIAL_FLAG = 0x02;
const PASSWORD_NO_DIGIT_FLAG   = 0x04;

const EMAIL_EMPTY_FLAG           = 0x01;
const EMAIL_INVALID_PATTERN_FLAG = 0x02;

const FIXED_NUMBER_EMPTY      = 0x01;
const FIXED_NUMBER_INCOMPLETE = 0x02;
const FIELD_EMPTY             = 0x01;

function getEmailErrorFlagsFn(input) {
  return () => {
    const email = input.val();
    let errorFlags = 0;

    // https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
    if (email.length === 0) {
      errorFlags |= EMAIL_EMPTY_FLAG;
    } else if (!email.toLowerCase().match(EMAIL_PATTERN)) {
      errorFlags |= EMAIL_INVALID_PATTERN_FLAG;
    }

    return errorFlags;
  }
}

function getNonEmptyErrorFlagsFn(input) {
  return () => {
    const addressLine = input.val();
    return addressLine.length === 0 ? FIELD_EMPTY : 0;
  }
}

function getPasswordErrorFlagsFn(input) {
  return () => {
    const password = input.val();
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
}

function appendErrorMessages(errContainer, errorFlags, applyCB) {
  errContainer.data("errorFlags", errorFlags);
  errContainer.empty();

  applyCB(errContainer, errorFlags);
}

function appendEmailErrorMessages(errContainer, emailErrorFlags) {
  appendErrorMessages(errContainer, emailErrorFlags, (container, flags) => {
    tryAppendError(container, "Empty", flags, EMAIL_EMPTY_FLAG);
    tryAppendError(container, "Expected a valid email address", flags, EMAIL_INVALID_PATTERN_FLAG);
  });
}

function getFixedNumberErrorFlags(input, length) {
  const number = input.val().replaceAll("-", "");
  let errorFlags = 0;

  if (number.length === 0) {
    errorFlags |= FIXED_NUMBER_EMPTY;
  } else if (number.length < length) {
    errorFlags |= FIXED_NUMBER_INCOMPLETE;
  }

  return errorFlags;
}

function onPasteEvent(cb) {
  return (event) => {
    const doNotPaste = () => {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (event.originalEvent && event.originalEvent.clipboardData) {
      const content = event.originalEvent.clipboardData.getData("text");
      
      if (content === "" || content === undefined) {
        doNotPaste(event); 
        return;
      }

      cb(content, doNotPaste);

    } else {
      doNotPaste();
    }
  };
}

function preventInvalidPhoneInput(input) {

  // Prevent the user from inputting non-numbers into the phone number input field!
  input.keypress((event) => {
    if (event.which < 48 || event.which > 57) {
      event.preventDefault();
    }
  });
  input.on("paste", onPasteEvent((content, doNotPaste) => {
    if (!(/^\d+$/.test(content))) {
      doNotPaste();
    }
  }));

  // Insert - into the phone number.
  input.keyup((event) => {
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
}

function preventInvalidNonNumber(input) {
  input.keypress((event) => {
    if (!(event.which >= 48 && event.which <= 57)) {
      event.preventDefault();
    }
  });
  input.on("paste", onPasteEvent((content, doNotPaste) => {
    if (!(/^\d+$/.test(content))) {
      doNotPaste();
    }
  }));
}

function preventInvalidAddressLine(input) {
  // https://fsawebenroll.ed.gov/RoboHelp/Business_Address.htm
  input.keypress((event) => {
    const key = event.which;
    if (!((key >= 97 && key <= 122) || // a-z
          (key >= 65 && key <= 90) ||  // A-Z
          (key >= 48 && key <= 57) ||  // 0-9
           key === 32 || key === 39 || // Special keys
           key === 44 || key === 46 ||
           key == 45 || key === 35 ||
           key === 64 || key === 37 ||
           key === 38 || key === 47)
          ) {
      event.preventDefault();
    }
  });
  input.on("paste", onPasteEvent((content, doNotPaste) => {
    if (!(/^[a-zA-Z0-9 .'\-#@%&]+$/.test(content))) {
      doNotPaste();
    }
  }));
}

function preventInvalidName(input) {
  input.keypress((event) => {
    const key = event.which;
    if (!((key >= 97 && key <= 122) || // a-z
          (key >= 65 && key <= 90) ||  // A-Z
          key === 45 // -
        )) {
          event.preventDefault();
        }
  });
  input.on("paste", onPasteEvent((content, doNotPaste) => {
    if (!(/^[ a-zA-Z0-9]+$/.test(content))) {
      doNotPaste();
    }
  }));
}