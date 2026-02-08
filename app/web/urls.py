from django.urls import path
from .views import *

urlpatterns = [
    path("", index, name="index"),
    path('nuestras-clases/', nuestras_clases, name='nuestras_clases'),
    path('masterclass/', masterclass, name='masterclass'),
    path('cursos/', mostrar_cursos, name='mostrar_cursos'),
    path('noticias/', noticias, name='noticias'),
]