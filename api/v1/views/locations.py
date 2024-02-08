#!/usr/bin/python3
""" objects that handle all default RestFul API actions for Locations """
from models.state import State
from models.city import City
from models.location import Location
"""from models.user import User"""
from models.car import Car
from models import storage
from api.v1.views import app_views
from flask import abort, jsonify, make_response, request
from flasgger.utils import swag_from


@app_views.route('/cities/<city_id>/locations', methods=['GET'],
                 strict_slashes=False)
@swag_from('documentation/location/get_locations.yml', methods=['GET'])
def get_locations(city_id):
    """
    Retrieves the list of all Location objects of a City
    """
    city = storage.get(City, city_id)

    if not city:
        abort(404)

    locations = [location.to_dict() for location in city.locations]

    return jsonify(locations)


@app_views.route('/locations/<location_id>', methods=['GET'], strict_slashes=False)
@swag_from('documentation/location/get_location.yml', methods=['GET'])
def get_location(location_id):
    """
    Retrieves a Location object
    """
    location = storage.get(Location, location_id)
    if not location:
        abort(404)

    return jsonify(location.to_dict())


@app_views.route('/locations/<location_id>', methods=['DELETE'],
                 strict_slashes=False)
@swag_from('documentation/location/delete_location.yml', methods=['DELETE'])
def delete_location(location_id):
    """
    Deletes a Location Object
    """

    location = storage.get(Location, location_id)

    if not location:
        abort(404)

    storage.delete(location)
    storage.save()

    return make_response(jsonify({}), 200)


@app_views.route('/cities/<city_id>/locations', methods=['POST'],
                 strict_slashes=False)
@swag_from('documentation/location/post_location.yml', methods=['POST'])
def post_location(city_id):
    """
    Creates a Location
    """
    city = storage.get(City, city_id)

    if not city:
        abort(404)
    if not request.get_json():
        abort(400, description="Not a JSON")
    """
    if 'user_id' not in request.get_json():
        abort(400, description="Missing user_id")
    data = request.get_json()
    user = storage.get(User, data['user_id'])
    if not user:
        abort(404)
    """
    if 'name' not in request.get_json():
        abort(400, description="Missing name")
    if 'address' not in request.get_json():
        abort(400, description="Missing address")
    if 'phone_number' not in request.get_json():
        abort(400, description="Missing phone_number")
    data = request.get_json()
    data["city_id"] = city_id
    instance = Location(**data)
    instance.save()
    return make_response(jsonify(instance.to_dict()), 201)


@app_views.route('/locations/<location_id>', methods=['PUT'], strict_slashes=False)
@swag_from('documentation/location/put_location.yml', methods=['PUT'])
def put_location(location_id):
    """
    Updates a Location
    """
    location = storage.get(Location, location_id)

    if not location:
        abort(404)

    data = request.get_json()
    if not data:
        abort(400, description="Not a JSON")

    """    ignore = ['id', 'user_id', 'city_id', 'created_at', 'updated_at']"""
    ignore = ['id', 'city_id', 'created_at', 'updated_at']

    for key, value in data.items():
        if key not in ignore:
            setattr(location, key, value)
    storage.save()
    return make_response(jsonify(location.to_dict()), 200)
