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
    path('bought-items', views.bought_items, name='bought_items'),
    path('listing-detail/<listing_id>', views.listing_detail, name='listing_detail'),
    path('add-commnent/<listing_id>/<user_id>', views.add_comment, name='add_comment'),
    path('add-to-watchlist/<listing_id>/<user_id>', views.add_auction_to_watchlist, name='add_auction_to_watchlist'),
    path('watchlist', views.watchlist, name='watchlist'),
    path('watchlist/delete/<listing_id>', views.remove_from_watchlist, name='remove_from_watchlist'),
    path('category/<category_id>', views.category, name='category')
]
