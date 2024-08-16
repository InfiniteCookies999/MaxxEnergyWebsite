$(document).ready(function() {

  const addressData = $('#address-span').attr("address-data").split(":");
  const userState = addressData[3];
  const userCounty = addressData[2].replaceAll(" ", "-");
  addStatesAndCounties($('#state-input'), $('#county-input'), userState, userCounty);

  $('#state-input').on('change', () => {
    const state = $(this).find("option:selected").val();
    setCounties($('#county-input'), state, "");
  });

  // Turn the edit box on if the user clicks the edit button.
  $('.edit-icon').each((_, editIcon) => {
    $(editIcon).on('click', () => {
      const row = $(editIcon).closest('tr');
      const editField = row.find('.editable-field');
      const staticField = row.find('.static-field');

      if (staticField.attr('id') === 'password-span') {
        editField.val("");
      }

      staticField.css("display", "none");
      row.find('.editable-field').css("display", "block");
      row.find('.edit-icon').css("display", "none");
      row.find('.save-icon').css("display", "inline");
      row.find('.select-with-search').css("display", "block");
    });
  });

  // Turn the edit box off if the user clicks the edit button and save.
  $('.save-icon').each((_, saveIcon) => {
    $(saveIcon).on('click', () => {
      const row = $(saveIcon).closest('tr');
      const editField = row.find('.editable-field');
      const staticField = row.find('.static-field');
      // TODO: Will need to validate.
    
      if (staticField.attr('id') === 'address-span') {
        const addressLine1 = $('#address-line1-input').val();
        const addressLine2 = $('#address-line2-input').val();
        const county = $('#county-input').find(":selected").val().replaceAll("-", " ");
        const state = $('#state-input').find(":selected").val();
        const zipCode = $('#zip-code-input').val();
        const space = addressLine2 !== "" ? " " : "";
        staticField.text(`${addressLine1}${space}${addressLine2} ${county} ${state}, ${zipCode}`);
      } else if (staticField.attr('id') !== 'password-span') {
        staticField.text(editField.val());
      }
      
      staticField.css("display", "block");
      editField.css("display", "none");
      row.find('.edit-icon').css("display", "inline");
      row.find('.save-icon').css("display", "none");
      row.find('.select-with-search').css("display", "none");
    });
  });
});