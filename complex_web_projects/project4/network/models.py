from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass
    followers = models.ManyToManyField('self', symmetrical=False, related_name='follower_of_user',
                                       blank=True, null=True)


class Follower(models.Model):
    user = models.OneToOneField(User, on_delete=models.RESTRICT)
    created_at = models.DateTimeField


class Post(models.Model):
    text = models.CharField(max_length=280)
    multimedia_link = models.URLField(max_length=1000, blank=True, null=True)
    created_at = models.DateTimeField()
    user = models.ForeignKey(User, on_delete=models.RESTRICT)

    def __str__(self):
        return f"Text: {self.text}, {self.user}"

    def serialize(self):
        return {
            "id": self.id,
            "text": self.text,
            "multimedia_link": self.multimedia_link,
            "followers": [follower for follower in self.user.followers.all()],
            "created_at": self.created_at,
            "user_name": self.user.username
        }


class Like(models.Model):
    post_like = models.ForeignKey(Post, null=True, on_delete=models.SET_NULL, related_name='post_likes')
    user_like = models.ForeignKey(Post, null=True, on_delete=models.SET_NULL, related_name='user_likes')
