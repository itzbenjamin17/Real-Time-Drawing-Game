from django.urls import path
from .views import *

urlpatterns = [
    # List all rooms
    path('rooms/', RoomView.as_view(), name='room-list'),
    
    # Validate if a room code exists
    path('validate-room-code/<str:code>/', ValidateRoomCode.as_view(), name='validate-room-code'),
    
    # Create a new room
    path('create-room/', CreateRoom.as_view(), name='create-room'),
    
    # Retrieve details of a specific room by its code
    path('get-room/<str:code>/', GetRoom.as_view(), name='get-room'),
    
    # Add a player to a room
    path('add-player/', AddPlayer.as_view(), name='add-player'),
    
    # Start a new round in a specific room
    path('start-round/', StartRound.as_view(), name='start-round'),
    
    # Retrieve all players in a specific room
    path('get-players-in-room/<str:code>/', GetPlayersInRoom.as_view(), name='get-players-in-room'),
    
    # Update player score or state (e.g., is_drawing attribute)
    path('update-player/<int:pk>/', UpdatePlayer.as_view(), name='update-player'),
]