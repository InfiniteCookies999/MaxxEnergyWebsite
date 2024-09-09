
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

    $('#load-animation').css("display", "block");
    $('#popup-confirm-btn').css("display", "none");

    const userIds = getIds();
    
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
  },
  (enable) => {
    const roleAddBtn = $('.bxs-shield-plus');
    if (enable) {
      roleAddBtn.css("color", "var(--site-blue-color)");
      roleAddBtn.addClass('role-can-add');
    } else {
      roleAddBtn.css("color", "gray");
      roleAddBtn.removeClass("role-can-add");
    }
  });

  $(document).on('click', '.role-can-add', () => {
    $('#add-role-popup').css("display", "block");
    $('#role-list').empty();
    $('#role-add-input').val('').change();
  });

  $(document).on('click', '.remove-role-x', function() {
    const trGroup = $(this).closest('tr');
    $(this).parent().empty();
    const needsRowRemoval = trGroup.children('td').filter(function() {
      return $(this).children().length != 0
    }).length == 0;
    if (needsRowRemoval) {
      trGroup.remove();
    }
  });

  $('#finished-add-role-btn').click(() => {
    $('#add-role-popup').css("display", "none");
  });

  $('#add-role-btn').click(() => {
    
    $('#load-animation').css("display", "block");
    $('#popup-confirm-btn').css("display", "none");

    const userIds = getIds();
    const role = $('#role-add-input').val();

    let roleGroup = $(`#${role}-added-group`);
    if (roleGroup.length == 0) {
      // Needs created.
      $('#added-roles-group').append(`
        <tr id="${role}-added-group"></tr>
        `);
        roleGroup = $(`#${role}-added-group`);
    }

    // Clear the group entirely since we will add all of them back.
    roleGroup.empty();
    for (const userId of userIds) {
      roleGroup.append(`
        <td class="added-role">
          <span value="${role}">${role.charAt(0).toUpperCase() + role.slice(1)}</span>
          <span class="remove-role-x">X</span>
        </td>
        `);
    }

    /*$('#role-list').append(`
      <li class="added-role">
          <span value="${role}">${role.charAt(0).toUpperCase() + role.slice(1)}</span>
          <span class="remove-role-x">X</span>
      </li>
      `);*/

    const baseUrl = $('[base-url]').attr('base-url');

    /*$.ajax({
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
    });*/

  });
});
