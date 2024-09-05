
$(document).ready(() => {

  createTable('/user/users', (tableBody, res) => {
    for (const user of res.users) {
      tableBody.append(`
        <tr>
            <td>
                <div class="form-group smaller-text better-checkbox">
                  <input id="sel-check-${user.id}" type="checkbox" autocomplete="off" class="styled-checkbox">
                  <label class="form-check-label" for="sel-check-${user.id}"></label>
                </div>
            </td>
            <td scope="row">${user.id}</td>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.addressLine1} ${user.addressLine2} ${user.county} ${user.state}, ${user.zipCode}</td>
        </tr>`);
    }
  },
  (finishedCB) => {

    let userIds = [];
    $('.better-checkbox input').each(function() {
      $('#load-animation').css("display", "block");
      $('#popup-confirm-btn').css("display", "none");
      
      const checkbox = $(this);
      if (checkbox.is(":checked")) {
        const id = checkbox.attr('id');
        const userId = id.substring(id.lastIndexOf('-') + 1);
        userIds.push(parseInt(userId));
      }
    });

    const baseUrl = $('[base-url]').attr('base-url');

    $.ajax({
      type: 'DELETE',
      url: baseUrl + '/api/user',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({ userIds: userIds }),
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
  });
});
