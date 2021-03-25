# django library
from django.db import IntegrityError
# models
from django.contrib.auth.models import User
from .models import *
# frameworks
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_jwt.settings import api_settings
# serializers
from .serializers import UserSerializer

# AUTHETICATION VIEWS
class getuser(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    # get function from rest framework automatically decodes 
    # token and turns request into a rest get request instance
    # which includes the user
    def get(self, request, format=None):
        print('---------------------------------')
        print('Running getuser(APIView):')
        print(f'->request user: {request.user}')
        serializer = UserSerializer(request.user)
        response = serializer.data
        print (f'->response: {response}')
        return Response(response, status=status.HTTP_202_ACCEPTED)

class signup(APIView):
    permission_classes = (permissions.AllowAny,)
    def post (self, request, format=None):
        # Log incoming data to console
        print('---------------------------------')
        print('running signup(APIView):')
        print(f'->request body: {request.data}')
        # Destructure the user data from the request
        username = request.data.get("username")
        password = request.data.get("password")
        try: 
            # Try to create new user with the data
            newuser = User.objects.create_user(username = username, password = password)
            newuser.save()
            # Get payload handler and encoder methods from DRF JWT package
            jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
            jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
            # Handle payload (the new user model)
            payload = jwt_payload_handler(newuser)
            # Encode Payload and generate token 
            token = jwt_encode_handler(payload)
            # Create response
            response = {
                'token' : token, 
                "username" : newuser.username
            }
            print (f'->response: {response}')
            return Response(response, status=status.HTTP_201_CREATED)
            # In case username is already taken
        except IntegrityError:
            return Response({'error': 'Username already taken'},status=status.HTTP_200_OK)

# WEBRTC SIGNALING VIEWS
class logpeer(APIView):
  permission_classes = (permissions.IsAuthenticated,)
  def post (self, request, format=None):
    # Log incoming data to console
    print('---------------------------------')
    print('running logpeer(APIView):')
    print(f'->request body: {request.data}')
    print(request.user)
    # Destructure the user data from the request
    action = request.data.get("action")
    username = request.data.get("username")
    peerID = request.data.get("peerID")
    roomID = request.data.get("roomID")
    if (request.user.username == username):
      if (action == 'login'):
        try:
          room = Room.objects.get(roomID = roomID)
          newpeer = Peer.objects.create(user= User.objects.get(username = username), peerID = peerID, room= room)
          return Response({'success': f'Peer : {peerID} logged into room : {roomID}'}, status=status.HTTP_201_CREATED)
        except IntegrityError:
          return Response({'error': 'Peer already logged in'},status=status.HTTP_200_OK)
      elif (action == 'logout'):
        try:
          peer = Peer.objects.get(user= User.objects.get(username = username), peerID = peerID)
          peer.delete()
          return Response({'success': f'Peer {peerID} logged out'}, status=status.HTTP_201_CREATED)
        except IntegrityError:
          return Response({'error': 'Peer not found'},status=status.HTTP_200_OK)
    else:
      return Response({'error': 'Acess Denied'},status=status.HTTP_401_UNAUTHORIZED)

class getroom(APIView):
  permission_classes = (permissions.IsAuthenticated,)
  def get(self, request, format=None):
    # get query parameters in the GET request
    getall = request.GET.get('getall','false')
    roomID = request.GET.get('roomID', '')
    # create response
    if (getall == 'false'):
      print('---------------------------------')
      print('running getroom(APIView):')
      print(f'->request for room: {roomID}')
      try: 
        room = Room.objects.get(roomID= roomID)
        # create an array of objects for messages
        querySet = room.messages.all()
        if (querySet):
          messages = [message.serialize() for message in querySet]
        else:
          messages = []
        # create response
        response = {'success': f"Room {roomID} get request complete", **room.serialize(), 'messages': messages}
        return Response(response, status=status.HTTP_202_ACCEPTED)
      except:
          return Response({'error': 'Room not found'},status=status.HTTP_200_OK)
    else:
      print('---------------------------------')
      print('running getroom(APIView):')
      print(f'->request for all rooms')
      try: 
        querySet = Room.objects.all()
        print(querySet)
        rooms = [room.serialize() for room in querySet]
        response = {'success': f"All rooms get request complete", 'rooms': rooms}
        return Response(response, status=status.HTTP_202_ACCEPTED)
      except:
          return Response({'error': 'No rooms found'},status=status.HTTP_200_OK)

# POST VIEWS
class room(APIView):
  permission_classes = (permissions.IsAuthenticated,)
  def post (self, request, format=None):
    # Log incoming data to console
    print('---------------------------------')
    print('running room(APIView) POST:')
    print(f'->request body: {request.data}')
    print(request.user)
    # Destructure the user data from the requestm
    action = request.data.get("action")
    roomID = request.data.get("roomID")
    description = request.data.get("description")
    if (action == 'create'):
      try:
        newroom = Room.objects.create(roomID= roomID, description=description)
        return Response({'success': f"Room created with id: {roomID}"}, status=status.HTTP_201_CREATED)
      except IntegrityError:
        return Response({'error': 'Room already exists.'},status=status.HTTP_200_OK)
    elif (action == 'delete'):
      try:
        room = Room.objects.get(roomID= roomID)
        room.delete()
        return Response({'success': f"Room deleted with id: {roomID}"}, status=status.HTTP_201_CREATED)
      except IntegrityError:
        return Response({'error': 'Room not found'},status=status.HTTP_200_OK)

class message(APIView):
  permission_classes = (permissions.IsAuthenticated,)
  def post(self, request, format=None):
    # Log incoming data to console
    print('---------------------------------')
    print('running room(APIView) POST:')
    print(f'->request body: {request.data}')
    try:
      roomID = request.data.get("roomID")
      username = request.data.get("username")
      body = request.data.get("body")
      newMessage = Message(room = Room.objects.get(roomID = roomID), user = User.objects.get(username = username), body = body)
      newMessage.save()
      response = {'success': 'Message created'}
      return Response(response, status=status.HTTP_201_CREATED)
    except :
      return Response({'error': 'There was an error'}, status=status.HTTP_200_OK)
