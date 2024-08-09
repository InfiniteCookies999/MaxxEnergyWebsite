const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 40;
const PASSWORD_SPECIAL_CHARACTER_PATTERN = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
const EMAIL_PATTERN = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const EMAIL_EMPTY_FLAG           = 0x01;
const EMAIL_INVALID_PATTERN_FLAG = 0x02;

function getEmailErrorFlags() {
  const email = $('#email-input').val();
  let errorFlags = 0;

  // https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
  if (email.length === 0) {
    errorFlags |= EMAIL_EMPTY_FLAG;
  } else if (!email.toLowerCase().match(EMAIL_PATTERN)) {
    errorFlags |= EMAIL_INVALID_PATTERN_FLAG;
  }

  return errorFlags;
}