from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class AuctionListing(models.Model):
    pass


class Bid(models.Model):
    price = models.IntegerField()


class Comment(models.Model):
    text = models.CharField(max_length=512)
    users = models.ManyToManyField(User, related_name='users')
