function disableTrashcan(onCheckedCB) {
  const trash = $('.bx-trash');
  trash.css("color", "gray");
  trash.removeClass('trash-can-delete');
  onCheckedCB(false);
}

function addCheckboxBehavior(onCheckedCB) {
  $('.better-checkbox input').change(function() {
    disableTrashcan(onCheckedCB);
    
    const trash = $('.bx-trash');
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
  $('#search-input, #page-number-input').prop('readonly', false);

  $('#total-page-span').text("of " + res.totalPages);
  const tableBody = $('#db-table tbody');
  tableBody.empty(); // Remove all existing table entries!
  disableTrashcan(onCheckedCB);
  createNewElementsCB(tableBody, res);
  addCheckboxBehavior(onCheckedCB);
}

function makePageRequest(page, partialUrl, createNewElementsCB, onCheckedCB) {
  if (page === 0) {
    page = page + 1;
  }

  $('#next-page-btn, #prev-page-btn').prop('disabled', true);
  $('#search-input, #page-number-input').prop('readonly', true);
  const searchField = $('#search-dropdown').val();

  const baseUrl = $('[base-url]').attr('base-url');

  const searchValue = $('#search-input').val();

  $.ajax({
    type: 'GET',
    // -1 because it is zero indexed.
    url: `${baseUrl}/api${partialUrl}?page=${page - 1}&${searchField}=${encodeURIComponent(searchValue)}`, 
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

  $('#search-input').on('input', () => {
    const page = parseInt($("#page-number-input").val());
    makePageRequest(page, partialUrl, createNewElementsCB, onCheckedCB);
  });

  addCheckboxBehavior(onCheckedCB);

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

  $('#search-dropdown').change(() => {
    const searchField = $('#search-dropdown').val();
    const searchInput = $('#search-input');
    
    switch (searchField) {
    case 'email':
      searchInput.attr('placeholder', 'susan@gmail.com');
      break;
    case 'name':
      searchInput.attr('placeholder', 'Susan Smith');
      break;
    case 'phone':
      searchInput.attr('placeholder', '7777777777');
      break;
    case 'state':
      searchInput.attr('placeholder', 'VA');
      break;
    case 'county':
      searchInput.attr('placeholder', 'Portsmouth');
      break;
    }
  
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