# signals.py - CORRECCIÓN COMPLETA
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.template.loader import render_to_string
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.apps import apps
from django.utils import timezone

from .models import *

@receiver(post_save, sender=InscritoClase)
def inscrito_post_save(sender, instance, created, **kwargs):
    if not created:
        return

    channel_layer = get_channel_layer()
    clase_id = instance.clase_id

    Clase = apps.get_model("clases", "Clase")

    try:
        clase = Clase.objects.get(id_clase=clase_id)
    except Clase.DoesNotExist:
        return

    inscritos = (
        InscritoClase.objects
        .filter(clase_id=clase_id)
        .select_related("usuario")
    )

    html = render_to_string(
        "inscritos/partials/tabla_inscritos.html",
        {
            "clase": clase,
            "inscritos": inscritos,
        }
    )

    async_to_sync(channel_layer.group_send)(
        f"inscritos_clase_{clase_id}",
        {
            "type": "inscritos_update",
            "action": "refresh",
            "html": html,
            "count": inscritos.count(),
        }
    )

# signals.py - Clases Virtuales
@receiver(post_save, sender=ClaseVirtual)
def clase_virtual_post_save(sender, instance, created, **kwargs):
    channel_layer = get_channel_layer()
    clase_id = instance.clase_id

    # Importar el modelo Clase
    Clase = apps.get_model("clases", "Clase")
    
    try:
        clase = Clase.objects.get(id_clase=clase_id)
    except Clase.DoesNotExist:
        return

    # Obtener clases virtuales ordenadas
    clases_virtuales = ClaseVirtual.objects.filter(
        clase_id=clase_id
    ).order_by('fecha_de_clase')

    # Obtener el rol del usuario desde la request (si existe) o establecer un valor por defecto
    # Como estamos en una señal, no tenemos acceso directo al request
    # Vamos a pasar rol=3 por defecto para mostrar los botones, y en el cliente lo ocultaremos si no es rol 3
    html = render_to_string(
        "clases_virtuales/partials/lista_clases_virtuales.html",
        {
            "clase": clase,
            "clases_virtuales": clases_virtuales,
            "rol": 3  # Pasamos rol=3 para que renderice los botones
        }
    )

    # Enviar actualización a través del WebSocket
    async_to_sync(channel_layer.group_send)(
        f"clases_virtuales_{clase_id}",
        {
            "type": "clases_virtuales_update",
            "action": "refresh",
            "html": html,
            "count": clases_virtuales.count(),
        }
    )


@receiver(post_delete, sender=ClaseVirtual)
def clase_virtual_post_delete(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    clase_id = instance.clase_id

    # Importar el modelo Clase
    Clase = apps.get_model("clases", "Clase")
    
    try:
        clase = Clase.objects.get(id_clase=clase_id)
    except Clase.DoesNotExist:
        return

    # Obtener clases virtuales ordenadas
    clases_virtuales = ClaseVirtual.objects.filter(
        clase_id=clase_id
    ).order_by('fecha_de_clase')

    # Pasar rol=3 por defecto
    html = render_to_string(
        "clases_virtuales/partials/lista_clases_virtuales.html",
        {
            "clase": clase,
            "clases_virtuales": clases_virtuales,
            "rol": 3  # Pasamos rol=3 para que renderice los botones
        }
    )

    # Enviar actualización a través del WebSocket
    async_to_sync(channel_layer.group_send)(
        f"clases_virtuales_{clase_id}",
        {
            "type": "clases_virtuales_update",
            "action": "refresh",
            "html": html,
            "count": clases_virtuales.count(),
        }
    )



@receiver(post_save, sender=ComentarioClase)
@receiver(post_delete, sender=ComentarioClase)
def comentarios_update(sender, instance, **kwargs):
    channel_layer = get_channel_layer()
    clase_id = instance.clase_id

    Clase = apps.get_model("clases", "Clase")
    try:
        clase = Clase.objects.get(id_clase=clase_id)
    except Clase.DoesNotExist:
        return

    comentarios = ComentarioClase.objects.filter(
        clase_id=clase_id
    ).select_related("usuario").order_by("fecha_creacion")

    # ⚠️ No hay request → pasamos usuario_id=None
    html = render_to_string(
        "comentarios/partials/comentarios_list.html",
        {
            "comentarios": comentarios,
            "usuario_id": None
        }
    )

    async_to_sync(channel_layer.group_send)(
        f"comentarios_clase_{clase_id}",
        {
            "type": "comentarios_update",
            "action": "refresh",
            "html": html
        }
    )