import json
from channels.generic.websocket import AsyncWebsocketConsumer

class UsuariosConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        await self.channel_layer.group_add("usuarios_group", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("usuarios_group", self.channel_name)

    async def usuarios_update(self, event):
        await self.send(text_data=json.dumps({
            "action": event["action"],
            "html": event["html"]
        }))