from django.urls import path
from .views import *

urlpatterns = [
    path("panel/", lista_usuarios, name="panel_administrador"),
    
    path("gestion_usuarios/", lista_usuarios, name="gestion_usuarios"),
]
