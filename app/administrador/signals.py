from django.db.models.signals import post_save
from django.dispatch import receiver
from django.template.loader import render_to_string
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from inicio_sesion.models import *  # Ajusta según tu app


@receiver(post_save, sender=Usuario)
def usuario_post_save(sender, instance, created, **kwargs):
    channel_layer = get_channel_layer()
    html = render_to_string("administrador/usuario/tabla_usuarios.html", {
        "usuarios": Usuario.objects.all(),
        "roles": Rol.objects.all(),
    })
    async_to_sync(channel_layer.group_send)(
        "usuarios_group",
        {
            "type": "usuarios_update",
            "action": "refresh",
            "html": html
        }
    )