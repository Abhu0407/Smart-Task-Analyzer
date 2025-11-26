import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import date

from .models import Task


# -----------------------------------
# Helper: Circular dependency check
# -----------------------------------
def has_circular_dependency(task, visited=None):
    if visited is None:
        visited = set()

    if task.id in visited:
        return True

    visited.add(task.id)

    for dep in task.dependencies.all():
        if has_circular_dependency(dep, visited):
            return True

    return False


# -----------------------------------
# Helper: Priority Score
# -----------------------------------
def calculate_priority_score(task):
    today = date.today()
    days_until_due = (task.due_date - today).days
    if days_until_due <= 0:
        days_until_due = 1

    ps = task.importance * (1 / days_until_due) * (1 / task.estimated_hours)
    return round(ps, 3)


# -----------------------------------
# Helper: Smart Priority Score
# -----------------------------------
def calculate_smart_score(task):
    today = date.today()
    days_until_due = (task.due_date - today).days
    if days_until_due <= 0:
        days_until_due = 1

    W_U = 0.5
    W_I = 0.3
    W_E = 0.2

    urgency_factor = 1 / days_until_due
    importance_factor = task.importance / 10
    effort_factor = 1 / task.estimated_hours

    smart = (urgency_factor * W_U) + (importance_factor * W_I) + (effort_factor * W_E)
    return round(smart, 3)


# -----------------------------------
# Add or List tasks
# -----------------------------------
@csrf_exempt
def tasks_view(request):
    user = request.user

    # ---------------------- GET (List Tasks) ----------------------
    if request.method == "GET":
        tasks = Task.objects.filter(user=user)
        data = [{
            "id": t.id,
            "number": t.number,
            "title": t.title,
            "due_date": str(t.due_date),
            "estimated_hours": t.estimated_hours,
            "importance": t.importance,
            "dependencies": list(t.dependencies.values_list("id", flat=True)),
            "priorityScore": t.priorityScore,
            "smartPriorityScore": t.smartPriorityScore,
            "completed": t.completed,
            "circularTask": t.circularTask,
        } for t in tasks]
        return JsonResponse(data, safe=False)

    # ---------------------- POST (Create Task) ----------------------
    if request.method == "POST":
        data = json.loads(request.body.decode("utf-8"))

        number = data.get("number")
        title = data.get("title")
        due_date = data.get("due_date")
        estimated_hours = data.get("estimated_hours")
        importance = data.get("importance")
        dependencies = data.get("dependencies", [])

        # Task number must be unique per user
        if Task.objects.filter(user=user, number=number).exists():
            return JsonResponse({"error": "Task number already exists for this user"}, status=400)

        # Create task (without dependencies first)
        task = Task.objects.create(
            user=user,
            number=number,
            title=title,
            due_date=due_date,
            estimated_hours=estimated_hours,
            importance=importance,
        )

        # Add dependencies
        for dep_id in dependencies:
            try:
                dep_task = Task.objects.get(id=dep_id, user=user)
                task.dependencies.add(dep_task)
            except Task.DoesNotExist:
                task.delete()
                return JsonResponse({"error": f"Dependency {dep_id} does not exist"}, status=400)

        # Handle circular dependency
        task.circularTask = has_circular_dependency(task)

        # Compute scores
        task.priorityScore = calculate_priority_score(task)
        task.smartPriorityScore = calculate_smart_score(task)

        task.save()

        return JsonResponse({"message": "Task created successfully", "id": task.id})

@csrf_exempt
def delete_task(request, task_id):
    user = request.user

    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE method required"}, status=400)

    try:
        task = Task.objects.get(id=task_id, user=user)
    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)

    # Check if other tasks depend on this
    if Task.objects.filter(dependencies=task).exists():
        return JsonResponse({"error": "Cannot delete, other tasks depend on this"}, status=400)

    task.delete()
    return JsonResponse({"message": "Task deleted successfully"})


@csrf_exempt
def toggle_completed(request, task_id):
    user = request.user

    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=400)

    try:
        task = Task.objects.get(id=task_id, user=user)
    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)

    task.completed = not task.completed
    task.save()

    return JsonResponse({"completed": task.completed})


