# Generated by Django 4.2.4 on 2023-08-12 17:16

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('auctions', '0013_alter_auctionlisting_closing_on'),
    ]

    operations = [
        migrations.AlterField(
            model_name='auctionlisting',
            name='closing_on',
            field=models.DateTimeField(default=datetime.datetime(2023, 9, 11, 17, 16, 52, 176114)),
        ),
    ]
