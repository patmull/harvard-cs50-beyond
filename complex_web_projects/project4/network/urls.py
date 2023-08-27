
from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("new-post", views.new_post, name="new_post"),
    path('new-comment', views.new_comment, name="new_comment"),
    path('like-post', views.like_post, name="like_post"),
    path('comments-for-post/<post_id>', views.comments_for_post, name="comment_post"),
    path("all-posts", views.all_posts, name="all_posts"),
    path("user-posts/<username>", views.posts_for_user, name="user_posts"),
    path("follow", views.follow, name="follow"),
    path("unfollow", views.unfollow, name="unfollow"),
    path('following', views.following, name="followers"),
    path('liked-posts', views.liked_posts, name="liked_posts")
]
