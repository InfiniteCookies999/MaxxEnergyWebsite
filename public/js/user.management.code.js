
function updateRoleCol(userDBTableRow, newRoles) {
  const roleColList = userDBTableRow.children('.role-col-list');
  roleColList.empty();
  for (const newRole of newRoles) {
    roleColList.append(`
      <div class="role-col-role">
          <span>${newRole}</span>
      </div>
      `);
  }
}

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

function addToRoleGroup(group, role, userId) {
  const ourId = parseInt($('#admin-id-store').attr('admin-id'));
  group.append(`
    <td user-role="${role}" user-id=${userId} class="added-role">
      <span>${role.charAt(0).toUpperCase() + role.slice(1)}</span>
      ${(parseInt(userId) === ourId && role === 'admin') ? '' : `<span class="remove-role-x">X</span>`}
    </td>
    `);
}

$(document).ready(() => {
  createTable('/user/users', (tableBody, res) => {
    for (const user of res.users) {
      tableBody.append(`
        <tr user-id="${user.id}" user-roles="${user.rolesJoined}" audit-logs='${user.auditLogs}' user-email=${user.email}>
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
            <td>${user.addressLine1} ${user.addressLine2 || ''} ${user.county} ${user.state}, ${user.zipCode}</td>
            <td class="role-col-list">
              ${user.roles.map((role) => `
                <div class="role-col-role">
                  <span>${role.roleName}</span>
                </div>
              `).join('')}
            </td>
            <td>
              ${user.emailVerified ? `<span class="email-verified-true">True</span>`
                                   : `<span class="email-verified-false">False</span>`}
            </td>
            <td class="audit-log-col">
                <i class='bx bx-food-menu'></i>
            </td>
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
    const passResetBtn = $('#password-reset-btn');
    const sendEmailBtn = $('.send-email-btn');
    if (enable) {
      roleAddBtn.css("color", "var(--site-blue-color)");
      roleAddBtn.addClass('role-can-add');
      passResetBtn.css("color", "var(--site-blue-color)");
      passResetBtn.addClass("can-pass-reset");
      sendEmailBtn.prop("disabled", false);
    } else {
      roleAddBtn.css("color", "gray");
      roleAddBtn.removeClass("role-can-add");
      passResetBtn.css("color", "gray");
      passResetBtn.removeClass("can-pass-reset");
      sendEmailBtn.prop("disabled", true);
    }
  },
  (searchInput, searchField) => {

    const replaceWithTextInput = () => {
      if (!searchInput.is('input')) {
        $('#select-search-input-container').replaceWith(`
          <input id="search-input"
                 type="text"
                 class="form-control mx-2">
          `);
          searchInput = $('#search-input');
      }
    };

    const replaceWithStateSelect = () => {
      let replaceInput = searchInput;
      if (!replaceInput.is('input')) {
        replaceInput = $('#select-search-input-container');
      }

      replaceInput.replaceWith(`
          <div id='select-search-input-container' class="select-with-search">
              <select id="search-input" data-live-search="true" class="selectpicker">
              </select>
          </div>
        `);
        searchInput = $('#search-input');
        setStates(searchInput);
    };

    searchInput.attr('max-length', '');
    switch (searchField) {
      case 'email':
        replaceWithTextInput();
        searchInput.attr('placeholder', 'susan@gmail.com');
        break;
      case 'name':
        replaceWithTextInput();
        preventInvalidName(searchInput);
        searchInput.attr('placeholder', 'Susan Smith');
        break;
      case 'phone':
        replaceWithTextInput();
        preventInvalidPhoneInput(searchInput);
        searchInput.attr('placeholder', '7777777777');
        searchInput.attr('maxlength', '12');
        break;
      case 'state':
        replaceWithStateSelect();
        break;
      case 'county':
        replaceWithTextInput();
        searchInput.attr('placeholder', 'Fairfax County');
        break;
      case 'id':
        replaceWithTextInput();
        preventInvalidNonNumber(searchInput);
        searchInput.attr('placeholder', '25');  
        break;
      case 'zipcode':
        replaceWithTextInput();
        preventInvalidNonNumber(searchInput);
        searchInput.attr('placeholder', '67890');
        searchInput.attr('maxlength', '5');
        break;
      case 'fullAddress':
        replaceWithTextInput();
        searchInput.attr('placeholder', '123 Elm St Fairfax County VA, 23456');
        break;
      }
  });

  // Functionality for adding existing roles of user to the role add
  // popup.
  $(document).on('click', '.role-can-add', () => {
    $('#add-role-popup').css("display", "block");

    $('#role-add-input').val('').change();
    const roleNamesGroup = $('#add-roles-user-names');
    roleNamesGroup.empty();

    $('#added-roles-group').empty();

    let checkedUserCount = 0;
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
            if (checkedUserCount > 0 && roleGroup.children('td').length === 0) {
              // First insertion into the table which means
              // we got to add padding for any of the user
              // users that came before this one.
              for (let i = 0; i < checkedUserCount; ++i) {
                roleGroup.append(`<td class="added-role"></td>`);
              }
            }
            addToRoleGroup(roleGroup, role, userRow.attr('user-id'));
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

          ++checkedUserCount;
      }
    });

  });

  // Functionality for removing a roll from a specific user.
  $(document).on('click', '.remove-role-x', function() {
    const trGroup = $(this).closest('tr');
    const row = $(this).parent();
    const userId = row.attr('user-id');
    const role = row.attr('user-role');
    
    row.empty();
    const needsRowRemoval = trGroup.children('td').filter(function() {
      return $(this).children().length != 0
    }).length == 0;
    if (needsRowRemoval) {
      trGroup.remove();
    }

    const userDBTableRow = $('#db-table tbody tr').filter(function() {
      return $(this).attr('user-id') === userId;
    });
    const currentRoles = userDBTableRow.attr('user-roles');
    const newRoles = currentRoles
                      .split(',')
                      .filter(r => r.trim() !== '')
                      .filter(r => r !== role); // Filter out current role being removed.
    userDBTableRow.attr('user-roles', newRoles.join());

    // Changing the roles that are displayed for the given user in the main table.
    updateRoleCol(userDBTableRow, newRoles);

    const baseUrl = $('[base-url]').attr('base-url');

    $.ajax({
      type: 'DELETE',
      url: baseUrl + '/api/user/remove-role',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({
        userId: userId,
        role: role
      }),
      error: (res) => {
        processServerErrorResponse(res);
      }
    });
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
      addToRoleGroup(roleGroup, role, userId);
    }
    // Updating the database table to indicate that the users now have
    // this new role.
    
    // First we filter for all the user rows of the current users we
    // are updating.
    const userDBTableRows = $('#db-table tbody tr').filter(function() {
      return userIds.includes(parseInt($(this).attr('user-id')));
    });
    
    // Next we go and update the list if needed for each user row.
    userDBTableRows.each(function() {
      const userRow = $(this);
      const currentRoles = userRow.attr('user-roles');
      const newRoles = currentRoles
                        .split(',')
                        .filter(r => r.trim() !== '');
      // If the roles do no include the new role we got to add it.
      if (!newRoles.includes(role)) {
        newRoles.push(role);
      }  
      userRow.attr('user-roles', newRoles.join());
      updateRoleCol(userRow, newRoles);
    });

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

  $('#finished-audit-log-btn').click(() => {
    document.body.style.overflow = 'auto';
    $('#audit-log-popup').hide();
  });

  $(document).on('click', '.audit-log-col', function() {
    document.body.style.overflow = 'hidden';

    const userRow = $(this).closest('tr');
    let auditLogs = userRow.attr("audit-logs");
    auditLogs = auditLogs === '' ? '' : JSON.parse(auditLogs);
    $('#audit-log-popup').show();
    
    $('#audit-log-popup table tbody').empty();

    const logTable = $('#audit-log-popup table tbody');
    const dateOptions = {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false, // 24-hour format
    };
    for (const auditLog of auditLogs) {
      const formattedDate = new Date(auditLog.date).toLocaleDateString('en-US', dateOptions);
      logTable.append(`
          <tr>
              <td>${formattedDate}</td>
              <td>${auditLog.action}</td>
              <td>${auditLog.description}</td>
          </tr>
        `);
    }
  });

  // Password reset initiation.
  createLoadAnimation(document.getElementById("load-animation2"));
  
  $('#popup-cancel-btn2').click(() => {
    $('#pass-reset-popup').css("display", "none");
  });

  $(document).on('click', '.can-pass-reset', () => {
    $('#pass-reset-popup').css("display", "block");
  });

  $('#popup-confirm-btn2').click(() => {
    $('#load-animation2').css("display", "block");
    $('#popup-confirm-btn2').css("display", "none");
    $('#popup-cancel-btn2').prop('disabled', true);

    const emails = [];
    $('.better-checkbox input').each(function() {
      
      const checkbox = $(this);
      if (checkbox.is(":checked")) {
        const email = checkbox.closest("tr").attr('user-email');
        emails.push(email);
      }
    });
    
    const baseUrl = $('[base-url]').attr('base-url');

    const requests = [];
    for (const email of emails) {
      const request = $.ajax({
        type: 'POST',
        url: `${baseUrl}/api/user/request-password-reset`,
        data: { email }
      });
      requests.push(request);
    }
    
    $.when(...requests)
      .done(() => {
        $('#load-animation2').css("display", "none");
        $('#popup-confirm-btn2').css("display", "block");
        $('#popup-cancel-btn2').prop('disabled', false);
        $('#pass-reset-popup').css("display", "none");
      })
      .fail((_, textStatus, errorThrown) => {
        console.error('One or more requests failed', textStatus, errorThrown);
      });
  });

  // Sending emails.
  const areEmailsValid = () => {
    const toEmails = $('#to-email-input').val()
      .split(',')
      .map(e => e.trim());
    const areValid = toEmails.filter(e => !e.toLowerCase().match(EMAIL_PATTERN)).length === 0;
    return areValid;
  };
  
  $('.send-email-btn').click(() => {
    //#to-email-input
    const toInput = $('#to-email-input');

    const emails = [];
    $('.better-checkbox input').each(function() {
      
      const checkbox = $(this);
      if (checkbox.is(":checked")) {
        const email = checkbox.closest("tr").attr('user-email');
        emails.push(email);
      }
    });

    toInput.val(emails.join(', '));

    $('#send-email-popup').show();
  });

  $('#email-subject-input, #to-email-input, #email-body').keyup(() => {
    const sendOffBtn = $('.send-off-emails');
    const emailSubject = $('#email-subject-input').val();
    const toEmails = $('#to-email-input').val();
    const emailBody = $('#email-body').val();
    const emailsValid = areEmailsValid();
    if (!emailsValid) {
      $('#to-email-input').addClass('is-invalid');
    } else {
      $('#to-email-input').removeClass('is-invalid');
    }

    if (emailSubject === '' || toEmails === '' || emailBody === '' || !emailsValid) {
      // cannot send
      sendOffBtn.prop("disabled", true);
    } else {
      // can send!
      sendOffBtn.prop("disabled", false);
    }
  });

  $('#popup-cancel-btn3').click(() => {
    $('#send-email-popup').hide();
  });
});
