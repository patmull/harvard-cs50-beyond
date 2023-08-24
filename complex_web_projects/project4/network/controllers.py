import json


def follow_unfollow_data(request):
    user_logged = request.user
    follow_unfollow_data = json.loads(request.body)
    follow_unfollow_user_id = follow_unfollow_data.get('user_id')

    return follow_unfollow_user_id
