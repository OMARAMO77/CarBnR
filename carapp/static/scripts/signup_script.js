$(document).ready(init);
const HOST = '100.25.201.32';

function init() {
    // Add event listener to the form submission
    $('#createAccountForm').submit(function (event) {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Call the createAccount function when the form is submitted
        createAccount();
    });
}

function createAccount() {
    const email = $('#email').val();
    const password = $('#password').val();
    const confirmPassword = $('#confirmPassword').val();
    const firstName = $('#firstname').val();
    const lastName = $('#lastname').val();
    const carId = getParameterByName('carId');

    // Basic form validation
    if (!email || !password || !confirmPassword || !firstName || !lastName) {
        updateStatus('Please fill in all fields.', 'error');
        return false; // Prevent form submission
    }

    if (password !== confirmPassword) {
        updateStatus('Passwords do not match.', 'error');
        return false; // Prevent form submission
    }

    const USERS_URL = `http://${HOST}/api/v1/users/`;
    $.ajax({
        url: USERS_URL,
        type: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({
            first_name: firstName,
            last_name: lastName,
            email: email,
            password: password,
        }),
        success: function (response) {
            // Handle success
            updateStatus('Account created successfully! Redirecting to login page...', 'success');

            // Hide status message and redirect after 3 seconds (adjust the delay as needed)
            setTimeout(function () {
                hideStatus();
                window.location.href = 'login.html?carId=' + encodeURIComponent(carId);
            }, 3000);
        },
        error: function (error) {
            // Handle error
            updateStatus('Error creating account. Please try again.', 'error');

            // Hide status message after 3 seconds (adjust the delay as needed)
            setTimeout(hideStatus, 3000);
        }
    });

    updateStatus('Account creation in progress...', 'info'); // Inform the user that the account creation is in progress
    return false; // Prevent form submission while the AJAX request is being processed
}
