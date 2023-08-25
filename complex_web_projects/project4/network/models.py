import datetime

from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass

    def serialize_following(self):
        follower_from = Follow.objects.filter(user_from=self).select_related('user_to')
        following = [follower.user_to.username for follower in follower_from]

        return {
            'following': following
        }


class Follow(models.Model):
    user_from = models.ForeignKey(User, on_delete=models.RESTRICT, related_name='follow_from')
    user_to = models.ForeignKey(User, on_delete=models.RESTRICT, related_name='follow_to')
    created_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        unique_together = ('user_from', 'user_to')


class Post(models.Model):
    text = models.CharField(max_length=280)
    multimedia_link = models.URLField(max_length=1000, blank=True, null=True)
    created_at = models.DateTimeField()
    user = models.ForeignKey(User, on_delete=models.RESTRICT)

    def __str__(self):
        return f"Text: {self.text}, {self.user}"

    def serialize(self):

        post_likes = Like.objects.filter(post=self).select_related('user')
        post_likes_by_users = [like.user for like in post_likes]

        return {
            "id": self.id,
            "text": self.text,
            "multimedia_link": self.multimedia_link,
            "created_at": self.created_at,
            "user_name": self.user.username,
            "user_id": self.user.id,
            "post_liked_by_users": post_likes_by_users
        }


class Like(models.Model):
    post = models.ForeignKey(Post, null=True, on_delete=models.SET_NULL, related_name='post_like')
    user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='user_like')


class Comment(models.Model):
    text = models.CharField(max_length=255)
    user = models.ForeignKey(User, null=True, on_delete=models.SET_NULL, related_name='comment_user')
    post = models.ForeignKey(Post, null=True, on_delete=models.SET_NULL, related_name='comment_post')
    created_at = models.DateTimeField(default=datetime.datetime.now())

    def serialize(self):
        return {
            "text": self.text,
            "user": self.user.username,
            "datetime": self.created_at
        }
