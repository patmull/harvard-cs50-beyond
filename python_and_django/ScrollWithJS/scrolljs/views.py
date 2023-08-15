from django.http import JsonResponse
from django.shortcuts import render

DEFAULT_N = 10


# Create your views here.
def posts(request):
    start = int(request.GET['start'] or 0)
    end = int(request.GET['end'] or start + DEFAULT_N-1)

    list_of_posts = []
    for i in range(start, end):
        list_of_posts.append(f"Post #{i}")

    return JsonResponse({
        "posts": list_of_posts
    })


def index(request):

    return render(request, 'scrolljs/indexjs.html')
