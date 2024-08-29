
function getPhoneNumberErrorFlags() {
  return getFixedNumberErrorFlags($('#phone-number-input'), 10);
}

function getZipCodeErrorFlags() {
  return getFixedNumberErrorFlags($('#zip-code-input'), 5);
}

function getFirstNameErrorFlags() {
  return getNonEmptyErrorFlagsFn($('#first-name-input'))();
}

function getLastNameErrorFlags() {
  return getNonEmptyErrorFlagsFn($('#last-name-input'))();
}

function submitTo(url, body, errorContainer, finishedCB, saveIcon) {
  
  const baseUrl = $('[base-url]').attr('base-url');
  
  $.ajax({
    type: 'PUT',
    url: baseUrl + url,
    data: body,
    error: (res) => {
      processServerErrorResponse(res, errorContainer);
    },
    success: () => {
      finishedCB();
    },
    complete: () => {
      saveIcon.attr("req-save", "false");
    }
  });
}

function submitEmail(finishedCB, saveIcon) {
  const errorFlags = getEmailErrorFlagsFn($('#email-input'))();
  
  appendEmailErrorMessages($('#email-error'), errorFlags);

  if (errorFlags !== 0) {
    $('#email-input').addClass("is-invalid");
    return;
  }

  const email = $('#email-input').val();

  submitTo('/api/user/update-email', { email }, $('#email-error'), finishedCB, saveIcon);

}

function submitPhoneNumber(finishedCB, saveIcon) {
  const errorFlags = getPhoneNumberErrorFlags();
  
  appendErrorMessages($('#phone-number-error'), errorFlags, (container, flags) => {
    tryAppendError(container, "Empty", flags, FIXED_NUMBER_EMPTY);
    tryAppendError(container, "Incomplete", flags, FIXED_NUMBER_INCOMPLETE);
  });

  if (errorFlags !== 0) {
    $('#phone-number-input').addClass('is-invalid');
  }

  const phoneNumber = $('#phone-number-input').val();

  submitTo('/api/user/update-phone', { phoneNumber }, $('#phone-number-error'), finishedCB, saveIcon);
  
}

function submitAddress(finishedCB, saveIcon) {
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
    return;
  }

  const state        = $('#state-input').find(':selected').val();
  const county       = $('#county-input').find(":selected").val();
  const addressLine1 = $('#address-line1-input').val();
  const addressLine2 = $('#address-line2-input').val();
  const zipCode      = $('#zip-code-input').val();
  
  const body = {
    state, county, addressLine1, addressLine2, zipCode
  };
  if (addressLine2 == "") {
    delete body.addressLine2;
  }

  submitTo('/api/user/update-address', body, null, finishedCB, saveIcon);

}

function submitPassword(finishedCB, saveIcon) {
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
    return;
  }

  const oldPassword = $('#old-password-input').val();
  const newPassword = $('#new-password-input').val();

  submitTo('/api/user/update-password', { oldPassword, newPassword }, $('#old-password-error'), finishedCB, saveIcon);

}

function submitName(finishedCB, saveIcon) {
  const firstNameErrorFlags = getFirstNameErrorFlags();
  const lastNameErrorFlags = getLastNameErrorFlags();

  appendErrorMessages($('#first-name-error'), firstNameErrorFlags, (container, flags) => {
    tryAppendError(container, "Empty", flags, FIELD_EMPTY);
  });

  appendErrorMessages($('#last-name-error'), lastNameErrorFlags, (container, flags) => {
    tryAppendError(container, "Empty", flags, FIELD_EMPTY);
  });

  if (firstNameErrorFlags !== 0) {
    $('#first-name-input').addClass("is-invalid");
  }
  if (lastNameErrorFlags !== 0) {
    $('#last-name-input').addClass("is-invalid");
  }

  if (firstNameErrorFlags !== 0 ||
      lastNameErrorFlags !== 0
  ) {
    return;
  }

  const firstName = $('#first-name-input').val();
  const lastName = $('#last-name-input').val();

  submitTo('/api/user/update-name', { firstName, lastName }, null, finishedCB, saveIcon);

}

function submitProfilePicture(file, finishedCB, saveIcon) {

  const reader = new FileReader();
  const image = $('#profile-picture');

  reader.onload = (event) => {
    image.attr('src', event.target.result);
  }

  reader.readAsDataURL(file);

  const formData = new FormData();
  formData.append("file", file);

  const baseUrl = $('[base-url]').attr('base-url');
  
  console.log("sending!");
  $.ajax({
    type: 'PUT',
    url: baseUrl + '/api/user/update-profile-pic',
    data: formData,
    processData: false,
    contentType: false,
    error: (res) => {
      processServerErrorResponse(res);
    }
  });
}

