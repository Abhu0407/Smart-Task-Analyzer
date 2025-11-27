from django.urls import path
from .views import register_user, login_user, logout_user, get_current_user, update_user_profile

urlpatterns = [
    path("register/", register_user, name="register"),
    path("login/", login_user, name="login"),
    path("logout/", logout_user, name="logout"),
    path("me/", get_current_user, name="current-user"),
    path("profile/", update_user_profile, name="update-profile"),
]
