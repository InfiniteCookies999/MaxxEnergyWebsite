const fullname = document.getElementById('fullname');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const message = document.getElementById('message');
const contact_form = document.getElementById('contact_form');

const fullnameError = document.getElementById('fullname_error');
const emailError = document.getElementById('email_error');
const phoneError = document.getElementById('phone_error');
const messageError = document.getElementById('message_error');

contact_form.addEventListener('submit', (e) => {
    let hasErrors = false;

    // Clear previous error messages
    fullnameError.innerHTML = '';
    emailError.innerHTML = '';
    phoneError.innerHTML = '';
    messageError.innerHTML = '';

    const errorIcon = '<i class="bx bx-error-alt"></i> ';

    // Validate Full Name
    if (fullname.value === '' || fullname.value == null) {
        fullnameError.innerHTML = `${errorIcon}You must enter a valid name.`;
        hasErrors = true;
    }

    // Validate Email
    if (email.value === '' || email.value == null) {
        emailError.innerHTML = `${errorIcon}You must enter a valid email.`;
        hasErrors = true;
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            emailError.innerHTML = `${errorIcon}Please enter a valid email address.`;
            hasErrors = true;
        }
    }

    // Validate Phone (optional, but if provided, should be in a valid format)
    if (phone.value === '' || phone.value == null) {
        phoneError.innerHTML = `${errorIcon}You must enter a phone number.`;
        hasErrors = true;
    } else {
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(phone.value)) {
            phoneError.innerHTML = `${errorIcon}Please enter a valid phone number.`;
            hasErrors = true;
        }
    }

    // Validate Message
    if (message.value === '' || message.value == null) {
        messageError.innerHTML = `${errorIcon}You must enter a message.`;
        hasErrors = true;
    }

    // If there are errors, prevent form submission
    if (hasErrors) {
        e.preventDefault();
    }
});
