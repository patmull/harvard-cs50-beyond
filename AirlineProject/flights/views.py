from django.shortcuts import render

from flights.models import Flight


# Create your views here.
def index(request):
    all_flights = Flight.objects.all()
    return render(request, 'flights/index.html',
                  {'flights': all_flights})


def flight(request, flight_number):
    filtered_flight = Flight.objects.filter(flight_number=flight_number).first()
    return render(request, 'flights/flight-detail.html',
                  {
                      'flight': filtered_flight,
                      'passengers': filtered_flight.passengers.all()
                  })
