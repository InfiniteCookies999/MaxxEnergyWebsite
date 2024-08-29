

$(document).ready(function () {

  const baseUrl = $('[base-url]').attr('base-url');

  $('#reset-button').click(() => {
    $('#success-span').css("display", "none");

    const emailErrorFlags = getEmailErrorFlagsFn($('#email-input'))();

    appendEmailErrorMessages($('#email-error'), emailErrorFlags);

    if (emailErrorFlags !== 0) {
      $('#email-input').addClass("is-invalid");
      return;
    }

    const email = $('#email-input').val();

    $.ajax({
      type: 'POST',
      url: baseUrl + '/api/user/request-password-reset',
      data: {
        email
      },
      success: () => {
        $('#success-span').css("display", "inline");
      },
      error: (res) => {
        processServerErrorResponse(res, $('#submit-error'));
      }
    });
  });
});