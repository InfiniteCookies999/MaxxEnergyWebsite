const firstName = document.getElementById('first_name');
const lastName = document.getElementById('last_name');
const email = document.getElementById('email');
const phone = document.getElementById('phone');
const message = document.getElementById('message');
const contact_form = document.getElementById('contact_form');

const firstNameError = document.getElementById('first_name_error');
const lastNameError = document.getElementById('last_name_error');
const emailError = document.getElementById('email_error');
const phoneError = document.getElementById('phone_error');
const messageError = document.getElementById('message_error');

// Error Message Icon
const errorIcon = '<i class="bx bx-error-alt"></i> ';

contact_form.addEventListener('submit', (e) => {
    e.preventDefault();
    let hasErrors = false;

    // Remove previous error messages
    firstNameError.innerHTML = '';
    lastNameError.innerHTML = '';
    emailError.innerHTML = '';
    phoneError.innerHTML = '';
    messageError.innerHTML = '';

    // Validate First Name ensuring it's not left blank, and does not include special characters or numbers
    if (firstName.value === '' || firstName.value == null) {
        firstNameError.innerHTML = `${errorIcon}Empty, You must enter a valid first name.`;
        hasErrors = true;
    } else {
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(firstName.value)) {
            firstNameError.innerHTML = `${errorIcon}Error, First name can only contain letters and spaces.`;
            hasErrors = true;
        }
    }

    // Validate Last Name ensuring it's not left blank, and does not include special characters or numbers
    if (lastName.value === '' || lastName.value == null) {
        lastNameError.innerHTML = `${errorIcon}Empty, You must enter a valid last name.`;
        hasErrors = true;
    } else {
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(lastName.value)) {
            lastNameError.innerHTML = `${errorIcon}Error, Last name can only contain letters and spaces.`;
            hasErrors = true;
        }
    }

    // Validate Email to not be empty, to include @, and have no blank space
    if (email.value === '' || email.value == null) {
        emailError.innerHTML = `${errorIcon}Empty, You must enter a valid email.`;
        hasErrors = true;
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.value)) {
            emailError.innerHTML = `${errorIcon}Please enter a valid email address.`;
            hasErrors = true;
        }
    }

    // Validate phone number to not be empty, must only use numbers no letters or special characters
    if (phone.value === '' || phone.value == null) {
        phoneError.innerHTML = `${errorIcon}Empty, You must enter a phone number.`;
        hasErrors = true;
    } else {
        const phoneRegex = /^[0-9]{10,15}$/;
        if (!phoneRegex.test(phone.value)) {
            phoneError.innerHTML = `${errorIcon}Please enter a valid phone number, only numerical digits allowed (0-9).`;
            hasErrors = true;
        }
    }

    // Validate Message to not be empty, must have at least 20 characters and less than 600 characters
    if (message.value === '' || message.value == null) {
        messageError.innerHTML = `${errorIcon}Empty, You must enter a message.`;
        hasErrors = true;
    } else {
        const minLength = 20;
        const maxLength = 600;

        if (message.value.length < minLength) {
            messageError.innerHTML = `${errorIcon}Message must be at least ${minLength} characters long.`;
            hasErrors = true;
        } else if (message.value.length > maxLength) {
            messageError.innerHTML = `${errorIcon}Message must be no more than ${maxLength} characters long.`;
            hasErrors = true;
        }
    }

    // If there are errors, prevent form submission
    if (hasErrors) {
        return;
    }

    // If no errors, perform AJAX submission
    const formData = {
        firstName: firstName.value.trim(),
        lastName: lastName.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        message: message.value.trim(),
    };

    // Disable the submit button to prevent multiple submissions
    document.querySelector('.submit-btn').disabled = true;

    //AJAX
    $.ajax({
        type: 'POST',
        url: '/api/contact/submit', // Update this URL to your actual endpoint
        data: formData,
        success: () => {
            // Display the success message and clear the form
            document.getElementById('success_message').style.display = 'block';
            contact_form.reset();
        },
        error: (res) => {
            const errorMsg = $.parseJSON(res.responseText).message;
            console.error(`Error: ${errorMsg}`);
            // You can display the error message here if needed
        },
        complete: () => {
            // Re-enable the submit button after the request completes
            document.querySelector('.submit-btn').disabled = false;
        }
    });
});
