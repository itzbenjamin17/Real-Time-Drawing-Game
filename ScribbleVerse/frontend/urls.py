from django.urls import path
from .views import index
from .views import game_settings
from .views import leaderboard

urlpatterns = [
    path('', index),
    path('game-settings/', game_settings, name='game-settings'),
    path('leaderboard/', leaderboard, name='leaderboard'),
]
