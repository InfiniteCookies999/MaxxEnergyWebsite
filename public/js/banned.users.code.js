
$(document).ready(() => {
  createTable('/banned', (tableBody, res) => {
    for (const ban of res.bans) {
      tableBody.append(`
        <tr>
            <td>
                <div class="form-group smaller-text better-checkbox">
                  <input id="sel-check-${ban.id}" type="checkbox" autocomplete="off" class="styled-checkbox">
                  <label class="form-check-label" for="sel-check-${ban.id}"></label>
                </div>
            </td>
            <td scope="row">${ban.id}</td>
            <td>${ban.email === null ? '' : ban.email}</td>
            <td>${ban.ip === null ? '' : ban.ip}</td>
        </tr>`);
    }
  },
  (finishedCB) => {
    $('#load-animation').css("display", "block");
    $('#popup-confirm-btn').css("display", "none");

    const banIds = getIds();
    
    const baseUrl = $('[base-url]').attr('base-url');

    $.ajax({
      type: 'DELETE',
      url: baseUrl + '/api/banned',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({ banIds: banIds }),
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
    case 'ip':
      searchInput.attr('placeholder', '13.563.24.884');
      break;
    }
  });
});