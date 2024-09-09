
function add_checkbox_behavior(onCheckedCB) {
  $('.better-checkbox input').change(() => {
    const trash = $('.bx-trash');
    trash.css("color", "gray");
    trash.removeClass('trash-can-delete');
    onCheckedCB(false);

    $('.better-checkbox input').each(function() {
      if ($(this).is(":checked")) {
        trash.css("color", "rgb(163, 24, 24)");
        trash.addClass('trash-can-delete');
        if (onCheckedCB) {
          onCheckedCB(true);
        }
      }
    });
  });
}

function finishPageChange(newPage, res, createNewElementsCB, onCheckedCB) {
  $("#page-number-input").val(newPage);
  
  $('#prev-page-btn').prop('disabled', newPage === 1);
  $('#next-page-btn').prop('disabled', newPage === res.totalPages);
  $('#email-search-input, #page-number-input').prop('readonly', false);

  $('#total-page-span').text("of " + res.totalPages);
  const tableBody = $('.table tbody');
  tableBody.empty(); // Remove all existing table entries!
  createNewElementsCB(tableBody, res);
  add_checkbox_behavior(onCheckedCB);
}

function makePageRequest(page, partialUrl, createNewElementsCB, onCheckedCB) {
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
      finishPageChange(page, res, createNewElementsCB, onCheckedCB);
    },
    error: (res) => {
      processServerErrorResponse(res);
    }
  });
}

function createTable(partialUrl, createNewElementsCB, onDeleteCB, onCheckedCB) {
  preventInvalidNonNumber($("#page-number-input"));

  createLoadAnimation(document.getElementById("load-animation"));

  $('#next-page-btn').click(() => {
    const page = parseInt($("#page-number-input").val()) + 1;
    makePageRequest(page, partialUrl, createNewElementsCB, onCheckedCB);
  });

  $('#prev-page-btn').click(() => {
    const page = parseInt($("#page-number-input").val()) - 1;
    makePageRequest(page, partialUrl, createNewElementsCB, onCheckedCB);
  });

  $('#page-number-input').keydown((event) => {
    if (event.key == 'Enter') {
      event.preventDefault();
      $(event.currentTarget).blur();
    }
  })
  .blur(() => {
    const page = parseInt($("#page-number-input").val());
    makePageRequest(page, partialUrl, createNewElementsCB, onCheckedCB);
  });

  $('#email-search-input').on('input', () => {
    const page = parseInt($("#page-number-input").val());
    makePageRequest(page, partialUrl, createNewElementsCB, onCheckedCB);
  });

  add_checkbox_behavior(onCheckedCB);

  $('#popup-confirm-btn').click(() => {
    $('#load-animation').css("display", "block");
    $('#popup-confirm-btn').css("display", "none");
    $('#popup-cancel-btn').prop('disabled', true);
    const trash = $('.bx-trash');
    trash.css("color", "gray");
    trash.removeClass('trash-can-delete');

    onDeleteCB(() => {
      $('#load-animation').css("display", "none");
      $('#popup-confirm-btn').css("display", "block");
      $('#popup-cancel-btn').prop('disabled', false);
      $('#delete-popup').css("display", "none");

      // Reload current page with changes
      const page = parseInt($("#page-number-input").val());
      makePageRequest(page, partialUrl, createNewElementsCB, onCheckedCB);
    });
  });

  $('#popup-cancel-btn').click(() => {
    $('#delete-popup').css("display", "none");
  });

  $(document).on('click', '.trash-can-delete', () => {
    $('#delete-popup').css("display", "block");
  });
}

function getIds() {
  let ids = [];
  $('.better-checkbox input').each(function() {
    
    const checkbox = $(this);
    if (checkbox.is(":checked")) {
      const htmlId = checkbox.attr('id');
      const strId = htmlId.substring(htmlId.lastIndexOf('-') + 1);
      ids.push(parseInt(strId));
    }
  });
  
  return ids;
}