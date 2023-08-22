from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Follower(models.Model):
    user = models.OneToOneField(User, null=True, on_delete=models.SET_NULL)


class Post(models.Model):
    text = models.CharField(max_length=280)
    img = models.URLField(max_length=1000)
    video = models.URLField(max_length=1000)
    followers = models.ManyToManyField(Follower, related_name='followers')


class Like(models.Model):
    post_like = models.ForeignKey(Post, null=True, on_delete=models.SET_NULL, related_name='post_likes')
    user_like = models.ForeignKey(Post, null=True, on_delete=models.SET_NULL, related_name='user_likes')
