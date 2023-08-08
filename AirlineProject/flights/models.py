from django.db import models


class Airport(models.Model):
    city = models.CharField(max_length=128)
    street = models.CharField(max_length=128)
    number_of_runways = models.IntegerField()

    def __str__(self):
        return f"City: {self.city}, street: {self.street}, # of runways: {self.number_of_runways}"

# Create your models here.


class Flight(models.Model):
    flight_number = models.CharField(max_length=20)
    duration = models.IntegerField()
    origin = models.ForeignKey(Airport, on_delete=models.CASCADE, related_name='flight_airport_origin')
    destination = models.ForeignKey(Airport, on_delete=models.CASCADE, related_name='flight_airport_destination')

    def __str__(self):
        return (f"Flight number: {self.flight_number}, duration: {self.duration}, origin: {self.origin}"
                f", destination: {self.destination}")


class Passenger(models.Model):
    name = models.CharField(max_length=64)
    flights = models.ManyToManyField(Flight, blank=True, related_name='passengers_flights')

    def __str__(self):
        return f"{ self.name }"
