from django.db import models
from django.utils import timezone
import random
import string



def generate_code():
    ''' This function will generate a unique code for the room when create room is clicked'''
    length = 6
    while True:
        code = ''.join(random.choices(string.ascii_uppercase, k=length))
        # Makes sure no other room has the same code
        if Room.objects.filter(code=code).exists():
            break
    return code

# Create your models here.
                                  
# This is the class that will be used to create the database table for the rooms
# More attributes need to be added  
class Room(models.Model):
    code = models.CharField(max_length=6, unique=True)
    host = models.CharField(max_length=50, default="")
    num_of_rounds = models.IntegerField(default=3)
    num_of_players = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)


class Round(models.Model):
    word = models.CharField(max_length=50)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    is_over = models.BooleanField(default=False)
    round_number = models.IntegerField(default=1)
    time_to_guess = models.IntegerField(default=60)
    current_time = models.IntegerField(default=0)
    current_drawer = models.ForeignKey('Player', on_delete=models.SET_NULL, null=True, blank=True)    


class Player(models.Model):
    score = models.IntegerField(default=0)
    name = models.CharField(max_length=50)
    is_drawing = models.BooleanField(default=False)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
