from django.shortcuts import render

from flights.models import Flight


# Create your views here.
def index(request):
    all_flights = Flight.objects.all()
    return render(request, 'flights/index.html',
                  {'flights': all_flights})
