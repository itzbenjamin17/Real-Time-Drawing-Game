from channels.generic.websocket import WebsocketConsumer
from django.shortcuts import get_object_or_404
from django.template.loader import render_to_string
from asgiref.sync import async_to_sync
import json
from .models import *

class ChatroomConsumer(WebsocketConsumer):
    def connect(self):
        self.user = self.scope['user']
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.room = get_object_or_404(ChatGroup, group_name=self.room_name)

        async_to_sync(self.channel_layer.group_add)(
            self.room_name, self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_name, self.channel_name
        )

    def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
        except json.JSONDecodeError:
            return
        
        if self.user.is_anonymous:
            return

        body = text_data_json['body']
        if not body:
            return

        message = GroupMessage.objects.create(
            body = body,
            author = self.user,
            group = self.room
        )

        event = {
            'type': 'message_handler',
            'message_id': message.id,
        }

        async_to_sync(self.channel_layer.group_send)(
            self.room_name, event
        )

    def message_handler(self, event):
        message_id = event['message_id']
        message = GroupMessage.objects.get(id=message_id)

        context = {
            'message': message,
            'author': self.user,
        }
        html = render_to_string("a_rtchat/partials/chat_message_p.html", context=context)
        self.send(text_data=html)

class DrawingConsumer(WebsocketConsumer):
    def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['room_code']
        self.room = get_object_or_404(Room, code=self.room_code)
        
        async_to_sync(self.channel_layer.group_add)(
            self.room_code, self.channel_name
        )

        self.accept()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.room_code, self.channel_name
        )

    def receive(self, text_data):
        try:
            text_data_json = json.loads(text_data)
        except json.JSONDecodeError:
            return

        event = {
            'type': 'canvas_update',
            'data': text_data_json
        }

        if text_data_json.get("type") == "canvas_update":
            async_to_sync(self.channel_layer.group_send)(
                self.room_code, event
            )

    def canvas_update(self, event):
        self.send(text_data=json.dumps(event["data"]))