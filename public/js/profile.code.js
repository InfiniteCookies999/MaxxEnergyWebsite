
function getPhoneNumberErrorFlags() {
  return getFixedNumberErrorFlags($('#phone-number-input'), 10);
}

function getZipCodeErrorFlags() {
  return getFixedNumberErrorFlags($('#zip-code-input'), 5);
}

function submitEmail() {
  const errorFlags = getEmailErrorFlagsFn($('#email-input'))();
  
  appendEmailErrorMessages($('#email-error'), errorFlags);

  if (errorFlags !== 0) {
    $('#email-input').addClass("is-invalid");
    return false;
  }

  // TODO: Here we would submit the new email to the server.

  return true;
}

function submitPhoneNumber() {
  const errorFlags = getPhoneNumberErrorFlags();
  
  appendErrorMessages($('#phone-number-error'), errorFlags, (container, flags) => {
    tryAppendError(container, "Empty", flags, FIXED_NUMBER_EMPTY);
    tryAppendError(container, "Incomplete", flags, FIXED_NUMBER_INCOMPLETE);
  });

  if (errorFlags !== 0) {
    $('#phone-number-input').addClass('is-invalid');
    return false;
  }

  // TODO: Here we would submit the new phone number to the server.

  return true;
}

function submitAddress() {
  const zipCodeErrorFlags = getZipCodeErrorFlags();
  const addressLine1ErrorFlags = getNonEmptyErrorFlagsFn($('#address-line1-input'))();

  appendErrorMessages($('#address-line1-error'), addressLine1ErrorFlags, (container, flags) => {
    tryAppendError(container, "Empty", flags, FIELD_EMPTY);
  });

  appendErrorMessages($('#zip-code-error'), zipCodeErrorFlags, (container, flags) => {
    tryAppendError(container, "Empty", flags, FIXED_NUMBER_EMPTY);
    tryAppendError(container, "Incomplete", flags, FIXED_NUMBER_INCOMPLETE);
  });

  if (addressLine1ErrorFlags !== 0) {
    $('#address-line1-input').addClass("is-invalid");
  }

  if (zipCodeErrorFlags !== 0) {
    $('#zip-code-input').addClass("is-invalid");
  }

  if (addressLine1ErrorFlags !== 0 ||
      zipCodeErrorFlags !== 0) {
    return false;
  }

  // TODO: Here we would submit the new address to the server.

  return true;
}

function submitPassword() {
  const oldPasswordErrorFlags = getNonEmptyErrorFlagsFn($('#old-password-input'))();
  const newPasswordErrorFlags = getPasswordErrorFlagsFn($('#new-password-input'))();

  appendErrorMessages($('#old-password-error'), oldPasswordErrorFlags, (container, flags) => {
    tryAppendError(container, "Empty", flags, FIELD_EMPTY);
  });

  appendErrorMessages($('#new-password-error'), newPasswordErrorFlags, (container, flags) => {
    tryAppendError(container, `Too short. Min. Length: ${MIN_PASSWORD_LENGTH}`, flags, PASSWORD_TOO_SHORT_FLAG);
    tryAppendError(container, "Missing special character", flags, PASSWORD_NO_SPECIAL_FLAG);
    tryAppendError(container, "Missing digit", flags, PASSWORD_NO_DIGIT_FLAG);
  });

  if (oldPasswordErrorFlags !== 0) {
    $('#old-password-input').addClass("is-invalid");
  }

  if (newPasswordErrorFlags !== 0) {
    $('#new-password-input').addClass("is-invalid");
  }

  if (oldPasswordErrorFlags !== 0 ||
      newPasswordErrorFlags !== 0) {
    return false;
  }

  return true;
}

$(document).ready(function() {

  const addressData = $('#address-span').attr("address-data").split(":");
  const userState = addressData[3];
  const userCounty = addressData[2].replaceAll(" ", "-");
  addStatesAndCounties($('#state-input'), $('#county-input'), userState, userCounty);

  // Resetting errors
  checkForChangeInErrors($('#new-password-error'), $('#new-password-input'), getPasswordErrorFlagsFn($('#new-password-input')));
  checkForChangeInErrors($('#old-password-error'), $('#old-password-input'), getNonEmptyErrorFlagsFn($('#old-password-input')));
  checkForChangeInErrors($('#email-error'), $('#email-input'), getEmailErrorFlagsFn($('#email-input')));
  checkForChangeInErrors($('#phone-number-error'), $('#phone-number-input'), getPhoneNumberErrorFlags);
  checkForChangeInErrors($('#address-line1-error'), $('#address-line1-input'), getNonEmptyErrorFlagsFn($('#address-line1-input')));
  checkForChangeInErrors($('#zip-code-error'), $('#zip-code-input'), getZipCodeErrorFlags);

  preventInvalidPhoneInput($('#phone-number-input'));

  // Making sure zip codes only recieve numbers.
  preventInvalidNonNumber($('#zip-code-input'));

  preventInvalidAddressLine($('#address-line1-input, #address-line2-input'));

  $('#state-input').on('change', () => {
    const state = $(this).find("option:selected").val();
    setCounties($('#county-input'), state, "");
  });

  // Turn the edit box on if the user clicks the edit button.
  $('.edit-icon').each((_, editIcon) => {
    $(editIcon).on('click', () => {
      const row = $(editIcon).closest('tr');
      const editField = row.find('.editable-field');
      const staticField = row.find('.static-field');

      if (staticField.attr('id') === 'password-span') {
        editField.val("");
      }

      staticField.css("display", "none");
      row.find('.editable-field').css("display", "block");
      row.find('.edit-icon').css("display", "none");
      row.find('.save-icon').css("display", "inline");
      row.find('.select-with-search').css("display", "block");
    });
  });

  // Turn the edit box off if the user clicks the edit button and save.
  $('.save-icon').each((_, saveIcon) => {
    $(saveIcon).on('click', () => {
      const row = $(saveIcon).closest('tr');
      const editField = row.find('.editable-field');
      const staticField = row.find('.static-field');
      
      // Validating inputs for the different fields.
      const spanId = staticField.attr('id');
      switch (spanId) {
      case 'email-span':
        if (!submitEmail()) {
          return;
        }
        break;
      case 'phone-number-span':
        if (!submitPhoneNumber()) {
          return;
        }
        break;
      case 'address-span':
        if (!submitAddress()) {
          return;
        }  
        break;
      case 'password-span':
        if (!submitPassword()) {
          return;
        }
        break;
      }
    
      if (spanId === 'address-span') {
        const addressLine1 = $('#address-line1-input').val();
        const addressLine2 = $('#address-line2-input').val();
        const county = $('#county-input').find(":selected").val().replaceAll("-", " ");
        const state = $('#state-input').find(":selected").val();
        const zipCode = $('#zip-code-input').val();
        const space = addressLine2 !== "" ? " " : "";
        staticField.text(`${addressLine1}${space}${addressLine2} ${county} ${state}, ${zipCode}`);
      } else if (spanId !== 'password-span') {
        staticField.text(editField.val());
      }
      
      staticField.css("display", "block");
      editField.css("display", "none");
      row.find('.edit-icon').css("display", "inline");
      row.find('.save-icon').css("display", "none");
      row.find('.select-with-search').css("display", "none");
    });
  });
});