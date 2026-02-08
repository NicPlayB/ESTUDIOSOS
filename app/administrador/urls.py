from django.urls import path
from .views import *

urlpatterns = [
    path("panel/", panel_admin, name="panel_administrador"),
    
    path("gestion_usuarios/", lista_usuarios, name="gestion_usuarios"),
    
    path('gestion_profesores/', profesores_view, name='profesores'),
    
    path('certificaciones/', listar_usuarios_certificaciones, name='certificaciones'),
    path('certificaciones/usuario/<int:usuario_id>/',certificados_usuario,name='certificados_usuario'),
    path('certificaciones/documento/eliminar/<int:documento_id>/',eliminar_documento,name='eliminar_documento'),
     
    path('cursos/gestion/', gestion_cursos, name='gestion_cursos'),
    path('contenidos/', gestionar_novedades, name='gestionar_novedades'),
 
    path('curso/<int:id_curso>/inscritos/', inscritos_por_curso, name='inscritos_por_curso'),
   
]
