from datetime import datetime

from django.http import HttpResponse
from django.shortcuts import render


# Create your views here.
def index(request):
    return HttpResponse("Hello, world!")


def brian(request):
    return HttpResponse("Hello, Brian!")


def greet(request, name):
    return HttpResponse(f"Hello, {name.capitalize()}!")


def greet_better(request, name):
    return HttpResponse(f"<h1>Hello, {name.capitalize()}!</h1>")


def greet_even_better(request, name):
    # This list may be viewed in the /tasks URL and holds the value until app is restarted,
    # however here the values are nto stored anymore. We need something better: session or database
    sample_list = request.session.get('list_of_shopping_items')
    print("sample_list:")
    print(sample_list)
    # FLASK: return render_template('templates/greet.html', name=name.capitalize())
    # Django:
    return render(request, 'greet.html', {
        "name": name.capitalize(),
        "sample_list": sample_list,
    })


def is_christmas(request):
    date = datetime.now()
    is_it_christmas_returned_value = False
    if 23 < date.day < 27 and date.month == 12:
        is_it_christmas_returned_value = True
    else:
        is_it_christmas_returned_value = False

    return render(request, 'hello/is-it-christmas.html', {
        "is_christmas_now": is_it_christmas_returned_value
    })
