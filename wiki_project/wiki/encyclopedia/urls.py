from django.urls import path, include

import encyclopedia.util
from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('wiki/<str:title>', views.title, name="title"),
    path('search', views.search_encyclopedia, name='search_encyclopedia')
]
