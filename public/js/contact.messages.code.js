
$(document).ready(() => {
  createTable('/contact/messages', (tableBody, res) => {
    for (const message of res.messages) {
      tableBody.append(`
        <tr>
            <td>
                <div class="form-group smaller-text better-checkbox">
                  <input id="sel-check-${message.id}" type="checkbox" autocomplete="off" class="styled-checkbox">
                  <label class="form-check-label" for="sel-check-${message.id}"></label>
                </div>
            </td>
            <td scope="row">${message.id}</td>
            <td>${message.firstName} ${message.lastName}</td>
            <td>${message.email}</td>
            <td>${message.phone}</td>
            <td>${message.message}</td>
        </tr>`);
    }
  },
  (finishedCB) => {

    $('#load-animation').css("display", "block");
    $('#popup-confirm-btn').css("display", "none");

    const messageIds = getIds();
    
    const baseUrl = $('[base-url]').attr('base-url');

    $.ajax({
      type: 'DELETE',
      url: baseUrl + '/api/contact',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({ messageIds: messageIds }),
      success: () => {
        finishedCB();
      },
      error: (res) => {
        processServerErrorResponse(res);
      },
      complete: () => {
        finishedCB();
      }
    });
  },
  () => {
     
  },
  (searchInput, searchField) => {
    switch (searchField) {
    case 'email':
      searchInput.attr('placeholder', 'susan@gmail.com');
      break;
    case 'name':
      preventInvalidName(searchInput);
      searchInput.attr('placeholder', 'Susan Smith');
      break;
    case 'id':
      preventInvalidNonNumber(searchInput);
      searchInput.attr('placeholder', '25');  
      break;
    case 'messageText':
      searchInput.attr('placeholder', 'Could I get help');
      break;
    case 'phone':
      preventInvalidPhoneInput(searchInput);
      searchInput.attr('placeholder', '7777777777');
      searchInput.attr('maxlength', '12');
      break;
    }
  });
});