
function getOrCreateRoleGroup(role) {
  const roleGroup = $(`#${role}-added-group`);
  if (roleGroup.length == 0) {
    // Needs created.
    $('#added-roles-group').append(`
      <tr id="${role}-added-group"></tr>
      `);
      // Get the newly created role group.
      return $(`#${role}-added-group`);
  }
  return roleGroup;
}

function addToRoleGroup(group, role) {
  group.append(`
    <td class="added-role">
      <span value="${role}">${role.charAt(0).toUpperCase() + role.slice(1)}</span>
      <span class="remove-role-x">X</span>
    </td>
    `);
}

$(document).ready(() => {
  createTable('/user/users', (tableBody, res) => {
    for (const user of res.users) {
      tableBody.append(`
        <tr user-roles="${user.roles}">
            <td>
                <div class="form-group smaller-text better-checkbox">
                  <input id="sel-check-${user.id}" type="checkbox" autocomplete="off" class="styled-checkbox">
                  <label class="form-check-label" for="sel-check-${user.id}"></label>
                </div>
            </td>
            <td scope="row">${user.id}</td>
            <td class="user-name">${user.firstName} ${user.lastName}</td>
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

    console.log("clicked on role can add?");
    
    $('#role-add-input').val('').change();
    const roleNamesGroup = $('#add-roles-user-names');
    roleNamesGroup.empty();

    $('#added-roles-group').empty();

    $('.better-checkbox input').each(function() {
      
      const checkbox = $(this);
      if (checkbox.is(":checked")) {
          const userRow = $(this).closest('tr');
          const usersNameSpan = userRow.children('.user-name');
          roleNamesGroup.append(`<th scope="col">${usersNameSpan.text()}</th>`);
          const roles = userRow.attr('user-roles')
            .split(',')
            .filter(r => r.trim() !== '');
        
          // Going through each role and adding the entry to the table.
          for (const role of roles) {
            const roleGroup = getOrCreateRoleGroup(role);
            addToRoleGroup(roleGroup, role);
          }

          // Going through all existing role groups and if the user does
          // not have the role adding a blank row.
          $('#added-roles-group').children().each(function() {
            const roleGroup = $(this);
            const roleGroupId = roleGroup.attr('id');
            const roleGroupRole = roleGroupId.substring(0, roleGroupId.indexOf('-'));
            if (!roles.includes(roleGroupRole)) {
              roleGroup.append(`<td class="added-role"></td>`);
            }
          });
      }
    });

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

    const roleGroup = getOrCreateRoleGroup(role);

    // Clear the group entirely since we will add all of them back.
    roleGroup.empty();
    for (const userId of userIds) {
      addToRoleGroup(roleGroup, role);
    }

    const baseUrl = $('[base-url]').attr('base-url');

    $.ajax({
      type: 'PUT',
      url: baseUrl + '/api/user/add-roles',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({
        userIds: userIds,
        role: role
      }),
      error: (res) => {
        processServerErrorResponse(res);
      }
    });

  });
});
