from rest_framework import serializers
from .models import Room, Player, Round

# Serializer for the Room model
class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'  # Includes all fields in the Room model

# Serializer for the Player model
class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'  # Includes all fields in the Player model

# Serializer for the Round model
class RoundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Round
        fields = '__all__'  # Includes all fields in the Round model