$(document).ready(function() {

  const addressData = $('#address-span').attr("address-data").split(":");
  const userState = addressData[3];
  const userCounty = addressData[2].replaceAll(" ", "-");
  addStatesAndCounties($('#state-input'), $('#county-input'), userState, userCounty);

  $('#profile-picture').on("click", () => {
    const selector = document.getElementById('file-selector');
    
    selector.onchange = () => {
      const file = selector.files[0];
      if (!file) {
        return;
      }

      submitProfilePicture(file);
    };
    selector.click();
  });

  createLoadAnimation(document.getElementById("email-resend-load-animation"));
  $('#email-verified-row button').click(() => {
    
    const button = $('#email-verified-row button');

    $('#email-resend-verification-span').css("display", "none");
    button.css("display", "none");
    $('#email-resend-load-animation').css("display", "inline");
    
    const baseUrl = $('[base-url]').attr('base-url');

    $.ajax({
      type: 'PUT',
      url: baseUrl + "/api/user/resend-email-verification",
      data: {},
      error: (res) => {
        processServerErrorResponse(res, errorContainer);
      },
      success: () => {
        $('#email-resend-verification-span').css("display", "inline");  
      },
      complete: () => {
        $('#email-resend-load-animation').css("display", "none");
        button.css("display", "inline");
      }
    });
    
  });

  $('#profile-picture').on("dragover", (event) => {
    event.preventDefault();
    $('#profile-picture').addClass('profile-drag-border');
  });

  const dragFinished = () => {
    $('#profile-picture').removeClass('profile-drag-border');
  };
  $('#profile-picture').on("dragleave", dragFinished);
  $('#profile-picture').on("dragend", dragFinished);
  $('#profile-picture').on("drop", (event) => {
    event.preventDefault();
    $('#profile-picture').removeClass('profile-drag-border');
    const file = event.originalEvent.dataTransfer.files[0];
    if (!file) {
      return;
    }
    const type = file.type;
    const validTypes = $('#file-selector').attr('accept')
      .split(",")
      .map(v => v.trim())
      .map(v => "image/" + v.substr(1));

    if (!validTypes.includes(type)) {
      // Not a valid file type
      return;
    }

    submitProfilePicture(file);
  });

  // Resetting errors
  checkForChangeInErrors($('#new-password-error'), $('#new-password-input'), getPasswordErrorFlagsFn($('#new-password-input')));
  checkForChangeInErrors($('#old-password-error'), $('#old-password-input'), getNonEmptyErrorFlagsFn($('#old-password-input')));
  checkForChangeInErrors($('#email-error'), $('#email-input'), getEmailErrorFlagsFn($('#email-input')));
  checkForChangeInErrors($('#phone-number-error'), $('#phone-number-input'), getPhoneNumberErrorFlags);
  checkForChangeInErrors($('#address-line1-error'), $('#address-line1-input'), getNonEmptyErrorFlagsFn($('#address-line1-input')));
  checkForChangeInErrors($('#zip-code-error'), $('#zip-code-input'), getZipCodeErrorFlags);
  checkForChangeInErrors($('#first-name-error'), $('#first-name-input'), getFirstNameErrorFlags);
  checkForChangeInErrors($('#last-name-error'), $('#last-name-input'), getLastNameErrorFlags);

  preventInvalidPhoneInput($('#phone-number-input'));

  // Making sure name inputs are alphanumeric.
  preventInvalidName($('#first-name-input, #last-name-input'));

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
      const row = $(editIcon).closest('.tab-row-entry');
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
      
      if ($(saveIcon).attr('#req-save') === "true") {
        // Still has not finished it's previous request. Waiting
        // on the response first.
        return;
      }

      const row = $(saveIcon).closest('.tab-row-entry');
      const editField = row.find('.editable-field');
      const staticField = row.find('.static-field');
      
      const finishedCB = () => {
        if (spanId === 'address-span') {
          const addressLine1 = $('#address-line1-input').val();
          const addressLine2 = $('#address-line2-input').val();
          const county = $('#county-input').find(":selected").val().replaceAll("-", " ");
          const state = $('#state-input').find(":selected").val();
          const zipCode = $('#zip-code-input').val();
          const space = addressLine2 !== "" ? " " : "";
          staticField.text(`${addressLine1}${space}${addressLine2} ${county} ${state}, ${zipCode}`);
        } else if (spanId === 'name-span') {
          const firstName = $('#first-name-input').val();
          const lastName = $('#last-name-input').val();
          staticField.text(`${firstName} ${lastName}`);
        } else if (spanId !== 'password-span') {
          staticField.text(editField.val());
        }
        
        staticField.css("display", "block");
        editField.css("display", "none");
        row.find('.edit-icon').css("display", "inline");
        row.find('.save-icon').css("display", "none");
        row.find('.select-with-search').css("display", "none");
      };

      // Validating inputs for the different fields.
      const spanId = staticField.attr('id');
      if (spanId === 'password-span') {
        const oldPassword = $('#old-password-input').val();
        const newPassword = $('#new-password-input').val();
        if (oldPassword === "" && newPassword === "") {
          // Close immediately if the user did not input anything.
          finishedCB();
          return;
        }
      }


      switch (spanId) {
      case 'email-span':        submitEmail(finishedCB, $(saveIcon)); break;
      case 'phone-number-span': submitPhoneNumber(finishedCB, $(saveIcon)); break;
      case 'address-span':      submitAddress(finishedCB, $(saveIcon)); break;
      case 'password-span':     submitPassword(finishedCB, $(saveIcon)); break;
      case 'name-span':         submitName(finishedCB, $(saveIcon)); break;
      }
    });
  });
});