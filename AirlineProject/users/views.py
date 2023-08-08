from django.contrib.auth.models import User
from django.shortcuts import render


# Create your views here.
def index(request):
    users = User.objects.all()
    return render(request, 'users/users.html', {
        'users': users
    })
