from django.db.models import Max

from auctions.models import AuctionListing, Bid


def get_max_bid(listing):
    max_bid = listing.bids.aggregate(Max('price'))
    max_bid = max_bid['price__max']

    return max_bid


def create_auction_dict(success_message=None, error_message=None, user=None):
    listings = AuctionListing.objects.filter(active=True)

    listings_max_values = []

    for listing in listings:
        max_bid = get_max_bid(listing)
        if max_bid is None:
            max_bid = None

        listings_max_values.append({'id': listing.id, 'item_name': listing.item_name, 'image_url': listing.image_url,
                                    'created_at': listing.created_at, 'starting_bid': listing.starting_bid,
                                    'max_bid': max_bid, 'user_id': listing.user.id})

    return {
        'active_listings': listings_max_values,
        'message_success': success_message,
        'message_error': error_message,
        'user': user
    }
