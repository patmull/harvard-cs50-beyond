from django.db.models import Max

from auctions.models import AuctionListing, Bid


def get_max_bid_price(listing):
    max_bid = listing.bids.aggregate(Max('price'))
    max_bid = max_bid['price__max']

    return max_bid


def get_max_bid(listing):
    max_bid = listing.bids.aggregate(Max('price'))


def create_auction_dict(request, success_message=None, error_message=None):
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
        if listing.auction_winner:
            auction_winner_id = listing.auction_winner.user.id
        else:
            auction_winner_id = None

        if auction_winner_id == request.user.id:
            user_is_winner = True
        else:
            user_is_winner = False

        listings_max_values.append({'id': listing.id, 'item_name': listing.item_name, 'image_url': listing.image_url,
                                    'created_at': listing.created_at, 'starting_bid': listing.starting_bid,
                                    'max_bid': max_bid, 'num_of_bids': num_of_bids,
                                    'closing_on': listing.closing_on, 'user_is_winner': user_is_winner, 'user_id': listing.user.id})

    return {
        'active_listings': listings_max_values,
        'message_success': success_message,
        'message_error': error_message,
        'user': user
    }
