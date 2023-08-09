import datetime
import time

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from .models import User, AuctionListing, Category


def index(request):

    return render(request, "auctions/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "auctions/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "auctions/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "auctions/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "auctions/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "auctions/register.html")


def new_listing(request):
    categories = Category.objects.all()
    if request.method == "GET":
        return render(request, 'auctions/new-listing.html', {
            'categories': categories
        })

    if request.method == "POST":
        item_name = request.POST['item_name']
        created_at = datetime.datetime.now()
        starting_bid = request.POST['starting_bid']
        image_url = request.POST['image_url']

        current_user = request.user

        category_name = request.POST['category_name']
        category = Category.objects.filter(category_name=category_name).first()

        listing = AuctionListing(item_name=item_name, created_at=created_at, starting_bid=starting_bid,
                                 image_url=image_url, user=current_user, category=category)
        listing.save()

        listings = AuctionListing.objects.all()
        return render(request, 'auctions/index.html', {
            'active_listings': listings,
            'message_success': "Successfully added new auction"
        })
