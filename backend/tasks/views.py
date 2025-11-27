import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import date, datetime

from .models import Task


# -----------------------------------
# Helper: Circular dependency check
# -----------------------------------
def has_circular_dependency(task, visited=None, start_id=None):
    if visited is None:
        visited = set()
        start_id = task.id

    # If we've seen this task before
    if task.id in visited:
        # If we're back at the starting task, we have a cycle
        return task.id == start_id
        # Otherwise, we've seen this path before, no new cycle

    visited.add(task.id)

    # Check all dependencies
    for dep in task.dependencies.all():
        if has_circular_dependency(dep, visited, start_id):
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
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
    
    user = request.user

    # ---------------------- GET (List Tasks) ----------------------
    if request.method == "GET":
        try:
            tasks = Task.objects.filter(user=user).order_by("-id")
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
        except Exception as e:
            return JsonResponse({"error": f"Failed to retrieve tasks: {str(e)}"}, status=500)

    # ---------------------- POST (Create Task) ----------------------
    if request.method == "POST":
        try:
            data = json.loads(request.body.decode("utf-8"))
        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON data"}, status=400)

        # Extract and validate required fields
        number = data.get("number")
        title = data.get("title")
        due_date_str = data.get("due_date")
        estimated_hours = data.get("estimated_hours")
        importance = data.get("importance")
        dependencies = data.get("dependencies", [])

        # Validate required fields
        if number is None:
            return JsonResponse({"error": "Task number is required"}, status=400)
        if title is None or not title.strip():
            return JsonResponse({"error": "Title is required"}, status=400)
        if due_date_str is None:
            return JsonResponse({"error": "Due date is required"}, status=400)
        if estimated_hours is None:
            return JsonResponse({"error": "Estimated hours is required"}, status=400)
        if importance is None:
            return JsonResponse({"error": "Importance is required"}, status=400)

        # Validate and convert data types
        try:
            number = int(number)
            if number <= 0:
                return JsonResponse({"error": "Task number must be a positive integer"}, status=400)
        except (ValueError, TypeError):
            return JsonResponse({"error": "Task number must be a valid integer"}, status=400)

        try:
            estimated_hours = int(estimated_hours)
            if estimated_hours <= 0:
                return JsonResponse({"error": "Estimated hours must be a positive integer"}, status=400)
        except (ValueError, TypeError):
            return JsonResponse({"error": "Estimated hours must be a valid integer"}, status=400)

        try:
            importance = int(importance)
            if importance < 1 or importance > 10:
                return JsonResponse({"error": "Importance must be between 1 and 10"}, status=400)
        except (ValueError, TypeError):
            return JsonResponse({"error": "Importance must be a valid integer between 1 and 10"}, status=400)

        # Parse due date
        try:
            # Try parsing as ISO format (YYYY-MM-DD)
            due_date = datetime.strptime(due_date_str, "%Y-%m-%d").date()
        except (ValueError, TypeError):
            return JsonResponse({"error": "Invalid date format. Use YYYY-MM-DD"}, status=400)

        # Validate dependencies is a list
        if not isinstance(dependencies, list):
            return JsonResponse({"error": "Dependencies must be a list"}, status=400)

        # Task number must be unique per user
        if Task.objects.filter(user=user, number=number).exists():
            return JsonResponse({"error": "Task number already exists for this user"}, status=400)

        # Create task (without dependencies first)
        try:
            task = Task.objects.create(
                user=user,
                number=number,
                title=title.strip(),
                due_date=due_date,
                estimated_hours=estimated_hours,
                importance=importance,
            )
        except Exception as e:
            return JsonResponse({"error": f"Failed to create task: {str(e)}"}, status=400)

        # Add dependencies
        for dep_id in dependencies:
            try:
                dep_id = int(dep_id)
                dep_task = Task.objects.get(id=dep_id, user=user)
                task.dependencies.add(dep_task)
            except (Task.DoesNotExist, ValueError, TypeError):
                task.delete()
                return JsonResponse({"error": f"Dependency {dep_id} does not exist or is invalid"}, status=400)

        # Handle circular dependency (only check if task has dependencies)
        if task.dependencies.exists():
            task.circularTask = has_circular_dependency(task)
        else:
            task.circularTask = False

        # Compute scores
        try:
            task.priorityScore = calculate_priority_score(task)
            task.smartPriorityScore = calculate_smart_score(task)
        except Exception as e:
            # If score calculation fails, set defaults
            task.priorityScore = 0.0
            task.smartPriorityScore = 0.0

        task.save()

        return JsonResponse({
            "message": "Task created successfully",
            "id": task.id,
            "task": {
                "id": task.id,
                "number": task.number,
                "title": task.title,
                "due_date": str(task.due_date),
                "estimated_hours": task.estimated_hours,
                "importance": task.importance,
                "dependencies": list(task.dependencies.values_list("id", flat=True)),
                "priorityScore": task.priorityScore,
                "smartPriorityScore": task.smartPriorityScore,
                "completed": task.completed,
                "circularTask": task.circularTask,
            }
        }, status=201)

