const bookingId = getParameterByName('bookingId');
const user_id = getParameterByName('userId');
const HOST = '100.25.201.32';
function getBookingDetails(bookingId, renderTarget, renderMethod) {
    const bookingApiUrl = `http://${HOST}/api/v1/bookings/${bookingId}`;

    $.ajax({
        url: bookingApiUrl,
        method: 'GET',
        success: function (data) {
            const id = data.id;
            const car_id = data.car_id;
            const pickup_date = data.pickup_date;
            const return_date = data.return_date;
            const total_cost = data.total_cost.toFixed(2);

            const carApiUrl = `http://${HOST}/api/v1/cars/${car_id}`;
            $.ajax({
                url: carApiUrl,
                method: "GET",
                success: function (data) {
                    const price_by_day = data.price_by_day.toFixed(2);
                    const image_url = data.image_url.replace(/ /g, '_');
                    const location_id = data.location_id;
                    const brand = data.brand;
                    const model = data.model;
                    const year = data.year;
                    const car_type = brand + ' ' + model + ' ' + year;

                    const locationApiUrl = `http://${HOST}/api/v1/locations/${location_id}`;
                    $.ajax({
                        url: locationApiUrl,
                        method: "GET",
                        success: function (data) {
                            const locationName = data.name;
                            const locationAddress = data.address;

                            const bookingDetailsHtml1 = `
                                  <div class="carInfoDiv">
                                    <h2>Booking Details:</h2>
                                    <p><b>Car Type:</b> ${car_type}</p>
                                    <p><b>Price By Day:</b> $${price_by_day}</p>
                                    <p><b>Location:</b> ${locationName}</p>
                                    <p><b>Address:</b> ${locationAddress}</p>
                                    <p><b>Pickup Date:</b> ${pickup_date}</p>
                                    <p><b>Return Date:</b> ${return_date}</p>
                                    <p><b>Total Cost:</b> $${total_cost}</p>
                                  </div>
                                  <div class="carImageDiv">
                                    <h2>Car Image:</h2>
                                    <div>
                                      <img id="carImage" src="${image_url}" alt="Car Image">
                                    </div>
                                  </div>
                            `;
                            const bookingDetailsHtml2 = `
                                <div class="booking-details">
                                  ${bookingDetailsHtml1}
                                </div>
                            `;
                            if (renderMethod === 'append') {
                                renderTarget.append(bookingDetailsHtml2);
                            } else if (renderMethod === 'html') {
                                renderTarget.html(bookingDetailsHtml1);
                            } else {
                                console.error("Invalid renderMethod specified. Use 'append' or 'html'.");
                            }
                        },
                        error: function (error) {
                            console.error("Error fetching location details:", error);
                        }
                    });
                },
                error: function (error) {
                    console.error("Error fetching car details:", error);
                }
            });
        },
        error: function (error) {
            console.error("Error fetching booking details:", error);
        }
    });
}

$(document).ready(function() {
    const HOST = '100.25.201.32';
    const userBookingsApiUrl = `http://${HOST}/api/v1/users/${user_id}/bookings`;

    // Fetch and display specific booking information
    getBookingDetails(bookingId, $(".booking-details"), 'html');
    // Fetch and display all user bookings
    $.ajax({
        url: userBookingsApiUrl,
        method: 'GET',
        success: function (userBookings) {
            for (const booking of userBookings) {
                const bookingId = booking.id;
                getBookingDetails(bookingId, $(".user-bookings"), 'append');
            }
        },
        error: function (error) {
            console.error("Error fetching user bookings:", error);
        }
    });
});
