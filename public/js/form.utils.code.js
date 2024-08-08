
/**
 * If the errorFlags contains the given flag then appened an error span
 * to the error container.
 * 
 * @param {*} errContainer The div containing the error messages.
 * @param {string} errMsg The message to optionally append.
 * @param {number} errorFlags The current known error flags.
 * @param {number} flag The flag to check against.
 */
function tryAppendError(errContainer, errMsg, errorFlags, flag) {
  if ((errorFlags & flag) === 0) { 
    return; 
  }
  // TODO: Although the box icon seems to display correctly it display a warning message in console.
  const errSpan = $(`<span><i class="bx bx-error-alt"></i> ${errMsg}. </span>`);
  errSpan.data("flag", flag);
  errContainer.append(errSpan);
}

/**
 * Checks to see if due to the new value of the input one or more
 * of the previously existing errors may no longer apply.
 * 
 * If it does not apply anymore then it is removed from the errContainer.
 * 
 * @param {*} errContainer The div containing the error messages.
 * @param {*} input The input that has updated and may no longer have
 *                  errors.
 * @param {*} getFlagCB The callback for obtaining the errors given the new
 *                      state of the input. 
 */
function checkForChangeInErrors(errContainer, input, getFlagCB) {
  input.on("input", () => {
    const errorFlags = errContainer.data("errorFlags");
    if (errorFlags !== undefined && errorFlags !== 0) {
      // Updatting the errors.
      const newErrorFlags = getFlagCB();

      errContainer.data("errorFlags", newErrorFlags);
      // Remove any children for the missing errors.
      for (errSpan of errContainer.children()) {
        if ((newErrorFlags & $(errSpan).data("flag")) === 0) {
          errSpan.remove();
        }
      }

      if (newErrorFlags === 0) {
        input.removeClass("is-invalid");
      }
    }
  });
}