@csrf_exempt
def delete_task(request, task_id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
    
    user = request.user

    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE method required"}, status=400)

    try:
        task = Task.objects.get(id=task_id, user=user)
    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": f"Failed to retrieve task: {str(e)}"}, status=500)

    # Check if other tasks depend on this
    try:
        dependent_tasks = Task.objects.filter(dependencies=task, user=user)
        if dependent_tasks.exists():
            dep_numbers = [str(t.number) for t in dependent_tasks]
            return JsonResponse({
                "error": f"Cannot delete task #{task.number}. Other tasks depend on it: {', '.join(dep_numbers)}"
            }, status=400)
    except Exception as e:
        return JsonResponse({"error": f"Failed to check dependencies: {str(e)}"}, status=500)

    try:
        task.delete()
        return JsonResponse({"message": "Task deleted successfully"})
    except Exception as e:
        return JsonResponse({"error": f"Failed to delete task: {str(e)}"}, status=500)


@csrf_exempt
def toggle_completed(request, task_id):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
    
    user = request.user

    if request.method != "POST":
        return JsonResponse({"error": "POST method required"}, status=400)

    try:
        task = Task.objects.get(id=task_id, user=user)
    except Task.DoesNotExist:
        return JsonResponse({"error": "Task not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": f"Failed to retrieve task: {str(e)}"}, status=500)

    try:
        task.completed = not task.completed
        task.save()
        
        return JsonResponse({
            "completed": task.completed,
            "message": f"Task marked as {'completed' if task.completed else 'incomplete'}"
        })
    except Exception as e:
        return JsonResponse({"error": f"Failed to update task: {str(e)}"}, status=500)


@csrf_exempt
def completed_tasks(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
    
    user = request.user

    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=400)

    try:
        tasks = Task.objects.filter(user=user, completed=True).order_by("-id")

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
    except Exception as e:
        return JsonResponse({"error": f"Failed to retrieve completed tasks: {str(e)}"}, status=500)


@csrf_exempt
def circular_tasks(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
    
    user = request.user

    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=400)

    try:
        tasks = Task.objects.filter(user=user, circularTask=True).order_by("-id")

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
    except Exception as e:
        return JsonResponse({"error": f"Failed to retrieve circular tasks: {str(e)}"}, status=500)


@csrf_exempt
def pending_tasks(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
    
    user = request.user

    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=400)

    try:
        tasks = Task.objects.filter(user=user, completed=False).order_by("-id")

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
    except Exception as e:
        return JsonResponse({"error": f"Failed to retrieve pending tasks: {str(e)}"}, status=500)


@csrf_exempt
def high_priority_tasks(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
    
    user = request.user

    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=400)

    try:
        threshold = float(request.GET.get("min", 5.0))
    except (ValueError, TypeError):
        threshold = 5.0

    try:
        tasks = Task.objects.filter(user=user, priorityScore__gte=threshold).order_by("-priorityScore")

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
    except Exception as e:
        return JsonResponse({"error": f"Failed to retrieve high priority tasks: {str(e)}"}, status=500)


@csrf_exempt
def tasks_by_date(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
    
    user = request.user

    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=400)

    try:
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
    except Exception as e:
        return JsonResponse({"error": f"Failed to retrieve tasks by date: {str(e)}"}, status=500)


@csrf_exempt
def tasks_without_dependencies(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
    
    user = request.user

    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=400)

    try:
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
    except Exception as e:
        return JsonResponse({"error": f"Failed to retrieve tasks without dependencies: {str(e)}"}, status=500)


@csrf_exempt
def tasks_with_dependencies(request):
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Authentication required"}, status=401)
    
    user = request.user

    if request.method != "GET":
        return JsonResponse({"error": "GET method required"}, status=400)

    try:
        tasks = Task.objects.filter(user=user)

        # Filter tasks that have at least 1 dependency
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
    except Exception as e:
        return JsonResponse({"error": f"Failed to retrieve tasks with dependencies: {str(e)}"}, status=500)
