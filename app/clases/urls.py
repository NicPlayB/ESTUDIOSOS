from django.urls import path
from .views import *

urlpatterns = [


    path('clases/<int:clase_id>/', panel_inicio_clases, name='panel_inicio'),
    
    path("clases/activas/", gestion_clases, name="clases_activas"),
    path("clases/inactivas/", clases_inactivas, name="clases_inactivas"),
    path("clases/cambiar-estado/<int:id_clase>/", cambiar_estado_clase, name="cambiar_estado_clase"),
    path("clases/<int:clase_id>/editar-eliminar/",editar_eliminar_clase, name="editar_eliminar_clase"),
    
    
    path('gestionar-trabajo/<int:clase_id>/', gestionar_trabajos, name='gestionar_trabajos'),
    path('archivo/eliminar/<int:archivo_id>/',eliminar_archivo, name='eliminar_archivo'),
    path("trabajos/detalle/<int:trabajo_id>/", detalle_trabajo, name="detalle_trabajo"),
    
    
   
    path("trabajos/<int:trabajo_id>/entregas/",ver_entregas_trabajo,name="ver_entregas_trabajo"),
    path('trabajos/<int:trabajo_id>/entrega/<int:estudiante_id>/',ver_entrega_estudiante,name='ver_entrega_estudiante'),
    
    path("trabajo/<int:trabajo_id>/entregar/",entregar_trabajo,name="entregar_trabajo"),
    path("archivo-entrega/<int:archivo_id>/eliminar/",eliminar_archivo_entrega,name="eliminar_archivo_entrega"),

    
    path('clases/<int:clase_id>/inscritos/', inscritos_clase, name='inscritos_clase'),
    
    
    path('clases/<int:clase_id>/virtuales/',clases_virtuales, name='clases_virtuales'),
    
    
    path('clases/<int:clase_id>/comentarios/',comentarios_clase, name='comentarios_clase'),
    
    
]
