from django.contrib import admin
from .models import Task, TaskList

class TaskInline(admin.TabularInline):
    model = Task
    extra = 1

class TaskListAdmin(admin.ModelAdmin):
    inlines = [TaskInline]

# Register your models here.
admin.site.register(TaskList,TaskListAdmin)
admin.site.register(Task)