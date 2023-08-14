from django.urls import path

from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('wiki/detail/<str:title>', views.title, name="title"),
    path('wiki/search', views.search_encyclopedia, name='search_encyclopedia'),
    path('wiki/new-page', views.new_page, name='new_page'),
    path('wiki/edit-article/<str:title>', views.edit_article, name='edit_article'),
    path('wiki/random-page', views.random_page, name='random_page')
]
