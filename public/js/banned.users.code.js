
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

  $('#cancel-ban-btn').click(() => {
    $('#ban-user-popup').hide();
  });

  const banInput = $('#ban-input');
  $('.add-ban-btn').click(() => {
    $('#ban-user-popup').show();
    banInput.val("");
  });

  $('#ban-selection-type-dropdwon').change(() => {
    const selected = $('#ban-selection-type-dropdwon').val();
    const banInput = $('#ban-input');
    banInput.val("");
    
    if (selected === 'email') {
      banInput.attr('placeholder', 'susan@gmail.com');
      banInput.attr('maxlength', '320');
    } else { // ip
      banInput.attr('placeholder', '123.12.255.6');
      banInput.attr('maxlength', '15');
    }
  });

  const ipv4Pattern = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;
  const ipv6Pattern = /^((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])$/;
  banInput.keypress((event) => {
    const selected = $('#ban-selection-type-dropdwon').val();
    if (selected === 'ip') {
      if (!((event.which >= 48 && event.which <= 57) || event.which === 46)) {
        event.preventDefault();
        return;
      }
    }

    const value = banInput.val();
    $('#confirm-ban-btn').prop('disabled', value === '');
  });

  banInput.on('input', () => {
    $('#ban-error').empty();
  });

  $('#confirm-ban-btn').click(() => {
    const selected = $('#ban-selection-type-dropdwon').val();

    const value = banInput.val();

    if (selected === 'ip') {
      if (!(ipv4Pattern.test(value) || ipv6Pattern.test(value))) {
        appendErrorMessages($('#ban-error'), 1, (container, flags) => {
          console.log("going to append the error!")
          tryAppendError(container, "Expected a valid ip", flags, 1);
        });
        return;
      }
    }

    const baseUrl = $('[base-url]').attr('base-url');

    $.ajax({
      type: 'POST',
      url: baseUrl + '/api/banned/ban',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({ banEmailOrIp: value }),
      success: () => {
        $('#ban-user-popup').hide();
      },
      error: (res) => {
        processServerErrorResponse(res);
      }
    });
  });
});