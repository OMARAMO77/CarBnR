$(document).ready(init);
const HOST = '100.25.201.32';
const locationObj = {};
const stateObj = {};
const cityObj = {};
let obj = {};

function init () {
  $('.companies .popover input').change(function () {
    obj = locationObj;
    checkedObjects.call(this, 1);
  });
  $('.state_input').change(function () {
    obj = stateObj;
    checkedObjects.call(this, 2);
  });
  $('.city_input').change(function () {
    obj = cityObj;
    checkedObjects.call(this, 3);
  });
// Call the searchCars and apiStatus functions when the document is ready

  apiStatus();
  searchCars();
}

function checkedObjects (nObject) {
  if ($(this).is(':checked')) {
    obj[$(this).attr('data-name')] = $(this).attr('data-id');
  } else if ($(this).is(':not(:checked)')) {
    delete obj[$(this).attr('data-name')];
  }
  const names = Object.keys(obj);
  if (nObject === 1) {
    $('.companies h4').text(names.sort().join(', '));
  } else if (nObject === 2) {
    $('.locations h4').text(names.sort().join(', '));
  }
}

function apiStatus () {
  const API_URL = `http://${HOST}/api/v1/status/`;
  $.get(API_URL, (data, textStatus) => {
    if (textStatus === 'success' && data.status === 'OK') {
      $('#api_status').addClass('available');
    } else {
      $('#api_status').removeClass('available');
    }
  });
}

function searchCars() {
  const CARS_URL = `http://${HOST}/api/v1/cars_search/`;
  $.ajax({
    url: CARS_URL,
    type: 'POST',
    headers: { 'Content-Type': 'application/json' },
    data: JSON.stringify({
      locations: Object.values(locationObj),
      states: Object.values(stateObj),
      cities: Object.values(cityObj)
    }),
    success: function (response) {
      $('SECTION.cars').empty();
      for (const car of response) {
        const availabilityText = car.available ? `<b>Available: $${car.price_by_day} a day</b>` : `<b>Not Available</b>`;
        const article = [
          '<article data-car-id="' + car.id + '">', // car.id is a unique identifier
          '<div class="title_box">',
          '<div class="image-container">',
          `<img src="${car.image_url.replace(/ /g, '_')}" alt="Image">`,
          '</div>',
          '</div>',
          '<div class="box1">',
          '<div class="car_type">',
          `<b>Car Type: ${car.brand} ${car.model} ${car.year}</b>`,
          '</div>',
          '<div class="available">',
          availabilityText,
          '</div>',
          '<div class="car_type">',
          `<a href="#" class="button">Book Now</a>`,
          '</div>',
          '</div>',
          '</article>'
        ];
        $('SECTION.cars').append(article.join(''));
      }
    },
    error: function (error) {
      console.error(error);
    }
  });

  // Add an event listener for the "Book Now" button click using event delegation
  $('SECTION.cars').on('click', 'a.button', function(event) {
    // Prevent the default behavior of the link
    event.preventDefault();

    // Retrieve the car ID from the data attribute
    const carId = $(this).closest('article').data('car-id');

    // Redirect to the signup page with the carId in the URL
    window.location.href = `/signup.html?carId=${carId}`;
  });
}
