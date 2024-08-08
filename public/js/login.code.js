const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 40;

const PASSWORD_TOO_SHORT_FLAG  = 0x01;
const PASSWORD_NO_SPECIAL_FLAG = 0x02;
const PASSWORD_NO_DIGIT_FLAG   = 0x04;

function tryAppendError(errContainer, errMsg, errorFlags, flag) {
  if ((errorFlags & flag) === 0) { 
    return; 
  }
  // TODO: Although the box icon seems to display correctly it display a warning message in console.
  const errSpan = $(`<span><i class="bx bx-error-alt"></i> ${errMsg}. </span>`);
  errSpan.data("flag", flag);
  errContainer.append(errSpan);
}

function getPasswordErrorFlags() {
  const password = $('#password-input').val();
  let errorFlags = 0;

  if (password.length < MIN_PASSWORD_LENGTH) {
    errorFlags |= PASSWORD_TOO_SHORT_FLAG;
  }

  // See: https://stackoverflow.com/questions/32311081/check-for-special-characters-in-string
  if (!password.match(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/)) {
    errorFlags |= PASSWORD_NO_SPECIAL_FLAG;
  }

  if (!password.match(/\d/)) {
    errorFlags |= PASSWORD_NO_DIGIT_FLAG;
  }

  return errorFlags;
}

$(document).ready(function () {

  $('#password-input').maxLength = MAX_PASSWORD_LENGTH;

  $("form").submit((event) => {
    event.preventDefault();

    const passwordErrorFlags = getPasswordErrorFlags();

    // Displaying the error messages.
    const errContainer = $('#password-error');

    errContainer.data("errorFlags", passwordErrorFlags);
    errContainer.empty();
    
    tryAppendError(errContainer, `Too short. Min. Length: ${MIN_PASSWORD_LENGTH}`, passwordErrorFlags,
      PASSWORD_TOO_SHORT_FLAG);
    
    tryAppendError(errContainer, "Missing special character", passwordErrorFlags,
      PASSWORD_NO_SPECIAL_FLAG);
    
    tryAppendError(errContainer, `Missing digit`, passwordErrorFlags,
      PASSWORD_NO_DIGIT_FLAG);

    if (passwordErrorFlags !== 0) {
      $('#password-input').addClass("is-invalid");
      return;
    }

    console.log("Sending login to server!");
  });

  $('#password-input').on("input", () => {
    const errContainer = $('#password-error');
    const errorFlags = errContainer.data("errorFlags");
    if (errorFlags !== undefined && errorFlags !== 0) {
      // Updatting the errors.
      const newErrorFlags = getPasswordErrorFlags();

      errContainer.data("errorFlags", newErrorFlags);
      // Remove any children for the missing errors.
      for (errSpan of errContainer.children()) {
        if ((newErrorFlags & $(errSpan).data("flag")) === 0) {
          errSpan.remove();
        }
      }

      if (newErrorFlags === 0) {
        $('#password-input').removeClass("is-invalid");
      }
    }
  });

  $('#show-password-check input').click(() => {
    const input = $('#password-input')[0];
    input.type = input.type === "password" ? "text" : "password";
  });
});
