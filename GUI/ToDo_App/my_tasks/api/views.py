from django.shortcuts import render
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from .models import Task, TaskList
from .serializers import TaskAPISerializer, TaskListSerializer

# Create your views here.
class TaskAPIView(generics.ListCreateAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskAPISerializer
    permission_classes = [IsAuthenticated]

class TaskDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Task.objects.all()
    serializer_class = TaskAPISerializer
    permission_classes = [IsAuthenticated]

class TaskListAPIView(generics.ListCreateAPIView):
    queryset = TaskList.objects.all()
    serializer_class = TaskListSerializer
    permission_classes = [IsAuthenticated]


class TaskListDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = TaskList.objects.all()
    serializer_class = TaskListSerializer
    permission_classes = [IsAuthenticated]

def search_tasks(request):
    query = request.GET.get('q')
    results = Task.objects.filter(description_icontains=query)
    return render(request, 'search_results.html', {'results': results})

# Aufgaben einer bestimmten Liste abrufen
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def TasksOfListAPIView(request, list_id):
    tasks = Task.objects.filter(list_id=list_id)
    serializer = TaskAPISerializer(tasks, many=True)
    return Response(serializer.data)

