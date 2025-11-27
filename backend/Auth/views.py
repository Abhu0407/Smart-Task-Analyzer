from django.shortcuts import render

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json


from .models import User


@csrf_exempt
def register_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)

    email = data.get("email")
    name = data.get("name") or data.get("fullName")
    phone = data.get("phone")
    password = data.get("password")

    # Validate required fields
    if not email:
        return JsonResponse({"error": "Email is required"}, status=400)
    
    if not password:
        return JsonResponse({"error": "Password is required"}, status=400)
    
    if not name:
        return JsonResponse({"error": "Name is required"}, status=400)

    # Normalize email
    email = email.strip().lower()

    # Check if email already exists
    if User.objects.filter(email=email).exists():
        return JsonResponse({"error": "Email already exists"}, status=400)

    # Handle phone - only check uniqueness if phone is provided
    if phone:
        phone = phone.strip()
        if phone and User.objects.filter(phone=phone).exists():
            return JsonResponse({"error": "Phone number already exists"}, status=400)
    else:
        phone = None  # Set to None instead of empty string for database

    try:
        # Create user with proper name
        user = User(
            email=email,
            name=name.strip(),
            phone=phone  # None if not provided, which is allowed by the model
        )
        user.set_password(password)
        user.save()

        # Auto login after registration
        login(request, user)

        return JsonResponse({
            "message": "User registered successfully",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "phone": user.phone or ""
            }
        }, status=201)
    
    except Exception as e:
        # Log the error for debugging
        import traceback
        print(f"Registration error: {str(e)}")
        print(traceback.format_exc())
        return JsonResponse({"error": f"Failed to create user: {str(e)}"}, status=500)


@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    try:
        data = json.loads(request.body.decode("utf-8"))
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON data"}, status=400)

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return JsonResponse({"error": "Email and password are required"}, status=400)

    try:
        user = authenticate(request, username=email, password=password)

        if user is None:
            return JsonResponse({"error": "Invalid email or password"}, status=400)

        login(request, user)
        return JsonResponse({
            "message": "Login successful",
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "phone": user.phone or ""
            }
        })
    except Exception as e:
        return JsonResponse({"error": f"Login failed: {str(e)}"}, status=500)


@csrf_exempt
def logout_user(request):
    logout(request)
    return JsonResponse({"message": "Logged out successfully"})


@csrf_exempt
def get_current_user(request):
    """Get current authenticated user"""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    user = request.user
    return JsonResponse({
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "phone": user.phone,
            "date_joined": user.date_joined.isoformat() if hasattr(user, 'date_joined') else None
        }
    })


@csrf_exempt
def update_user_profile(request):
    """Update user profile"""
    if not request.user.is_authenticated:
        return JsonResponse({"error": "Not authenticated"}, status=401)
    
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)
    
    data = json.loads(request.body.decode("utf-8"))
    user = request.user
    
    if "name" in data:
        user.name = data.get("name")
    if "phone" in data:
        phone = data.get("phone")
        if phone and User.objects.filter(phone=phone).exclude(id=user.id).exists():
            return JsonResponse({"error": "Phone number already exists"}, status=400)
        user.phone = phone or ""
    
    user.save()
    
    return JsonResponse({
        "message": "Profile updated successfully",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "phone": user.phone
        }
    })

