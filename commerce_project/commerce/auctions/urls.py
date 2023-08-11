from django.urls import path


from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("new-listing", views.new_listing, name="new_listing"),
    path('new-bid/<active_listing_id>/<user_id>', views.new_bid, name='bid_for_listing'),
    path('close-auction/<active_listing_id>', views.close_auction, name='close_auction'),
    path('bought-items', views.bought_items, name='bought_items')
]
