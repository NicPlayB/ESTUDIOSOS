from django.urls import path
from .views import *

urlpatterns = [
   path('perfil/', perfil_usuario, name='perfil_usuario'),
   path('documentos/',documentos_usuario,name='documentos_usuario'),
]
