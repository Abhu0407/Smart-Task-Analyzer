from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    id = models.AutoField(primary_key=True)  # user id
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=255)
    phone = models.CharField(max_length=10, unique=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['email']

    def __str__(self):
        return self.email