@csrf_exempt
def completed_tasks(request):
    user = request.user

    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=400)

    tasks = Task.objects.filter(user=user, completed=True)

    data = [{
        "id": t.id,
        "number": t.number,
        "title": t.title,
        "due_date": str(t.due_date),
        "estimated_hours": t.estimated_hours,
        "importance": t.importance,
        "dependencies": list(t.dependencies.values_list("id", flat=True)),
        "priorityScore": t.priorityScore,
        "smartPriorityScore": t.smartPriorityScore,
        "completed": t.completed,
        "circularTask": t.circularTask,
    } for t in tasks]

    return JsonResponse(data, safe=False)


@csrf_exempt
def circular_tasks(request):
    user = request.user

    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=400)

    tasks = Task.objects.filter(user=user, circularTask=True)

    data = [{
        "id": t.id,
        "number": t.number,
        "title": t.title,
        "due_date": str(t.due_date),
        "estimated_hours": t.estimated_hours,
        "importance": t.importance,
        "dependencies": list(t.dependencies.values_list("id", flat=True)),
        "priorityScore": t.priorityScore,
        "smartPriorityScore": t.smartPriorityScore,
        "completed": t.completed,
        "circularTask": t.circularTask
    } for t in tasks]

    return JsonResponse(data, safe=False)


def pending_tasks(request):
    user = request.user

    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=400)

    tasks = Task.objects.filter(user=user, completed=False)

    data = [{
        "id": t.id,
        "number": t.number,
        "title": t.title,
        "due_date": str(t.due_date),
        "estimated_hours": t.estimated_hours,
        "importance": t.importance,
        "dependencies": list(t.dependencies.values_list("id", flat=True)),
        "priorityScore": t.priorityScore,
        "smartPriorityScore": t.smartPriorityScore,
        "completed": t.completed,
        "circularTask": t.circularTask,
    } for t in tasks]

    return JsonResponse(data, safe=False)


@csrf_exempt
def high_priority_tasks(request):
    user = request.user

    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=400)

    threshold = float(request.GET.get("min", 5.0))

    tasks = Task.objects.filter(user=user, priorityScore__gte=threshold)

    data = [{
        "id": t.id,
        "number": t.number,
        "title": t.title,
        "due_date": str(t.due_date),
        "estimated_hours": t.estimated_hours,
        "importance": t.importance,
        "dependencies": list(t.dependencies.values_list("id", flat=True)),
        "priorityScore": t.priorityScore,
        "smartPriorityScore": t.smartPriorityScore,
        "completed": t.completed,
        "circularTask": t.circularTask
    } for t in tasks]

    return JsonResponse(data, safe=False)


@csrf_exempt
def tasks_by_date(request):
    user = request.user

    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=400)

    tasks = Task.objects.filter(user=user).order_by("due_date")

    data = [{
        "id": t.id,
        "number": t.number,
        "title": t.title,
        "due_date": str(t.due_date),
        "estimated_hours": t.estimated_hours,
        "importance": t.importance,
        "dependencies": list(t.dependencies.values_list("id", flat=True)),
        "priorityScore": t.priorityScore,
        "smartPriorityScore": t.smartPriorityScore,
        "completed": t.completed,
        "circularTask": t.circularTask
    } for t in tasks]

    return JsonResponse(data, safe=False)


@csrf_exempt
def tasks_without_dependencies(request):
    user = request.user

    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=400)

    tasks = Task.objects.filter(user=user)

    tasks = [t for t in tasks if not t.dependencies.exists()]

    data = [{
        "id": t.id,
        "number": t.number,
        "title": t.title,
        "due_date": str(t.due_date),
        "estimated_hours": t.estimated_hours,
        "importance": t.importance,
        "dependencies": [],
        "priorityScore": t.priorityScore,
        "smartPriorityScore": t.smartPriorityScore,
        "completed": t.completed,
        "circularTask": t.circularTask
    } for t in tasks]

    return JsonResponse(data, safe=False)


@csrf_exempt
def tasks_with_dependencies(request):
    user = request.user

    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=400)

    tasks = Task.objects.filter(user=user).exclude(dependencies=None)

    # Fix: must check if they have at least 1 dependency
    tasks = [t for t in tasks if t.dependencies.exists()]

    data = [{
        "id": t.id,
        "number": t.number,
        "title": t.title,
        "due_date": str(t.due_date),
        "estimated_hours": t.estimated_hours,
        "importance": t.importance,
        "dependencies": list(t.dependencies.values_list("id", flat=True)),
        "priorityScore": t.priorityScore,
        "smartPriorityScore": t.smartPriorityScore,
        "completed": t.completed,
        "circularTask": t.circularTask
    } for t in tasks]

    return JsonResponse(data, safe=False)
