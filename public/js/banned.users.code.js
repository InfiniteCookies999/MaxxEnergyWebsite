
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

  },
  () => {
     
  },
  (searchInput, searchField) => {
    
  });
});