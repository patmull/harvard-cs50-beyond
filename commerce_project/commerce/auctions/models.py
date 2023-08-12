import datetime

from django.contrib.auth.models import AbstractUser
from django.db import models

from auctions.constants import DEFAULT_LENGTH_OF_AUCTION


class User(AbstractUser):
    pass

    def __str__(self):
        return f"{self.username}"


class Category(models.Model):
    category_name = models.CharField(max_length=128)

    def __str__(self):
        return f"{self.category_name}"


class Bid(models.Model):
    price = models.IntegerField()
    user = models.ForeignKey(User, on_delete=models.CASCADE)


class AuctionListing(models.Model):
    item_name = models.CharField(max_length=128)
    created_at = models.DateTimeField()
    closing_on = models.DateTimeField(default=datetime.datetime.now()
                                              + datetime.timedelta(
        days=DEFAULT_LENGTH_OF_AUCTION['day'] + 30 * DEFAULT_LENGTH_OF_AUCTION['month']
    ))
    starting_bid = models.FloatField()
    image_url = models.CharField(max_length=512, blank=True)
    active = models.BooleanField(default=False)
    user = models.ForeignKey(User, related_name='users_auction_listing', on_delete=models.CASCADE)
    category = models.ForeignKey(Category, related_name='category', on_delete=models.CASCADE)
    bids = models.ManyToManyField(Bid, related_name="bids")

    def __str__(self):
        return (f"Name: {self.item_name}, Created at: {self.created_at}, Starting bid: {self.starting_bid}, "
                f"'Posted by User: {self.user}")


class AuctionWins(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    auction = models.OneToOneField(AuctionListing, related_name='auction', on_delete=models.CASCADE,
                                   default=None, blank=True, null=True)


class Comment(models.Model):
    text = models.CharField(max_length=512)
    created_at = models.DateTimeField()
    auction_listing = models.ForeignKey(AuctionListing, related_name='auction_listing', on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='user', on_delete=models.CASCADE)


class WatchList(models.Model):
    user = models.ForeignKey(User, related_name='user_watchlist', on_delete=models.CASCADE)
    auction_listing = models.ForeignKey(AuctionListing, related_name='auction_listing_watchlist',
                                        on_delete=models.CASCADE)
