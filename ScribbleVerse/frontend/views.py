from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.
def index(request, *args, **kwargs):
    return render(request, 'frontend/index.html')

def leaderboard(request):
    return render(request, 'frontend/leaderboard.html')

def game_settings(request):
    return render(request, 'frontend/gameSettings.html')
