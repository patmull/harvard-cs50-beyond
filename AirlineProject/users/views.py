from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse


# Create your views here.
def index(request):
    users = User.objects.all()

    if request.user.is_authenticated:
        logged_user = request.user
        user_info = {'username': logged_user.username, 'email': logged_user.email}

        return render(request, 'users/users.html', {
            'users': users,
            'user_info': user_info
        })

    return render(request, 'users/users.html', {
        'users': users
    })


def login_user(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse('users:users_homepage'))
        else:
            return render(request, "users/login.html", {
                'error_message': "Username or password does not match"
            })

    if request.method == "GET":
        return render(request, "users/login.html")


def logout_user(request):
    logout(request)
    return render(request, "users/login.html",
                  {'logout_message': "Successfully logged out! See you next time :-)"})
