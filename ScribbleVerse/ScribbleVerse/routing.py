from django.urls import re_path
from api.consumers import DrawingConsumer

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<room_name>\w+)/$', DrawingConsumer.as_asgi()),
]
