// Get car information from URL parameters
const carId = getParameterByName('carId');
const user_id = getParameterByName('userId');
function isValidDate(dateString) {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
    }

$(document).ready(function() {
    const HOST = '100.25.201.32';
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

                const daysBetween = calculateDaysBetween(new Date(pickup_date), new Date(return_date));
                const total_cost = price_by_day * daysBetween;

                if (daysBetween) {
                    $("#total_cost").val("$" + total_cost.toFixed(2));
                    $("#daysNumber").val(daysBetween);
                } else {
                    $("#total_cost").val("$0.00");
                    $("#daysNumber").val("-");
                }
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
                const return_date = $("#return_date").val();
                const pickup_date = $("#pickup_date").val();
                const dateTime = $("#dateTime").val();

                if (!pickup_date) {
                    updateStatus('Please enter pickup date.', 'error');
                    setTimeout(hideStatus, 3000);
                    return;
                } else if (!return_date) {
                    updateStatus('Please enter return date.', 'error');
                    setTimeout(hideStatus, 3000);
                    return;
                } else if (!dateTime) {
                    updateStatus('Please enter pickup time.', 'error');
                    setTimeout(hideStatus, 3000);
                    return;
                }

                const dateTime1 = new Date(pickup_date + "T" + dateTime + ":00").toISOString();
                const dateTime2 = new Date(return_date + "T" + dateTime + ":00").toISOString();

                if (!isValidDate(dateTime1) || !isValidDate(dateTime2)) {
                  alert('Invalid date or time format.');
                  return;
                }
                const total_cost = $("#total_cost").val().split("$")[1].split(".")[0];
                const price_by_day = $("#price_by_day").val().split("$")[1].split(".")[0];
                const bookingData = {
                    total_cost: total_cost,
                    return_date: dateTime2.split(".000Z")[0],
                    pickup_date: dateTime1.split(".000Z")[0],
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
                        updateStatus('Booking confirmed! <br>your booking id: <br>' + response.bookingId, 'success');
                        setTimeout(function () {
                            hideStatus();
                            window.location.href = 'user_bookings.html?userId=' + encodeURIComponent(user_id) + '&bookingId=' + response.bookingId;
                        }, 3000);
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
