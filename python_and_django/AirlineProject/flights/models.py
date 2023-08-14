from django.db import models


class Airport(models.Model):
    city = models.CharField(max_length=128)
    airport_name = models.CharField(max_length=128)
    number_of_runways = models.IntegerField()

    def __str__(self):
        return f"City: {self.city}, name: {self.airport_name}, # of runways: {self.number_of_runways}"

# Create your models here.


class Flight(models.Model):
    flight_number = models.CharField(max_length=20)
    duration = models.IntegerField()
    origin = models.ForeignKey(Airport, on_delete=models.CASCADE, related_name='flight_airport_origin')
    destination = models.ForeignKey(Airport, on_delete=models.CASCADE, related_name='flight_airport_destination')

    def __str__(self):
        return (f"Flight number: {self.flight_number}, origin: {self.origin.city}, {self.origin.airport_name}"
                f", destination: {self.destination.city}, {self.origin.airport_name}")


class Passenger(models.Model):
    first_name = models.CharField(max_length=64)
    last_name = models.CharField(max_length=64, default="")
    flights = models.ManyToManyField(Flight, blank=True, related_name='passengers')

    def __str__(self):
        return f"{ self.first_name } { self.last_name }"
