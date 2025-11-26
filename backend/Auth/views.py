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

    data = json.loads(request.body.decode("utf-8"))

    email = data.get("email")
    name = data.get("name")
    phone = data.get("phone")
    password = data.get("password")

    if User.objects.filter(email=email).exists():
        return JsonResponse({"error": "Email already exists"}, status=400)

    user = User(email=email, name=name, phone=phone)
    user.set_password(password)
    user.save()

    return JsonResponse({"message": "User registered successfully"}, status=201)


@csrf_exempt
def login_user(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required"}, status=400)

    data = json.loads(request.body.decode("utf-8"))
    email = data.get("email")
    password = data.get("password")

    user = authenticate(request, email=email, password=password)

    if user is None:
        return JsonResponse({"error": "Invalid email or password"}, status=400)

    login(request, user)
    return JsonResponse({"message": "Login successful"})


def logout_user(request):
    logout(request)
    return JsonResponse({"message": "Logged out successfully"})

