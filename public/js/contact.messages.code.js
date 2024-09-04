
$(document).ready(() => {
  createTable('/contact/messages', (tableBody, res) => {
    for (const message of res.messages) {
      tableBody.append(`
        <tr>
            <td scope="row">${message.id}</td>
            <td>${message.firstName} ${message.lastName}</td>
            <td>${message.email}</td>
            <td>${message.message}</td>
        </tr>`);
    }
  });
});