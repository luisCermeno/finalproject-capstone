# Generated by Django 3.1.7 on 2021-04-02 00:00

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('commons', '0014_auto_20210401_1230'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='timestamp',
            field=models.DateTimeField(default=datetime.datetime(2021, 4, 1, 17, 0, 54, 739958)),
        ),
        migrations.AlterField(
            model_name='profile',
            name='major',
            field=models.CharField(blank=True, max_length=2),
        ),
        migrations.AlterField(
            model_name='profile',
            name='timestamp',
            field=models.DateTimeField(default=datetime.datetime(2021, 4, 1, 17, 0, 54, 739505)),
        ),
        migrations.AlterField(
            model_name='profile',
            name='year',
            field=models.CharField(blank=True, max_length=2),
        ),
    ]
