# Generated by Django 4.2.4 on 2023-08-09 15:30

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0004_alter_auctionlisting_category'),
    ]

    operations = [
        migrations.AddField(
            model_name='auctionlisting',
            name='bids',
            field=models.ManyToManyField(related_name='bids', to='auctions.bid'),
        ),
    ]
