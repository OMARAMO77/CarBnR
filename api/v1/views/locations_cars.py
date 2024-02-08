#!/usr/bin/python3
""" objects that handle all default RestFul API actions for Cars """
from models.car import Car
from models.location import Location
from models.state import State
from models.city import City
from models import storage
from api.v1.views import app_views
from flask import abort, jsonify, make_response, request
from flasgger.utils import swag_from


@app_views.route('/locations/<location_id>/cars', methods=['GET'],
                 strict_slashes=False)
@swag_from('documentation/cars/get_location_cars.yml', methods=['GET'])
def get_location_cars(location_id):
    """
    Retrieves the list of all Car objects of a Location
    """
    location = storage.get(Location, location_id)

    if not location:
        abort(404)

    cars = [car.to_dict() for car in location.cars]

    return jsonify(cars)



@app_views.route('/cars_search', methods=['POST'], strict_slashes=False)
@swag_from('documentation/car/post_search.yml', methods=['POST'])
def locations_search():
    """
    Retrieves all Car objects depending of the JSON in the body
    of the request
    """

    if request.get_json() is None:
        abort(400, description="Not a JSON")

    data = request.get_json()

    if data and len(data):
        states = data.get('states', None)
        cities = data.get('cities', None)
        locations = data.get('locations', None)

    if not data or not len(data) or (
            not states and
            not cities and
            not locations):
        cars = storage.all(Car).values()
        list_cars = []
        for car in cars:
            list_cars.append(car.to_dict())
        return jsonify(list_cars)

    list_cars = []
    if states:
        states_obj = [storage.get(State, s_id) for s_id in states]
        for state in states_obj:
            if state:
                for city in state.cities:
                    if city:
                        for location in city.locations:
                            if location:
                                for car in location.cars:
                                    list_cars.append(car)

    if cities:
        city_obj = [storage.get(City, c_id) for c_id in cities]
        for city in city_obj:
            if city:
                for location in city.locations:
                    if location:
                        for car in location.cars:
                            if car not in list_cars:
                                list_cars.append(car)

    if locations:
        locations_obj = [storage.get(Location, l_id) for l_id in locations]
        for location in locations_obj:
            if location:
                for car in location.cars:
                    if car not in list_cars:
                        list_cars.append(car)

    cars = []
    for car in list_cars:
        d = car.to_dict()
        d.pop('cars', None)
        cars.append(d)

    return jsonify(cars)
