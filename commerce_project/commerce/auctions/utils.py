from django.db.models import Max

from auctions.models import AuctionListing, AuctionWins


def get_max_bid_price(listing):
    max_bid = listing.bids.aggregate(Max('price'))
    max_bid = max_bid['price__max']

    return max_bid


def get_highest_bid_user(listing):
    max_bid = listing.bids.order_by('price').last()
    return max_bid.user


def create_auction_dict(request, success_message=None, error_message=None,
                        only_wins=False):

    user = request.user

    if only_wins:
        auction_wins = AuctionWins.objects.filter(user=user)
        print("auction_wins:")
        print(auction_wins)
        listings = AuctionListing.objects.all()
    else:
        listings = AuctionListing.objects.filter(active=True)

    listings_max_values = []

    if request.user is not None:
        user = request.user
    else:
        user = None

    for listing in listings:
        max_bid = get_max_bid_price(listing)
        if max_bid is None:
            max_bid = None

        num_of_bids = listing.bids.count()

        if only_wins is True:
            user_auction_wins = AuctionWins.objects.filter(auction_id=listing.id, user_id=user.id)
            if user_auction_wins.exists():
                user_is_winner = True
            else:
                user_is_winner = False

            if user_is_winner is True:
                listings_max_values.append({'id': listing.id, 'item_name': listing.item_name, 'image_url': listing.image_url,
                                            'created_at': listing.created_at, 'starting_bid': listing.starting_bid,
                                            'max_bid': max_bid, 'num_of_bids': num_of_bids,
                                            'user_is_winner_message': "You are the winner of this auction.",
                                            'user_id': listing.user.id})
        else:
            listings_max_values.append(
                {'id': listing.id, 'item_name': listing.item_name, 'image_url': listing.image_url,
                 'created_at': listing.created_at, 'starting_bid': listing.starting_bid,
                 'max_bid': max_bid, 'num_of_bids': num_of_bids,
                 'user_is_winner_message': "You are the current winner of this auction. Keep it up!",
                 'user_id': listing.user.id})

    title = 'Active Listings'

    if only_wins:
        title = 'Your won auctions'

    return {
        'title': title,
        'active_listings': listings_max_values,
        'message_success': success_message,
        'message_error': error_message,
        'user': user
    }
