from django.urls import path

from . import views

urlpatterns = [
    # /hello
    path("", views.index, name="index"),
    # /hello/brian
    path("brian", views.brian, name="brian"),

    # Better: using parameter
    path("greet/<str:name>", views.greet, name="greet")
]
