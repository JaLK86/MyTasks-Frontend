from django.db import models


# Create your models here.

    
class TaskList(models.Model):
    id = models.AutoField(primary_key=True)
    listName = models.CharField(max_length=100)

    def __str__(self):
        return self.listName


class Task(models.Model):
    id = models.AutoField(primary_key=True)
    description = models.CharField(max_length=100)
    state = models.CharField(max_length=20)
    dueOn = models.DateTimeField(null=True, blank=True)
    list = models.ForeignKey(TaskList, on_delete=models.CASCADE, related_name="tasks", null=True)

    def __str__(self):
        return self.description