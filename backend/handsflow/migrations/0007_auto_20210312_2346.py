# Generated by Django 3.1.7 on 2021-03-13 07:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('handsflow', '0006_auto_20210312_2337'),
    ]

    operations = [
        migrations.AlterField(
            model_name='message',
            name='timestamp',
            field=models.DateTimeField(auto_now_add=True),
        ),
    ]
