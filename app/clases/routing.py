from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/inscritos/clase/(?P<clase_id>\d+)/$', consumers.InscritosConsumer.as_asgi()),
    re_path(r'ws/clases_virtuales/clase/(?P<clase_id>\d+)/$', consumers.ClasesVirtualesConsumer.as_asgi()),
    re_path(
        r'ws/comentarios/clase/(?P<clase_id>\d+)/$',
        consumers.ComentariosConsumer.as_asgi()
    ),
    
]