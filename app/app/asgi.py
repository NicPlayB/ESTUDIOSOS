import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'app.settings')

from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack

import administrador.routing
import clases.routing

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AuthMiddlewareStack(
        URLRouter(
            administrador.routing.websocket_urlpatterns +
            clases.routing.websocket_urlpatterns
        )
    ),
})
