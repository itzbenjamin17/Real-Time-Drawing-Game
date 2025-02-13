from django.shortcuts import render
from django.http import HttpResponseForbidden

# Create your views here.
def index(request, *args, **kwargs):
    return render(request, 'frontend/index.html')

def drawing(request, *args, **kwargs):
    return render(request, 'frontend/drawing.html')

def showLeaderboard(request, *args, **kwargs):
    return render(request, 'frontend/leaderboard.html')

def createRoom(request):
    # Check if the request is a POST request
    if request.method == 'POST':
        username = request.POST.get('username', None)
        return render(request, 'frontend/create room.html', {'username': username})
    else:
        # If accessed directly via GET, deny access
        return HttpResponseForbidden("You cannot access this page directly.")