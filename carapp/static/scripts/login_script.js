$(document).ready(init);
const HOST = '54.236.16.156';

function init() {
    // Add event listener to the form submission
    $('#LogintoAccountForm').submit(function (event) {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Call the LogintoAccount function when the form is submitted
        LogintoAccount();
    });
}

function LogintoAccount() {
    const email = $('#email').val();
    const password = $('#password').val();
    const carId = getParameterByName('carId');

    // Basic form validation
    if (!email || !password) {
        updateStatus('Please fill in all fields.', 'error');
        return false; // Prevent form submission
    }

    const USERS_URL = `http://${HOST}/api/v1/login`;
    $.ajax({
        url: USERS_URL,
        type: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: JSON.stringify({
            email: email,
            password: password,
        }),
        success: function (response) {
            // Handle success
            updateStatus('Logged in successfully! Redirecting to booking page...', 'success');

            // Hide status message and redirect after 3 seconds (adjust the delay as needed)
            setTimeout(function () {
                hideStatus();
                window.location.href = 'booking-page.html?carId=' + encodeURIComponent(carId) + '&userId=' + response.userId;
            }, 3000);
        },
        error: function (error) {
            // Handle error
            updateStatus('Invalid credentials. Please try again.', 'error');

            // Hide status message after 3 seconds (adjust the delay as needed)
            setTimeout(hideStatus, 10000);
        }
    });

    updateStatus('In progress...', 'info'); // Inform the user that the account creation is in progress
    return false; // Prevent form submission while the AJAX request is being processed
}

function updateStatus(message, status) {
    const statusElement = $('#status');
    statusElement.html(message);
    statusElement.attr('class', 'status-' + status);
}

function hideStatus() {
    const statusElement = $('#status');
    statusElement.html('');
}

 // Function to parse URL parameters
const getParameterByName = (name, url) => {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
};
