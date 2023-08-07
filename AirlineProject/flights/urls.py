from django.urls import path

from flights import views

app_name = 'flights'
urlpatterns = [
    path('', views.index)
]
