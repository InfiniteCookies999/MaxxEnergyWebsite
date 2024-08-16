
const PASSWORD_TOO_SHORT_FLAG  = 0x01;
const PASSWORD_NO_SPECIAL_FLAG = 0x02;
const PASSWORD_NO_DIGIT_FLAG   = 0x04;

const REPEAT_PASSWORD_EMPTY_FLAG    = 0x01;
const REPEAT_PASSWORD_NO_MATCH_FLAG = 0x02;

const FIXED_NUMBER_EMPTY      = 0x01;
const FIXED_NUMBER_INCOMPLETE = 0x02;
const FIELD_EMPTY             = 0x01;

// See: https://gist.github.com/marshallswain/88f377c71aa88aceaf660b157f6d8f46
const STATES = [
  { name: 'ALABAMA', abbreviation: 'AL'},
  { name: 'ALASKA', abbreviation: 'AK'},
  { name: 'AMERICAN SAMOA', abbreviation: 'AS'},
  { name: 'ARIZONA', abbreviation: 'AZ'},
  { name: 'ARKANSAS', abbreviation: 'AR'},
  { name: 'CALIFORNIA', abbreviation: 'CA'},
  { name: 'COLORADO', abbreviation: 'CO'},
  { name: 'CONNECTICUT', abbreviation: 'CT'},
  { name: 'DELAWARE', abbreviation: 'DE'},
  { name: 'DISTRICT OF COLUMBIA', abbreviation: 'DC'},
  { name: 'FEDERATED STATES OF MICRONESIA', abbreviation: 'FM'},
  { name: 'FLORIDA', abbreviation: 'FL'},
  { name: 'GEORGIA', abbreviation: 'GA'},
  { name: 'GUAM', abbreviation: 'GU'},
  { name: 'HAWAII', abbreviation: 'HI'},
  { name: 'IDAHO', abbreviation: 'ID'},
  { name: 'ILLINOIS', abbreviation: 'IL'},
  { name: 'INDIANA', abbreviation: 'IN'},
  { name: 'IOWA', abbreviation: 'IA'},
  { name: 'KANSAS', abbreviation: 'KS'},
  { name: 'KENTUCKY', abbreviation: 'KY'},
  { name: 'LOUISIANA', abbreviation: 'LA'},
  { name: 'MAINE', abbreviation: 'ME'},
  { name: 'MARSHALL ISLANDS', abbreviation: 'MH'},
  { name: 'MARYLAND', abbreviation: 'MD'},
  { name: 'MASSACHUSETTS', abbreviation: 'MA'},
  { name: 'MICHIGAN', abbreviation: 'MI'},
  { name: 'MINNESOTA', abbreviation: 'MN'},
  { name: 'MISSISSIPPI', abbreviation: 'MS'},
  { name: 'MISSOURI', abbreviation: 'MO'},
  { name: 'MONTANA', abbreviation: 'MT'},
  { name: 'NEBRASKA', abbreviation: 'NE'},
  { name: 'NEVADA', abbreviation: 'NV'},
  { name: 'NEW HAMPSHIRE', abbreviation: 'NH'},
  { name: 'NEW JERSEY', abbreviation: 'NJ'},
  { name: 'NEW MEXICO', abbreviation: 'NM'},
  { name: 'NEW YORK', abbreviation: 'NY'},
  { name: 'NORTH CAROLINA', abbreviation: 'NC'},
  { name: 'NORTH DAKOTA', abbreviation: 'ND'},
  { name: 'NORTHERN MARIANA ISLANDS', abbreviation: 'MP'},
  { name: 'OHIO', abbreviation: 'OH'},
  { name: 'OKLAHOMA', abbreviation: 'OK'},
  { name: 'OREGON', abbreviation: 'OR'},
  { name: 'PALAU', abbreviation: 'PW'},
  { name: 'PENNSYLVANIA', abbreviation: 'PA'},
  { name: 'PUERTO RICO', abbreviation: 'PR'},
  { name: 'RHODE ISLAND', abbreviation: 'RI'},
  { name: 'SOUTH CAROLINA', abbreviation: 'SC'},
  { name: 'SOUTH DAKOTA', abbreviation: 'SD'},
  { name: 'TENNESSEE', abbreviation: 'TN'},
  { name: 'TEXAS', abbreviation: 'TX'},
  { name: 'UTAH', abbreviation: 'UT'},
  { name: 'VERMONT', abbreviation: 'VT'},
  { name: 'VIRGIN ISLANDS', abbreviation: 'VI'},
  { name: 'VIRGINIA', abbreviation: 'VA'},
  { name: 'WASHINGTON', abbreviation: 'WA'},
  { name: 'WEST VIRGINIA', abbreviation: 'WV'},
  { name: 'WISCONSIN', abbreviation: 'WI'},
  { name: 'WYOMING', abbreviation: 'WY' }
];

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
  return name.length === 0 ? FIELD_EMPTY : 0;
}

