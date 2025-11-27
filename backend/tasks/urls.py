from django.urls import path
from .views import tasks_view, delete_task, toggle_completed, completed_tasks, circular_tasks, pending_tasks, high_priority_tasks, tasks_by_date, tasks_with_dependencies, tasks_without_dependencies, update_task

urlpatterns = [
    path("", tasks_view, name="list-create-tasks"),
    path("update/<int:task_id>/", update_task, name="update-task"),
    path("delete/<int:task_id>/", delete_task, name="delete-task"),
    path("toggle/<int:task_id>/", toggle_completed, name="toggle-completed"),
    path("completed/", completed_tasks, name="completed-tasks"),
    path("circular/", circular_tasks, name="circular-tasks"),

    path("pending/", pending_tasks, name="pending-tasks"),
    path("high-priority/", high_priority_tasks, name="high-priority-tasks"),
    path("by-date/", tasks_by_date, name="tasks-by-date"),
    path("with-dependencies/", tasks_with_dependencies, name="tasks-with-dependencies"),
    path("without-dependencies/", tasks_without_dependencies, name="tasks-without-dependencies"),
]
