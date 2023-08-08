from django.urls import path

from users import views

app_name = 'users'
urlpatterns = [
    path('', views.index, name='users_homepage'),
    path('login', views.login_user, name='login'),
    path('logout', views.logout_user, name='logout')
]
