import datetime
import time

from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse

from . import utils
from .models import User, AuctionListing, Category, Bid, AuctionWins, Comment, WatchList
from .utils import get_max_bid_price, get_highest_bid_user


def index(request):

    active_listings = AuctionListing.objects.all()

    if request.user.is_authenticated:
        index_dict = utils.create_auction_dict(request)
        return render(request, "auctions/index.html", index_dict)

    index_dict = utils.create_auction_dict(request)

    return render(request, "auctions/index.html", index_dict)


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
        current_user = request.user

        # Check whether this item exists for the same user
        user_found = User.objects.filter(username=current_user.username).first()
        listing_found = AuctionListing.objects.filter(item_name=item_name, user=user_found).first()

        if listing_found:
            return render(request, 'auctions/new-listing.html',
                          {
                              'error_message': "You have already added the item with the same name",
                              'categories': categories
                          })

        created_at = datetime.datetime.now()
        starting_bid = request.POST['starting_bid']
        image_url = request.POST['image_url']

        category_name = request.POST['category_name']
        category = Category.objects.filter(category_name=category_name).first()

        listing = AuctionListing(item_name=item_name, created_at=created_at, starting_bid=starting_bid,
                                 image_url=image_url, user=current_user, category=category)
        listing.save()

        message_success = "Successfully added a new auction"
        index_dict = utils.create_auction_dict(request, success_message=message_success)

        return render(request, 'auctions/index.html', index_dict)


def new_bid(request, active_listing_id, user_id):
    if request.method == 'POST':
        price = float(request.POST['bid_value'])

        corresponding_active_listing = AuctionListing.objects.filter(id=active_listing_id).first()
        corresponding_user = User.objects.filter(id=user_id).first()

        max_bid_price = get_max_bid_price(listing=corresponding_active_listing)

        if price > corresponding_active_listing.starting_bid and price > max_bid_price:
            new_bid = Bid(price=price, user=corresponding_user)
            new_bid.save()

            corresponding_active_listing.bids.add(new_bid)

            new_auction_winner = AuctionWins(user=corresponding_user, bid=new_bid)
            new_auction_winner.save()
            corresponding_active_listing.auction_winner = new_auction_winner
            corresponding_active_listing.save()

            message_success = "Successfully added a new bid!"

            index_dict = utils.create_auction_dict(request, success_message=message_success)

            request.session['error_message'] = None

            return render(request, 'auctions/index.html', index_dict)
        else:
            error_message = ("Error occurred when adding a new bid! You need to enter higher "
                             "bid than the minimum bid value or higher than the largest bid so far.")
            request.session['error_message'] = error_message

            return HttpResponseRedirect(reverse('index'))

    if request.method == 'GET':
        index_dict = utils.create_auction_dict(request)
        return render(request, 'auctions/index.html', index_dict)


def close_auction(request, active_listing_id):

    active_listing = AuctionListing.objects.get(id=active_listing_id)
    active_listing.active = False
    active_listing.save()

    highest_bid_user = get_highest_bid_user(active_listing)

    auction_win = AuctionWins(auction=active_listing, user=highest_bid_user)
    auction_win.save()

    index_dict = utils.create_auction_dict(request, success_message="Successfully closed an auction.")

    return render(request, 'auctions/index.html', index_dict)


def bought_items(request):

    index_dict = utils.create_auction_dict(request, only_wins=True)
    return render(request, 'auctions/index.html', index_dict)


def listing_detail(request, listing_id):
    particular_listing = AuctionListing.objects.filter(id=listing_id).first()
    print("particular_listing:")
    print(particular_listing)

    comments = Comment.objects.filter(auction_listing=particular_listing)

    return render(request, 'auctions/listing_detail.html', {
        'listing': particular_listing,
        'user': request.user,
        'comments': comments
    })


def add_comment(request, listing_id, user_id):
    text = request.POST.get('text', False)
    found_user = User.objects.filter(id=user_id).first()
    found_listing = AuctionListing.objects.filter(id=listing_id).first()
    new_comment = Comment(text=text, user=found_user, auction_listing=found_listing)
    new_comment.created_at = datetime.datetime.now()
    new_comment.save()

    return HttpResponseRedirect(reverse('listing_detail', args=(listing_id, )))


def add_auction_to_watchlist(request, listing_id, user_id):
    listing_found = AuctionListing.objects.filter(id=listing_id).first()
    user_found = User.objects.filter(id=user_id).first()

    new_watchlist_element = WatchList(user=user_found, auction_listing=listing_found)
    new_watchlist_element.save()

    return HttpResponseRedirect(reverse('index'))


def watchlist(request):
    watchlist_all = WatchList.objects.all()
    return render(request, 'auctions/watchlist.html', {
        'watchlist': watchlist_all
    })


def remove_from_watchlist(request, listing_id):
    watchlist_to_delete = WatchList.objects.filter(auction_listing_id=listing_id).first()
    watchlist_to_delete.delete()

    return HttpResponseRedirect(reverse('watchlist'))