function getAddressLine1ErrorFlags() {
  const addressLine = $('#address-line1-input').val();
  return addressLine.length === 0 ? FIELD_EMPTY : 0;
}

function getFirstNameErrorFlags() {
  return getNameErrorFlags($('#first-name-input'));
}

function getLastNameErrorFlags() {
  return getNameErrorFlags($('#last-name-input'));
}

function getFixedNumberErrorFlags(input, length) {
  const phoneNumber = input.val().replaceAll("-", "");
  let errorFlags = 0;

  if (phoneNumber.length === 0) {
    errorFlags |= FIXED_NUMBER_EMPTY;
  } else if (phoneNumber.length < length) {
    errorFlags |= FIXED_NUMBER_INCOMPLETE;
  }

  return errorFlags;
}

function getPhoneNumberErrorFlags() {
  return getFixedNumberErrorFlags($('#phone-number-input'), 10);
}

function getZipCodeErrorFlags() {
  return getFixedNumberErrorFlags($('#zip-code-input'), 5);
}

function setCounties(key) {
  const countyList = COUNTIES[key];

  const dropdown = $('#county-input');
  dropdown.selectpicker();

  dropdown.empty();
  
  for (const county of countyList) {
    // TODO: should probably change the key that is used here.
    dropdown.append(`<option value=${county.replaceAll(" ", "-")}>${county}</option>`);
  }

  dropdown.selectpicker("refresh");
}

