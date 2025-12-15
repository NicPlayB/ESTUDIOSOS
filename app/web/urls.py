from django.urls import path
from .views import *

urlpatterns = [
    path("", pagina_ejemplo, name="pagina_ejemplo"),
]