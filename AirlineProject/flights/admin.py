from django.contrib import admin

from flights.models import Airport, Flight, Passenger


class FlightAdmin(admin.ModelAdmin):
    list_display = ('id', 'flight_number', 'duration', 'origin', 'destination')


class PassengerAdmin(admin.ModelAdmin):
    filter_horizontal = ('flights',)


# Register your models here.
admin.site.register(Airport)
admin.site.register(Flight, FlightAdmin)
admin.site.register(Passenger, PassengerAdmin)
