from django.db import models
from django.contrib.auth.models import AbstractUser
from django.conf import settings

# Create your models here.
    
class CustomUser(AbstractUser):
    dateOfBirth = models.DateField(null=False, blank=False)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

class TaskList(models.Model):
    id = models.AutoField(primary_key=True)
    listName = models.CharField(max_length=100)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasklist', null=True)

    def __str__(self):
        return self.listName

class Task(models.Model):
    id = models.AutoField(primary_key=True)
    description = models.CharField(max_length=100)
    state = models.CharField(max_length=20)
    dueOn = models.DateTimeField(null=True, blank=True)
    list = models.ForeignKey(TaskList, on_delete=models.CASCADE, related_name="tasks", null=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks', null=True)

    def __str__(self):
        return self.description
    
