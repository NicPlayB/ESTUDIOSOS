from django.urls import path
from .views import *

urlpatterns = [
    path("clases/activas/", gestion_clases, name="clases_activas"),
    path("clases/inactivas/", clases_inactivas, name="clases_inactivas"),
    path("clases/cambiar-estado/<int:id_clase>/", cambiar_estado_clase, name="cambiar_estado_clase"),
    path("clases/<int:clase_id>/editar-eliminar/",editar_eliminar_clase, name="editar_eliminar_clase"),
    
    
    path("trabajos/<int:id_clase>/", ver_trabajos, name="ver_trabajos"),
    path("clases/trabajos/crear/<int:id_clase>/", crear_trabajo, name="crear_trabajo"),
    path("trabajos/detalle/<int:trabajo_id>/", detalle_trabajo, name="detalle_trabajo"),
    
    
    path('trabajos/entregar/<int:trabajo_id>/',entregar_trabajo,name='entregar_trabajo',),
    path("trabajos/<int:trabajo_id>/entregas/",ver_entregas_trabajo,name="ver_entregas_trabajo"),
    
    
    
    path('clases/<int:clase_id>/inscritos/', inscritos_clase, name='inscritos_clase'),
    
    
    path('clases/<int:clase_id>/virtuales/',clases_virtuales, name='clases_virtuales'),
    
    
    path('clases/<int:clase_id>/comentarios/',comentarios_clase, name='comentarios_clase'),
    

    
]
