# Generated by Django 5.2 on 2025-04-15 07:17

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="Task",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("description", models.CharField(max_length=100)),
                ("state", models.CharField(max_length=20)),
                ("dueOn", models.DateTimeField(blank=True, null=True)),
            ],
        ),
    ]
