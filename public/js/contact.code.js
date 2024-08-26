document.addEventListener("DOMContentLoaded", function () {
    const firstName = document.getElementById('first_name');
    const lastName = document.getElementById('last_name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const message = document.getElementById('message');
    const contactForm = document.getElementById('contact_form');

    const firstNameError = document.getElementById('first_name_error');
    const lastNameError = document.getElementById('last_name_error');
    const emailError = document.getElementById('email_error');
    const phoneError = document.getElementById('phone_error');
    const messageError = document.getElementById('message_error');

    // Error Message Icon
    const errorIcon = '<i class="bx bx-error-alt"></i> ';

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault(); // Prevent the default form submission

        let hasErrors = false;

        // Remove previous error messages
        firstNameError.innerHTML = '';
        lastNameError.innerHTML = '';
        emailError.innerHTML = '';
        phoneError.innerHTML = '';
        messageError.innerHTML = '';

        // Validate First Name
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

        // Validate Last Name
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

        // Validate Email
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

        // Validate Phone Number
        if (phone.value === '' || phone.value == null) {
            phoneError.innerHTML = `${errorIcon}Empty, You must enter a phone number.`;
            hasErrors = true;
        } else {
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(phone.value.replaceAll('-', ''))) {
                phoneError.innerHTML = `${errorIcon}Please enter a valid phone number, only numerical digits allowed (0-9).`;
                hasErrors = true;
            }
        }

        // Validate Message
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

        // If no errors, proceed with AJAX submission
        const formData = {
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim(),
            email: email.value.trim(),
            phone: phone.value.trim(),
            message: message.value.trim(),
        };

       $.ajax({
    type: 'POST',
    url: '/api/contact/submit', 
    data: JSON.stringify(formData),
    contentType: 'application/json',
    success: function(response) {
        firstNameError.innerHTML = '';
        lastNameError.innerHTML = '';
        emailError.innerHTML = '';
        phoneError.innerHTML = '';
        messageError.innerHTML = '';
        

        const successMessage = document.getElementById('success_message');
        successMessage.style.display = 'block';
        
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 8000);
        
        // Clear the form
        contactForm.reset();
    },
    error: function(xhr, status, error) {
        // Handle error response
        console.error("Error submitting the form:", error);
        alert("There was an issue submitting your message. Please try again later.");
    }
});
});
    preventInvalidName($(firstName));
    preventInvalidName($(lastName));
    preventInvalidPhoneInput($(phone));
});
