from rest_framework import serializers
from .models import Task, TaskList

class TaskListSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskList
        fields = [
            'id',
            'listName',
        ]
        read_only_fields = [
            'id',
        ]
        


class TaskAPISerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = [
            'id',
            'description',
            'state',
            'dueOn',
            'list',
        ]