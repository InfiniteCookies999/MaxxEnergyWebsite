
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
  });
});
