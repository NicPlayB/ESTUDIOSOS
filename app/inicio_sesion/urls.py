from django.urls import path
from .views import *

urlpatterns = [
    path("login/", login_view, name="login"),
    path("registrar/", registrar_usuario, name="registrar"),
    path("logout/", cerrar_sesion, name="cerrar_sesion"),
    
    path("verificar-codigo/", verificar_codigo, name="verificar_codigo"),
    
    path("recuperar-contrasena/", solicitar_recuperacion, name="recuperar_contrasena"),
    path("cambiar-contrasena/", cambiar_contrasena, name="cambiar_contrasena"),
]
