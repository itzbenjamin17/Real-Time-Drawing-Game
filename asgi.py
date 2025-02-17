"""
ASGI config for ScribbleVerse project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os

from django.core.asgi import get_asgi_application

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.auth import AuthMiddlewareStack
from channels.security.websocket import AllowedHostsOriginValidator

#application = ProtocolTypeRouter({
#    "http": get_asgi_application(),
#    "websocket": AuthMiddlewareStack(
#        URLRouter(websocket_urlpatterns)
#    ),
#})

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ScribbleVerse.settings')

django_asgi_app = get_asgi_application()

from ScribbleVerse.routing import websocket_urlpatterns

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(URLRouter(websocket_urlpatterns))
    ),
})