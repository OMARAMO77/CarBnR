#!/usr/bin/python
""" holds class Booking"""
import models
from models.base_model import BaseModel, Base
from os import getenv
import sqlalchemy
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, Integer, DateTime


class Booking(BaseModel, Base):
    """Representation of Booking """
    if models.storage_t == 'db':
        __tablename__ = 'bookings'
        car_id = Column(String(60), ForeignKey('cars.id'), nullable=False)
        user_id = Column(String(60), ForeignKey('users.id'), nullable=False)
        location_id = Column(String(60), ForeignKey('locations.id'),
                             nullable=False)
        price_by_day = Column(Integer, nullable=False, default=0)
        pickup_date = Column(DateTime, default=datetime.utcnow)
        return_date = Column(DateTime, default=datetime.utcnow)
        total_cost = Column(Integer, nullable=False, default=0)
    else:
        car_id = ""
        user_id = ""
        location_id = ""
        price_by_day = 0
        pickup_date = datetime.utcnow()
        return_date = datetime.utcnow()
        total_cost = 0

    def __init__(self, *args, **kwargs):
        """initializes Booking"""
        super().__init__(*args, **kwargs)
