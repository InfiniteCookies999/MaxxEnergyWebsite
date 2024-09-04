
$(document).ready(() => {
  createTable('/user/users', (tableBody, res) => {
    for (const user of res.users) {
      tableBody.append(`
        <tr>
            <td scope="row">${user.id}</td>
            <td>${user.firstName} ${user.lastName}</td>
            <td>${user.email}</td>
            <td>${user.phone}</td>
            <td>${user.addressLine1} ${user.addressLine2} ${user.county} ${user.state}, ${user.zipCode}</td>
        </tr>`);
    }
  });
});