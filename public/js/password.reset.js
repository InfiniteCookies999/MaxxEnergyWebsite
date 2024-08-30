
$(document).ready(function () {

  const baseUrl = $('[base-url]').attr('base-url');

  $('#show-password-check input').click(() => {
    const input = $('#password-input')[0];
    input.type = input.type === "password" ? "text" : "password";
  });

  $('#bottom-button').click(() => {

    const passwordErrorFlags = getPasswordErrorFlagsFn($('#password-input'))();

    appendErrorMessages($('#password-error'), passwordErrorFlags, (container, flags) => {
      tryAppendError(container, `Too short. Min. Length: ${MIN_PASSWORD_LENGTH}`, flags, PASSWORD_TOO_SHORT_FLAG);
      tryAppendError(container, "Missing special character", flags, PASSWORD_NO_SPECIAL_FLAG);
      tryAppendError(container, "Missing digit", flags, PASSWORD_NO_DIGIT_FLAG);
    });

    if (passwordErrorFlags !== 0) {
      $('#password-input').addClass("is-invalid");
      return;
    }

    const password = $('#password-input').val();

    const url = window.location.href;
    const path = new URL(url).pathname;
    const token = path.split('/').pop();

    $.ajax({
        type: 'PUT',
        url: baseUrl + '/api/user/password-reset',
        data: {
          token: token,
          newPassword: password
        },
        success: () => {
          window.location.href = baseUrl + "/login";
        },
        error: (res) => {
          if (res.status === 401) {
            try {
              const errorMsg = $.parseJSON(res.responseText).message;
              if (errorMsg === "Invalid token") {
                $('#invalid-token-msg').css("display", "block");
              } else {
                processServerErrorResponse(res);
              }
            } catch (error) {
              processServerErrorResponse(res);  
            }
          } else {
            processServerErrorResponse(res);
          }
        }
      });
    });
});