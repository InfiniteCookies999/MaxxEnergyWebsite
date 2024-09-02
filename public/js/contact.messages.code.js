$(document).ready(() => {
  preventInvalidNonNumber($("#page-number-input"));

  $('#next-page-btn').click(() => {
    console.log("trying to disable?");
    console.log($(this));
    $(this).prop('disabled', true);
  });

  $('#prev-page-btn').click(() => {
    $(this).prop('disabled', true);
  });

});