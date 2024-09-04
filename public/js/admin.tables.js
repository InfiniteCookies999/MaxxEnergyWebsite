
function finishPageChange(newPage, res, createNewElementsCB) {
  $("#page-number-input").val(newPage);
  
  $('#prev-page-btn').prop('disabled', newPage === 1);
  $('#next-page-btn').prop('disabled', newPage === res.totalPages);
  $('#email-search-input, #page-number-input').prop('readonly', false);

  $('#total-page-span').text("of " + res.totalPages);
  const tableBody = $('.table tbody');
  tableBody.empty(); // Remove all existing table entries!
  createNewElementsCB(tableBody, res);
}

function makePageRequest(page, partialUrl, createNewElementsCB) {
  if (page === 0) {
    page = page + 1;
  }

  $('#next-page-btn, #prev-page-btn').prop('disabled', true);
  $('#email-search-input, #page-number-input').prop('readonly', true);

  const baseUrl = $('[base-url]').attr('base-url');

  const searchEmail = $('#email-search-input').val();

  $.ajax({
    type: 'GET',
    // -1 because it is zero indexed.
    url: `${baseUrl}/api${partialUrl}?page=${page - 1}&email=${encodeURIComponent(searchEmail)}`, 
    success: (res) => {
      finishPageChange(page, res, createNewElementsCB);
    },
    error: (res) => {
      processServerErrorResponse(res);
    }
  });
}

function createTable(partialUrl, createNewElementsCB) {
  preventInvalidNonNumber($("#page-number-input"));

  $('#next-page-btn').click(() => {
    const page = parseInt($("#page-number-input").val()) + 1;
    makePageRequest(page, partialUrl, createNewElementsCB);
  });

  $('#prev-page-btn').click(() => {
    const page = parseInt($("#page-number-input").val()) - 1;
    makePageRequest(page, partialUrl, createNewElementsCB);
  });

  $('#page-number-input').keydown((event) => {
    if (event.key == 'Enter') {
      event.preventDefault();
      $(event.currentTarget).blur();
    }
  })
  .blur(() => {
    const page = parseInt($("#page-number-input").val());
    makePageRequest(page, partialUrl, createNewElementsCB);
  });

  $('#email-search-input').on('input', () => {
    const page = parseInt($("#page-number-input").val());
    makePageRequest(page, partialUrl, createNewElementsCB);
  });
}
