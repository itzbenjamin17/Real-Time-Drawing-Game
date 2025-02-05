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
    created_at = models.DateTimeField(auto_now_add=True) 