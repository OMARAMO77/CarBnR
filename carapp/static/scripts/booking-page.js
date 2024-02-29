const getParameterByName = (name, url) => {
	if (!url) url = window.location.href;
	name = name.replace(/[\[\]]/g, "\\$&");
	const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
		results = regex.exec(url);
	if (!results) return null;
	if (!results[2]) return '';
	return decodeURIComponent(results[2].replace(/\+/g, " "));
};

// Get car information from URL parameters
const carId = getParameterByName('carId');
const user_id = getParameterByName('userId');

$(document).ready(function() {
    const HOST = '54.236.16.156';
    const carApiUrl = `http://${HOST}/api/v1/cars/${carId}`;

    // Mocking the API call as an asynchronous operation
    $.ajax({
        url: carApiUrl,
        method: "GET",
        success: function(data) {
            const price_by_day = data.price_by_day;
            const location_id = data.location_id;
            const brand = data.brand;
            const model = data.model;
            const year = data.year;
            const car_type = brand + ' ' + model + ' ' + year;
            const locationApiUrl = `http://${HOST}/api/v1/locations/${location_id}`;
            // Function to calculate the total cost
            $("#pickup_date, #return_date").on('input', function() {
                const pickup_date = $("#pickup_date").val();
                const return_date = $("#return_date").val();

                // Check if pickup_date is greater than today's date
                if (!pickup_date || !return_date) {
                    updateStatus('Please enter both dates.', 'error');
                    setTimeout(hideStatus, 3000);
                    return;
                }

                if (pickup_date <= new Date()) {
                    updateStatus('Pickup date must be greater than today\'s date.', 'error');
                    setTimeout(hideStatus, 3000);
                    return;
                }

                // Check if return_date is greater than pickup_date
                if (return_date <= pickup_date) {
                    updateStatus('Return date must be greater than pickup date.', 'error');
                    setTimeout(hideStatus, 3000);
                    return;
                }
                const daysBetween = calculateDaysBetween(new Date(pickup_date), new Date(return_date));
                const total_cost = price_by_day * daysBetween;
                $("#daysNumber").val(daysBetween);
                $("#total_cost").val("$" + total_cost.toFixed(2));
            });
            function calculateDaysBetween(pickup_date, return_date) {
                const oneDay = 24 * 60 * 60 * 1000;
                const diffDays = Math.ceil(Math.abs((pickup_date - return_date) / oneDay));
                return diffDays;
            }

            // Update other fields
            $("#price_by_day").val("$" + price_by_day.toFixed(2));
            $("#car_type").val(car_type);

            // Update the car image
            $("#carImage").attr("src", data.image_url.replace(/ /g, '_'));

            $.ajax({
                url: locationApiUrl,
                method: 'GET',
                success: function (data) {
                    // Handle successful nested response
                    const locationName = data.name;
                    const locationAddress = data.address;
                    $("#locationName").val(locationName);
                    $("#locationAddress").val(locationAddress);
                },
                error: function (Error) {
                    // Handle nested error
                    updateStatus('Error fetching location details:', 'error');
                    setTimeout(hideStatus, 3000);
                }
            });
            // Add click event for the Confirm Booking button
            $("#confirmBookingBtn").on("click", function() {
                const bookingApiUrl = `http://${HOST}/api/v1/cars/${carId}/bookings`;
                const total_cost = $("#total_cost").val().split("$")[1].split(".")[0];
                const price_by_day = $("#price_by_day").val().split("$")[1].split(".")[0];
                const return_date = $("#return_date").val();
                const pickup_date = $("#pickup_date").val();

                if (!pickup_date || !return_date) {
                    updateStatus('Please enter both dates.', 'error');
                    setTimeout(hideStatus, 3000);
                    return;
                }

                const bookingData = {
                    total_cost: total_cost,
                    return_date: return_date,
                    pickup_date: pickup_date,
                    price_by_day: price_by_day,
                    carId: carId,
                    user_id: user_id,
                    location_id: location_id
                };

                // Mocking the API call for booking submission
                $.ajax({
                    url: bookingApiUrl,
                    method: "POST",
                    contentType: "application/json",
                    data: JSON.stringify(bookingData),
                    success: function(response) {
                        updateStatus('Booking confirmed! <br>your booking id: ' + response.bookingId, 'success');
                        setTimeout(hideStatus, 8000);
                    },
                    error: function(error) {
                        updateStatus('Error confirming booking:', 'error');
                        setTimeout(hideStatus, 3000);
                    }
                });
            });
        },
        error: function(error) {
            updateStatus('Error fetching car details:', 'error');
            setTimeout(hideStatus, 3000);
        }
    });

    // Set min attribute for pickup_date to ensure it's greater than or equal to today
    $("#pickup_date").attr("min", new Date().toISOString().split("T")[0]);

    // Set min attribute for return_date to ensure it's greater than pickup_date
    $("#pickup_date").on("change", function() {
        $("#return_date").attr("min", $(this).val());
    });
});


function updateStatus(message, status) {
    const statusElement = $('#status');
    statusElement.html(message);
    statusElement.attr('class', 'status-' + status);
}

function hideStatus() {
    const statusElement = $('#status');
    statusElement.html('');
}
