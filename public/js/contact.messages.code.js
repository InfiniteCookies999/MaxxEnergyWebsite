
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
     
  });
});