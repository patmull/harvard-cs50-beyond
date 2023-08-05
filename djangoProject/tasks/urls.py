from django.urls import path

from tasks import views

urlpatterns = [
    path('', views.index, name='tasks'),
    path('new-task', views.index, name='new_task')
]
