from django.urls import re_path
from api.consumers import ScribbleConsumer

websocket_urlpatterns = [
    re_path(r'ws/game/(?P<room_name>\w+)/$', ScribbleConsumer.as_asgi()),
]
