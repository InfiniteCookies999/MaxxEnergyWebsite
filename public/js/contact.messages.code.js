function finishPageChange(newPage, res) {
  $("#page-number-input").val(newPage);
  
  $('#prev-page-btn').prop('disabled', newPage === 1);
  $('#next-page-btn').prop('disabled', newPage === res.totalPages);

  $('#total-page-span').text("of " + res.totalPages);
  const tableBody = $('.table tbody');
  tableBody.empty(); // Remove all existing table entries!
  for (const message of res.messages) {
    tableBody.append(`
      <tr>
          <td scope="row">${message.id}</td>
          <td>${message.firstName} ${message.lastName}</td>
          <td>${message.email}</td>
          <td>${message.message}</td>
      </tr>
      `);
  }
}

function makePageRequest(page) {
  if (page === 0) {
    page = page + 1;
  }

  $('#next-page-btn #prev-page-btn').prop('disabled', true);

  const baseUrl = $('[base-url]').attr('base-url');

  $.ajax({
    type: 'GET',
    url: baseUrl + '/api/contact/pages/' + (page - 1), // it is zero indexed.
    success: (res) => {
      finishPageChange(page, res);
    },
    error: (res) => {
      processServerErrorResponse(res);
    }
  });
}

$(document).ready(() => {

  preventInvalidNonNumber($("#page-number-input"));

  $('#next-page-btn').click(() => {
    const page = parseInt($("#page-number-input").val()) + 1;
    makePageRequest(page);
  });

  $('#prev-page-btn').click(() => {
    const page = parseInt($("#page-number-input").val()) - 1;
    makePageRequest(page);
  });

  $('#page-number-input').keydown((event) => {
    if (event.key == 'Enter') {
      event.preventDefault();
      $(event.currentTarget).blur();
    }
  })
  .blur(() => {
    const page = parseInt($("#page-number-input").val());
    makePageRequest(page);
  });
});