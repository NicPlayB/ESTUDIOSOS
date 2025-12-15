from django.urls import path
from .views import *

urlpatterns = [
    path("login/", login_view, name="login"),
    path("registrar/", registrar_usuario, name="registrar"),
    path("logout/", cerrar_sesion, name="cerrar_sesion"),
]
