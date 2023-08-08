from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from flights.models import Flight, Passenger


# Create your views here.
def index(request):
    all_flights = Flight.objects.all()
    return render(request, 'flights/index.html',
                  {'flights': all_flights})


def flight(request, flight_number):
    filtered_flight = Flight.objects.filter(flight_number=flight_number).first()
    passengers = Passenger.objects.all()
    return render(request, 'flights/flight-detail.html',
                  {
                      'flight': filtered_flight,
                      'flight_passengers': filtered_flight.passengers.all(),
                      'passengers': passengers
                  })


def book(request, flight_number):
    print("HERE in book method")
    if request.method == "POST":
        passenger_id = request.POST.get('passenger_id')
        passenger_found = Passenger.objects.filter(id=passenger_id).first()
        flight_number = request.POST.get('flight_number')
        flight_found = Flight.objects.filter(flight_number=flight_number).first()
        flight_number = [flight_found.flight_number]

        flight_found.passengers.add(passenger_found)

        return HttpResponseRedirect(reverse('flights:flight_detail', args=flight_number))
