const firstName = document.getElementById('first_name');
const lastName = document.getElementById('last_name');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const message = document.getElementById('message');
const contact_form = document.getElementById('contact_f orm');

const REPEAT_PASSWORD_EMPTY_FLAG    = 0x01;
const REPEAT_PASSWORD_NO_MATCH_FLAG = 0x02;

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

function getFirstNameErrorFlags() {
  return getNonEmptyErrorFlagsFn($('#first-name-input'))();
}

function getLastNameErrorFlags() {
  return getNonEmptyErrorFlagsFn($('#last-name-input'))();
}

function getPhoneNumberErrorFlags() {
  return getFixedNumberErrorFlags($('#phone-number-input'), 10);
}

function getZipCodeErrorFlags() {
  return getFixedNumberErrorFlags($('#zip-code-input'), 5);
}

$(document).ready(function () {

  createLoadAnimation(document.getElementById("load-animation"));

  (async () => {

    // https://ip-api.com
    let userState = undefined;
    try {
      
      const response = await fetch("http://ip-api.com/json");
      const json = await response.json();

      userState = json.regionName;

    } catch (error) {
      // Ignoring the error since this is only helpful information not essential.
    }

    addStatesAndCounties($('#state-input'), $('#county-input'), userState, "");
  
  })();

  $('#state-input').on('change', () => {
    const state = $(this).find("option:selected").val();
    setCounties($('#county-input'), state, "");
  });

  $("form").submit((event) => {
    event.preventDefault();

    const passwordErrorFlags       = getPasswordErrorFlagsFn($('#password-input'))();
    const emailErrorFlags          = getEmailErrorFlagsFn($('#email-input'))();
    const repeatPasswordErrorFlags = getRepeatPasswordErrorFlags();
    const firstNameErrorFlags      = getFirstNameErrorFlags();
    const lastNameErrorFlags       = getLastNameErrorFlags();
    const phoneNumberErrorFlags    = getPhoneNumberErrorFlags();
    const zipCodeErrorFlags        = getZipCodeErrorFlags();
    const addressLine1ErrorFlags   = getNonEmptyErrorFlagsFn($('#address-line1-input'))();
    
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
        processServerErrorResponse(res, $('#submit-error'));
      },
      complete: () => {
        $('.bottom-btn-group button').prop("disabled", false);
        $('.bottom-btn-group canvas').css("display", "none");
      }
    });
  });

  // Resetting errors
  checkForChangeInErrors($('#password-error'), $('#password-input'), getPasswordErrorFlagsFn($('#password-input')));
  checkForChangeInErrors($('#email-error'), $('#email-input'), getEmailErrorFlagsFn($('#email-input')));
  checkForChangeInErrors($('#repeat-password-error'), $('#repeat-password-input'), getRepeatPasswordErrorFlags);
  checkForChangeInErrors($('#first-name-error'), $('#first-name-input'), getFirstNameErrorFlags);
  checkForChangeInErrors($('#last-name-error'), $('#last-name-input'), getLastNameErrorFlags);
  checkForChangeInErrors($('#phone-number-error'), $('#phone-number-input'), getPhoneNumberErrorFlags);
  checkForChangeInErrors($('#zip-code-error'), $('#zip-code-input'), getZipCodeErrorFlags);
  checkForChangeInErrors($('#address-line1-error'), $('#address-line1-input'), getNonEmptyErrorFlagsFn($('#address-line1-input')));

  preventInvalidPhoneInput($('#phone-number-input'));

  // Making sure name inputs are alphanumeric.
  preventInvalidName($('#first-name-input, #last-name-input'));

  // Making sure zip codes only recieve numbers.
  preventInvalidNonNumber($('#zip-code-input'));

  preventInvalidAddressLine($('#address-line1-input, #address-line2-input'));

  $('#show-password-check input').click(() => {
    const input1 = $('#password-input')[0];
    const input2 = $('#repeat-password-input')[0];
    input1.type = input1.type === "password" ? "text" : "password";
    input2.type = input2.type === "password" ? "text" : "password";
  });
});
