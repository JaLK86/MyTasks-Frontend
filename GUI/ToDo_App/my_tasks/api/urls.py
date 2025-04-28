from django.urls import path
from .views import TaskAPIView, TaskDetailAPIView, TaskListAPIView, TaskListDetailAPIView, TasksOfListAPIView

urlpatterns = [
    path("task/", TaskAPIView.as_view(), name="task"),
    path("task/<int:pk>/", TaskDetailAPIView.as_view(), name="task_detail"),
    path("tasklist/", TaskListAPIView.as_view(), name="tasklist"),
    path("tasklist/<int:pk>/", TaskListDetailAPIView.as_view(), name="tasklist_detail"),
    path("tasklist/<int:list_id>/tasks/", TasksOfListAPIView, name='tasks-of-list'),
]