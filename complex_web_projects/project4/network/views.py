import datetime
import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt

from .controllers import follow_unfollow_data
from .models import User, Post, Follow, Comment, Like


def index(request):
    return render(request, "network/index.html", {
        'title': "All posts"
    })


@csrf_exempt
def all_posts(request):
    if request.method == "GET":
        try:
            all_posts = Post.objects.all()
            all_posts_ordered = all_posts.order_by('created_at').reverse().all()

        except Post.DoesNotExist:
            return JsonResponse({"error": "Error! Posts couldn't be loaded from database"}, status=400)

        json_response = JsonResponse([post.serialize() for post in all_posts_ordered], safe=False)
        return json_response
    else:
        return JsonResponse({"error": "POST request method requires"}, status=400)


@csrf_exempt
@login_required
def following(request):
    if request.method == "GET":
        logged_user = request.user

        current_user = User.objects.filter(id=logged_user.id).first()
        following_users = current_user.serialize_following()
        # WARNING: If json_dumps is used, JS loads string, not a proper object!
        json_response = JsonResponse(following_users, safe=False)

        return json_response
    else:
        return JsonResponse({"error": "Other method not supported."}, status=400)


@csrf_exempt
@login_required
def liked_posts(request):
    if request.method == "GET":
        logged_user = request.user

        current_user = User.objects.filter(id=logged_user.id).first()
        liked_posts = current_user.serialize_liked_posts()
        json_response = JsonResponse(liked_posts, safe=False)

        return json_response
    else:
        return JsonResponse({"error": "Other method not supported."}, status=400)


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
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


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
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


@csrf_exempt
@login_required
def new_post(request):
    print("request:")
    print(request)

    if request.method == "POST":
        post_data = json.loads(request.body)
        new_post_text = post_data.get('post_text')
        new_post_multimedia_link = post_data.get('multimedia_link')
        user_from_request = request.user

        new_post_created = Post(text=new_post_text, multimedia_link=new_post_multimedia_link,
                                created_at=datetime.datetime.now(), user=user_from_request)
        new_post_created.save()

        return JsonResponse({"message": "Email sent successfully"}, status=201)

    return HttpResponseRedirect(reverse('index'))


@csrf_exempt
@login_required()
def follow(request):
    user_logged = request.user
    follow_user_id = follow_unfollow_data(request)

    user_to_follow = User.objects.filter(id=follow_user_id).first()

    existing_follow = Follow.objects.filter(user_from=user_logged, user_to=user_to_follow)

    if not existing_follow.exists():
        new_follow = Follow(user_from=user_logged, user_to=user_to_follow)
        new_follow.save()

    return JsonResponse({"message": "Follower was added successfully to the user"}, status=201)


@csrf_exempt
@login_required()
def unfollow(request):
    user_logged = request.user
    unfollow_user_id = follow_unfollow_data(request)

    try:
        user_to_unfollow = User.objects.get(id=unfollow_user_id)
        new_follow = Follow.objects.filter(user_from=user_logged, user_to=user_to_unfollow)
        new_follow.delete()
    except User.DoesNotExist:
        raise ModuleNotFoundError("No user with this id found.")

    return JsonResponse({"message": "Unfollow was added successfully to the user"}, status=201)


@csrf_exempt
@login_required
def like_post(request):

    request_body = request.body
    post_data = json.loads(request_body)
    if request.method == "POST":
        post_id = post_data["post_id"]
        dislike = post_data['like_dislike']

        post_found = Post.objects.get(id=post_id)
        user = request.user

        if dislike == "like":
            dislike_bool = False
            like = Like(post=post_found, user=user)
        elif dislike == "dislike":
            try:
                like = Like.objects.get(post=post_found, user=user)
            except Like.DoesNotExist:
                raise ModuleNotFoundError("LIke with this post and user not found.")
            finally:
                dislike_bool = True
        else:
            raise ValueError("UNexpected value. Only 'like' or 'dislike' is allowed here.")

        if dislike_bool is False:
            like.save()
        else:
            like.delete()

        return JsonResponse({
            "message": "Like saved"
        }, status=201)


@csrf_exempt
@login_required()
def new_comment(request):
    if request.method == 'PUT':
        request_body = request.body
        comment_data = json.loads(request_body)
        if comment_data.get('post_id') is not None:
            post_id = comment_data["post_id"]

            if comment_data.get('comment_text') is not None:
                comment_text = comment_data.get('comment_text')

                try:
                    comment_sender_user = request.user
                    post_found = Post.objects.get(id=post_id)

                    comment = Comment(text=comment_text, user=comment_sender_user, post=post_found)
                    comment.save()

                    return JsonResponse({
                        "message": "Comment saved"
                    }, status=201)
                except User.DoesNotExist or Post.DoesNotExist:
                    return JsonResponse({"message": "User was not found."}, status=400)

            else:
                return JsonResponse({"message": "Comment input text not found."}, status=400)
        else:
            return JsonResponse({"error": "Post id input not found."}, status=400)

    else:
        return JsonResponse({"error": "Method not supported"}, status=400)


def comments_for_post(request, post_id):
    if request.method == 'GET':
        post_found = Post.objects.filter(id=post_id)
        # TODO: This does not work. ValueError:
        # The QuerySet value for an exact lookup must be limited to one result using slicing.
        comments_found = Comment.objects.filter(post__in=post_found)

        json_response = JsonResponse([comment.serialize() for comment in comments_found], safe=False)

        return json_response


def posts_for_user(request, username):
    try:
        user_found = User.objects.get(username=username)
    except User.DoesNotExist:
        return JsonResponse({"error": "Error occurred while searching for the user"}, status=400)

    posts_by_user = Post.objects.filter(user=user_found).order_by('created_at').reverse()
    json_dict = {}
    json_dict['user_posts'] = [post.serialize() for post in posts_by_user]

    num_of_followers = Follow.objects.filter(user_to=user_found).count()

    json_dict['num_of_followers'] = num_of_followers

    json_response = JsonResponse(json_dict)

    return json_response


@csrf_exempt
@login_required
def edit_post(request):

    if request.method == "PUT":
        request_body = request.body
        post_data = json.loads(request_body)
        post_id = post_data["post_id"]
        new_post_text = post_data["post_text"]

        post_found = Post.objects.get(id=post_id)
        post_found.text = new_post_text
        post_found.save()

        return JsonResponse({
            "message": "Post edited successfully"
        }, status=201)
    else:
        return JsonResponse({"error": "Method not supported"}, status=400)
