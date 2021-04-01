# Generated by Django 3.1.7 on 2021-03-31 23:52

import datetime
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('handsflow', '0010_auto_20210324_1559'),
    ]

    operations = [
        migrations.CreateModel(
            name='School',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
            ],
        ),
        migrations.AlterField(
            model_name='message',
            name='timestamp',
            field=models.DateTimeField(default=datetime.datetime(2021, 3, 31, 16, 52, 58, 800653)),
        ),
        migrations.CreateModel(
            name='Profile',
            fields=[
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='auth.user')),
                ('first_name', models.CharField(blank=True, max_length=100)),
                ('last_name', models.CharField(blank=True, max_length=100)),
                ('major', models.CharField(blank=True, max_length=100)),
                ('year', models.CharField(blank=True, max_length=100)),
                ('timestamp', models.DateTimeField(default=datetime.datetime(2021, 3, 31, 16, 52, 58, 800166))),
                ('description', models.TextField(blank=True)),
                ('school', models.OneToOneField(on_delete=django.db.models.deletion.PROTECT, to='handsflow.school')),
            ],
        ),
    ]