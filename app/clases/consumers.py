import json
from channels.generic.websocket import AsyncWebsocketConsumer

from asgiref.sync import sync_to_async





class InscritosConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Obtener el ID de la clase desde la URL
        self.clase_id = self.scope['url_route']['kwargs']['clase_id']
        self.room_group_name = f'inscritos_clase_{self.clase_id}'
        
        # Unirse al grupo específico de la clase
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()

    async def disconnect(self, close_code):
        # Salir del grupo al desconectarse
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def inscritos_update(self, event):
        # Enviar actualización a todos los clientes del grupo
        await self.send(text_data=json.dumps({
            "action": event["action"],
            "html": event["html"],
            "count": event["count"]
        }))
        


class ClasesVirtualesConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Obtener el ID de la clase desde la URL
        self.clase_id = self.scope['url_route']['kwargs']['clase_id']
        self.room_group_name = f'clases_virtuales_{self.clase_id}'
        
        # Unirse al grupo específico de la clase
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        
        await self.accept()
        print(f"WebSocket conectado para clases virtuales de clase {self.clase_id}")

    async def disconnect(self, close_code):
        # Salir del grupo al desconectarse
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        print(f"WebSocket desconectado para clases virtuales de clase {self.clase_id}")

    async def clases_virtuales_update(self, event):
        # Enviar actualización a todos los clientes del grupo
        await self.send(text_data=json.dumps({
            "action": event["action"],
            "html": event["html"],
            "count": event["count"]
        }))
 
 
class ComentariosConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.clase_id = self.scope['url_route']['kwargs']['clase_id']
        self.room_group_name = f'comentarios_clase_{self.clase_id}'

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    async def comentarios_update(self, event):
        await self.send(text_data=json.dumps({
            "action": event["action"],
            "html": event["html"],
        }))