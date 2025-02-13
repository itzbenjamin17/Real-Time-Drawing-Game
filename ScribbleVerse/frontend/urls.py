from django.urls import path
from . import views


urlpatterns = [
    path('', views.index),
    path('drawing/', views.drawing),
    path('create-room/', views.createRoom)
]
