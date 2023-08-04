from django.urls import path

from . import views

urlpatterns = [
    # /hello
    path("", views.index, name="index"),
    # /hello/brian
    path("brian", views.brian, name="brian"),

    # Better: using parameter
    path("greet/<str:name>", views.greet, name="greet"),
    path("greet-better/<str:name>", views.greet_better, name="greet_better"),
    path("greet-even-better/<str:name>", views.greet_even_better, name="greet_even_better"),
    path('isitchristmas', views.is_christmas, name="is_christmas")
]
