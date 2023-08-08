from django.urls import path

from flights import views

app_name = 'flights'
urlpatterns = [
    path('', views.index, name='flight_homepage'),
    path('<str:flight_number>', views.flight, name='flight_detail'),
]