async function addStates() {

  // https://ip-api.com
  let userState = undefined;
  try {
    
    const response = await fetch("http://ip-api.com/json");
    const json = await response.json();

    userState = json.regionName;

  } catch (error) {
    // Ignoring the error since this is only helpful information not essential.
  }
  
  let selectedAbbreviation = "";
  const dropdown = $('#state-input');
  dropdown.selectpicker();
  for (const state of STATES) {
    let name = state.name.toLowerCase();
    name = name.charAt(0).toUpperCase() + name.slice(1);

    if (name === userState) {
      selectedAbbreviation = state.abbreviation;
    }

    dropdown.append(`<option value=${state.abbreviation}>${name}</option>`);
  }

  dropdown.selectpicker("refresh");
  
  if (userState !== undefined && userState !== "") {
    dropdown.selectpicker('val', selectedAbbreviation);
  }
  
  setCounties(selectedAbbreviation);
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

$(document).ready(function () {

  createLoadAnimation(document.getElementById("load-animation"));

  addStates();

  $('#state-input').on('change', () => {
    const state = $(this).find("option:selected").val();
    setCounties(state);
  });

  $("form").submit((event) => {
    event.preventDefault();

    const passwordErrorFlags       = getPasswordErrorFlags();
    const emailErrorFlags          = getEmailErrorFlags();
    const repeatPasswordErrorFlags = getRepeatPasswordErrorFlags();
    const firstNameErrorFlags      = getFirstNameErrorFlags();
    const lastNameErrorFlags       = getLastNameErrorFlags();
    const phoneNumberErrorFlags    = getPhoneNumberErrorFlags();
    const zipCodeErrorFlags        = getZipCodeErrorFlags();
    const addressLine1ErrorFlags   = getAddressLine1ErrorFlags();
    
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
      tryAppendError(container, "Empty", flags, FIELD_EMPTY);
    });

    appendErrorMessages($('#last-name-error'), lastNameErrorFlags, (container, flags) => {
      tryAppendError(container, "Empty", flags, FIELD_EMPTY);
    });

    appendErrorMessages($('#phone-number-error'), phoneNumberErrorFlags, (container, flags) => {
      tryAppendError(container, "Empty", flags, FIXED_NUMBER_EMPTY);
      tryAppendError(container, "Incomplete", flags, FIXED_NUMBER_INCOMPLETE);
    });

    appendErrorMessages($('#zip-code-error'), zipCodeErrorFlags, (container, flags) => {
      tryAppendError(container, "Empty", flags, FIXED_NUMBER_EMPTY);
      tryAppendError(container, "Incomplete", flags, FIXED_NUMBER_INCOMPLETE);
    });

    appendErrorMessages($('#address-line1-error'), addressLine1ErrorFlags, (container, flags) => {
      tryAppendError(container, "Empty", flags, FIELD_EMPTY);
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
    if (zipCodeErrorFlags !== 0) {
      $('#zip-code-input').addClass("is-invalid");
    }
    if (addressLine1ErrorFlags !== 0) {
      $('#address-line1-input').addClass("is-invalid");
    }

    if (passwordErrorFlags !== 0 ||
        emailErrorFlags !== 0 ||
        repeatPasswordErrorFlags !== 0 ||
        firstNameErrorFlags !== 0 ||
        lastNameErrorFlags !== 0 ||
        phoneNumberErrorFlags !== 0 ||
        zipCodeErrorFlags !== 0 ||
        addressLine1ErrorFlags !== 0
      ) {
      // There were errors. Do not continue.
      return;
    }

    $('.bottom-btn-group button').prop("disabled", true);
    $('.bottom-btn-group canvas').css("display", "inline-block");

    $('#submit-error').empty();

    const firstName    = $('#first-name-input').val();
    const lastName     = $('#last-name-input').val();
    const email        = $('#email-input').val();
    const phoneNumber  = $('#phone-number-input').val();
    const state        = $('#state-input').find(':selected').val();
    const county       = $('#county-input').find(":selected").val();
    const addressLine1 = $('#address-line1-input').val();
    const addressLine2 = $('#address-line2-input').val();
    const zipCode      = $('#zip-code-input').val();
    const password     = $('#password-input').val();

    const body = {
      firstName, lastName, email, phoneNumber, state, county,
      addressLine1, addressLine2, zipCode, password
    };
    if (addressLine2 === "") {
      delete body.addressLine2;
    }

    $.ajax({
      type: 'POST',
      url: '/api/user/register',
      data: body,
      success: () => {
        window.location = "/profile";
      },
      error: (res) => {
        const badReq = res.status >= 400 && res.status <= 499 && res.status !== 400;
        if (badReq) {
          const errorMsg = $.parseJSON(res.responseText).message;
          tryAppendError($('#submit-error'), errorMsg, 1, 1);
        } else if (req.status === 400) {
          const errorMsg = $.parseJSON(res.responseText).message.errors;
            console.log("Error message (400): ", errorMsg);
        } else {
          console.log(`Error code: ${req.status}`);
        }
      },
      complete: () => {
        $('.bottom-btn-group button').prop("disabled", false);
        $('.bottom-btn-group canvas').css("display", "none");
      }
    });

    // !! Testing: Re-enabling after a certain amount of time to simulate server response.
    setTimeout(() => {
      $('.bottom-btn-group button').prop("disabled", false);
      $('.bottom-btn-group canvas').css("display", "none");
    }, 1500);
    
  });

  // Resetting errors
  checkForChangeInErrors($('#password-error'), $('#password-input'), getPasswordErrorFlags);
  checkForChangeInErrors($('#email-error'), $('#email-input'), getEmailErrorFlags);
  checkForChangeInErrors($('#repeat-password-error'), $('#repeat-password-input'), getRepeatPasswordErrorFlags);
  checkForChangeInErrors($('#first-name-error'), $('#first-name-input'), getFirstNameErrorFlags);
  checkForChangeInErrors($('#last-name-error'), $('#last-name-input'), getLastNameErrorFlags);
  checkForChangeInErrors($('#phone-number-error'), $('#phone-number-input'), getPhoneNumberErrorFlags);
  checkForChangeInErrors($('#zip-code-error'), $('#zip-code-input'), getZipCodeErrorFlags);
  checkForChangeInErrors($('#address-line1-error'), $('#address-line1-input'), getAddressLine1ErrorFlags);

  // Prevent the user from inputting non-numbers into the phone number input field!
  $('#phone-number-input').keypress((event) => {
    if (event.which < 48 || event.which > 57) {
      event.preventDefault();
    }
  });
  $('#phone-number-input').on("paste", onPasteEvent((content, doNotPaste) => {
    if (!(/^\d+$/.test(content))) {
      doNotPaste();
    }
  }));

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
          (key >= 48 && key <= 57) ||
          key === 32
        )) {
          event.preventDefault();
        }
  });
  $('#first-name-input, #last-name-input').on("paste", onPasteEvent((content, doNotPaste) => {
    if (!(/^[ a-zA-Z0-9]+$/.test(content))) {
      doNotPaste();
    }
  }));

  // Making sure zip codes only recieve numbers.
  $('#zip-code-input').keypress((event) => {
    if (!(event.which >= 48 && event.which <= 57)) {
      event.preventDefault();
    }
  });
  $('#zip-code-input').on("paste", onPasteEvent((content, doNotPaste) => {
    if (!(/^\d+$/.test(content))) {
      doNotPaste();
    }
  }));

  // Making sure only valid characters go into the address lines.
  // https://fsawebenroll.ed.gov/RoboHelp/Business_Address.htm
  $('#address-line1-input, #address-line2-input').keypress((event) => {
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
  $('#address-line1-input, #address-line2-input').on("paste", onPasteEvent((content, doNotPaste) => {
    if (!(/^[a-zA-Z0-9 .'\-#@%&]+$/.test(content))) {
      doNotPaste();
    }
  }));

  $('#show-password-check input').click(() => {
    const input1 = $('#password-input')[0];
    const input2 = $('#repeat-password-input')[0];
    input1.type = input1.type === "password" ? "text" : "password";
    input2.type = input2.type === "password" ? "text" : "password";
  });
});
