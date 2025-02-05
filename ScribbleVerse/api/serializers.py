from rest_framework import serializers
from .models import Room

# This class turns the room model into a JSON object that can be read by the frontend
class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'
