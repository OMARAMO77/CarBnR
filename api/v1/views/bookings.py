#!/usr/bin/python3
""" objects that handles all default RestFul API actions for bookings """
from models.booking import Booking
from models.car import Car
from models.user import User
from models import storage
from api.v1.views import app_views
from flask import abort, jsonify, make_response, request
from flasgger.utils import swag_from


@app_views.route('/cars/<car_id>/bookings', methods=['GET'],
                 strict_slashes=False)
@swag_from('documentation/booking/bookings_by_car.yml', methods=['GET'])
def get_car_bookings(car_id):
    """
    Retrieves the list of all bookings objects
    of a specific Car, or a specific booking
    """
    list_bookings = []
    car = storage.get(Car, car_id)
    if not car:
        abort(404)
    for booking in car.bookings:
        list_bookings.append(booking.to_dict())

    return jsonify(list_bookings)


@app_views.route('/users/<user_id>/bookings', methods=['GET'],
                 strict_slashes=False)
@swag_from('documentation/booking/bookings_by_user.yml', methods=['GET'])
def get_user_bookings(user_id):
    """
    Retrieves the list of all bookings objects
    of a specific User, or a specific booking
    """
    list_bookings = []
    user = storage.get(User, user_id)
    if not user:
        abort(404)
    for booking in user.bookings:
        list_bookings.append(booking.to_dict())

    return jsonify(list_bookings)


@app_views.route('/bookings/<booking_id>/', methods=['GET'], strict_slashes=False)
@swag_from('documentation/booking/get_booking.yml', methods=['GET'])
def get_booking(booking_id):
    """
    Retrieves a specific booking based on id
    """
    booking = storage.get(Booking, booking_id)
    if not booking:
        abort(404)
    return jsonify(booking.to_dict())


@app_views.route('/bookings/<booking_id>', methods=['DELETE'], strict_slashes=False)
@swag_from('documentation/booking/delete_booking.yml', methods=['DELETE'])
def delete_booking(booking_id):
    """
    Deletes a booking based on id provided
    """
    booking = storage.get(Booking, booking_id)

    if not booking:
        abort(404)
    storage.delete(booking)
    storage.save()

    return make_response(jsonify({}), 200)


@app_views.route('/cars/<car_id>/bookings', methods=['POST'],
                 strict_slashes=False)
@swag_from('documentation/booking/post_booking.yml', methods=['POST'])
def post_booking(car_id):
    """
    Creates a Booking
    """
    car = storage.get(Car, car_id)
    if not car:
        abort(404)
    if not request.get_json():
        abort(400, description="Not a JSON")
    if 'user_id' not in request.get_json():
        abort(400, description="Missing user_id")
    data = request.get_json()
    user = storage.get(User, data['user_id'])
    if not user:
        abort(404)
    if 'location_id' not in request.get_json():
        abort(400, description="Missing location_id")
    if 'price_by_day' not in request.get_json():
        abort(400, description="Missing price_by_day")
    if 'pickup_date' not in request.get_json():
        abort(400, description="Missing pickup_date")
    if 'return_date' not in request.get_json():
        abort(400, description="Missing return_date")
    if 'total_cost' not in request.get_json():
        abort(400, description="Missing total_cost")

    data['car_id'] = car_id
    instance = Booking(**data)
    instance.save()
    return make_response(jsonify({'bookingId': instance.id}), 201)


@app_views.route('/bookings/<booking_id>', methods=['PUT'], strict_slashes=False)
@swag_from('documentation/booking/put_booking.yml', methods=['PUT'])
def put_booking(booking_id):
    """
    Updates a Booking
    """
    booking = storage.get(Booking, booking_id)
    if not booking:
        abort(404)

    if not request.get_json():
        abort(400, description="Not a JSON")

    ignore = ['id', 'car_id', 'created_at', 'updated_at']

    data = request.get_json()
    for key, value in data.items():
        if key not in ignore:
            setattr(booking, key, value)
    storage.save()
    return make_response(jsonify(booking.to_dict()), 200)
