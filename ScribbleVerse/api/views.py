from django.shortcuts import render
from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Room, Player, Round
from .serializers import RoomSerializer, PlayerSerializer, RoundSerializer


# Example of how frontend uses the ValidateRoomCode 'fetch(`/api/validate-room-code/${roomCode}/`)'
# Takes in all the rooms in the database and turns them into a JSON object and sends it to the frontend
class RoomView(generics.ListAPIView):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

# Validate if a room code exists
class ValidateRoomCode(APIView):
    def get(self, request, code):
        # Check if the provided code exists in the database
        if Room.objects.filter(code=code).exists():
            return Response({"valid": True}, status=status.HTTP_200_OK)
        return Response({"valid": False}, status=status.HTTP_404_NOT_FOUND)

# Create a new room
class CreateRoom(APIView):
    def post(self, request):
        room_code = Room.generate_code()
        request.data["code"] = room_code
        serializer = RoomSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Retrieve details of a specific room by its code
class GetRoom(APIView):
    def get(self, request, code):
        try:
            room = Room.objects.get(code=code)
            serializer = RoomSerializer(room)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

# Add a player to a room
class AddPlayer(APIView):
    def post(self, request):
        serializer = PlayerSerializer(data=request.data)
        if serializer.is_valid():
            room_code = request.data.get("room")
            try:
                room = Room.objects.get(code=room_code)
                if room.num_of_players < 10:  # Example: max players limit is 10
                    serializer.save(room=room)
                    room.num_of_players += 1
                    room.save()
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                else:
                    return Response({"error": "Room is full"}, status=status.HTTP_400_BAD_REQUEST)
            except Room.DoesNotExist:
                return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Start a new round in a specific room
class StartRound(APIView):
    def post(self, request):
        serializer = RoundSerializer(data=request.data)
        if serializer.is_valid():
            try:
                room_code = request.data.get("room")
                room = Room.objects.get(code=room_code)
                round_number = Round.objects.filter(room=room).count() + 1
                serializer.save(room=room, round_number=round_number)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Room.DoesNotExist:
                return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Retrieve all players in a specific room
class GetPlayersInRoom(APIView):
    def get(self, request, code):
        try:
            room = Room.objects.get(code=code)
            players = Player.objects.filter(room=room)
            serializer = PlayerSerializer(players, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Room.DoesNotExist:
            return Response({"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND)

# Update player score or state (e.g., is_drawing attribute)
class UpdatePlayer(APIView):
    def patch(self, request, pk):  # pk is the primary key of the player
        try:
            player = Player.objects.get(pk=pk)
            serializer = PlayerSerializer(player, data=request.data, partial=True)  # Allows partial updates
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Player.DoesNotExist:
            return Response({"error": "Player not found"}, status=status.HTTP_404_NOT_FOUND)

