# Use this to run the server:
# python init_db.py (if there is no instance folder)
# flask --app main.py run --host=0.0.0.0 --port=5000

from flask import Flask, render_template, request, session, redirect, url_for, jsonify
from flask_socketio import join_room, leave_room, send, SocketIO
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Resource, Api
import random
import base64
from string import ascii_uppercase

app = Flask(__name__)
app.config["SECRET_KEY"] = "test"
app.config["SESSION_TYPE"] = "filesystem"
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
Session(app)

socketio = SocketIO(app)
api = Api(app)
db = SQLAlchemy(app)

rooms = {}

def generate_unique_code(Length):
    while True:
        code = ""
        for _ in range(Length):
            code += random.choice(ascii_uppercase)

        if code not in rooms:
            break

    return code

# ----------------- Database Models ----------------- #
class Room(db.Model):
    """
    Room table:
    - id | code | host | num_of_rounds | num_of_players | created_at
    - Defines a one-to-many relationship with Player and Round tables.
    - Players and Rounds are deleted when a Room is deleted.
    - Can access the room a player is in using player = Player.query.first() then using player.room
    - Can access the players in a room using room = Room.query.first() then using room.players
    - Delete orphan is used to delete players and rounds when a room is deleted.
    """
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(6), unique=True, nullable=False)
    host = db.Column(db.String(50), nullable=False)
    num_of_rounds = db.Column(db.Integer, default=3)
    num_of_players = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=db.func.now())

    players = db.relationship('Player', backref='room', cascade="all, delete-orphan", lazy=True)
    rounds = db.relationship('Round', backref='room', cascade="all, delete-orphan", lazy=True)

class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    score = db.Column(db.Integer, default=0)
    is_drawing = db.Column(db.Boolean, default=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)

class Round(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    word = db.Column(db.String(50), nullable=False)
    round_number = db.Column(db.Integer, default=1)
    is_over = db.Column(db.Boolean, default=False)
    time_to_guess = db.Column(db.Integer, default=60)
    current_time = db.Column(db.Integer, default=0)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)



# ----------------- API Endpoints ----------------- #
# Example use of the API:
# - To get all the players in a room:
#    fetch('/api/get-players/ABC123/')
#       .then(response => {
#           if (!response.ok) {
#               throw new Error("Room not found");
#           }
#           return response.json();
#        })
#        .then(players => {
#           console.log("Players in room:", players);
#        })
#        .catch(error => {
#           console.error("Error:", error.message);
#         });

class RoomView(Resource):
    '''
    Returns a list of all rooms.
    '''
    def get(self):
        rooms = Room.query.all()
        return jsonify([{"id": room.id, "code": room.code, "host": room.host} for room in rooms])

class ValidateRoomCode(Resource):
    ''' 
    Input: A room code
    Returns {"valid": true}, 200 if room exists, else {"valid": false}, 404.
    '''
    def get(self, code):
        room_exists = Room.query.filter_by(code=code).first() is not None
        return {"valid": room_exists}, 200 if room_exists else 404

class CreateRoom(Resource):
    '''
    Input: JSON with a host name ("host") and an optional ("num_of_rounds").
    Posts a room in the database and returns the room's id and code, along with a 201 status code. (Meaning created)
    If no num_of_rounds is provided, it defaults to 3.
    '''
    def post(self):
        data = request.get_json()
        room_code = generate_unique_code(6)
        new_room = Room(code=room_code, host=data.get("host"), num_of_rounds=data.get("num_of_rounds", 3))
        db.session.add(new_room)
        db.session.commit()
        return {"id": new_room.id, "code": new_room.code}, 201

class GetRoom(Resource):
    '''
    Input: A room code
    Returns the room's id, code, and host, along with a 200 status code.
    If the room does not exist, returns {"error": "Room not found"}, 404.
    '''
    def get(self, code):
        room = Room.query.filter_by(code=code).first()
        if not room:
            return {"error": "Room not found"}, 404
        return {"id": room.id, "code": room.code, "host": room.host}, 200

class AddPlayer(Resource):
    '''
    Input: a room code ("room") and a player name ("name").
    Returns the player's id and a 201 status code. (Meaning created)
    If the room does not exist, returns {"error": "Room not found"}, 404.
    If the room is full, returns {"error": "Room is full"}, 400.
    '''
    def post(self):
        data = request.get_json()
        room_code = data.get("room")
        room = Room.query.filter_by(code=room_code).first()
        if not room:
            return {"error": "Room not found"}, 404
        if room.num_of_players >= 10:
            return {"error": "Room is full"}, 400
        
        new_player = Player(name=data.get("name"), room_id=room.id)
        room.num_of_players += 1
        db.session.add(new_player)
        db.session.commit()
        return {"id": new_player.id}, 201

class GetPlayersInRoom(Resource):
    '''
    Input: A room code
    Returns a list of players in the room, along with a 200 status code.
    If the room does not exist, returns {"error": "Room not found"}, 404.
    '''
    def get(self, room_code):
        room = Room.query.filter_by(code=room_code).first()
        
        if not room:
            return {"error": "Room not found"}, 404
        
        players = Player.query.filter_by(room_id=room.id).all()
        players_data = [{"id": player.id, "name": player.name, "score": player.score} for player in players]      
        return jsonify(players_data)

# Register API endpoints with Flask-RESTful
api.add_resource(RoomView, '/api/rooms/')
api.add_resource(ValidateRoomCode, '/api/validate-room-code/<string:code>/')
api.add_resource(CreateRoom, '/api/create-room/')
api.add_resource(GetRoom, '/api/get-room/<string:code>/')
api.add_resource(AddPlayer, '/api/add-player/')
api.add_resource(GetPlayersInRoom, '/api/get-players-in-room/<string:room_code>/')

# ----------------- Routes ----------------- #

@app.route("/", methods = ["POST", "GET"])
def index():
    session.clear()

    try:
        session["room"] = room
        session["name"] = name
    except:
        pass

    if request.method == "POST":
        
        name = request.form.get("name")
        code = request.form.get("code")
        join = request.form.get("join", False)
        create = request.form.get("create", False)

        room = code

        session["room"] = room
        session["name"] = name

        print(name, code, join, create)

        if not name:
            return render_template("index.html", error="Please enter a name.", code=code, name=name)
        
        if join != False:
            if not code:#and not code:
                return render_template("index.html", error="Please enter a room code.", code=code, name=name)
            
            if rooms[room]["members"] > rooms[room]["maxPlayers"]:
                return render_template("index.html", error="Room is full", code=code, name=name)
            
            if name in rooms[room]["players"]:
                return render_template("index.html", error="Username is already taken", code=code, name=name)
                
        if create != False:
            return redirect(url_for("create_room"))
        
        if code not in rooms:
            return render_template("index.html", error="Room does not exist.", code=code, name=name)
        
        print("After setting session:", session)

        return redirect(url_for("room"))

    return render_template("index.html")

@app.route("/room", methods=["GET", "POST"])
def room():
    name = session.get("name")
    if not name:
        return redirect(url_for("index"))

    if request.method == "POST":
        room = request.form.get("code")        

        if not room:
            room = generate_unique_code(4)
            rooms[room] = {
                "members": 0,
                "messages": [],
                "players": []
            }
        session["room"] = room

    room = session.get("room")
    if room is None or session.get("name") is None or room not in rooms:
        print(room)
        print(session.get("name"))
        print(room in rooms)
        print("Room is missing.")
        return redirect(url_for("index"))
    
    if 'players' not in rooms[room]:
        rooms[room]["players"] = []

    if name not in rooms[room]["players"]:
        rooms[room]["players"].append(name)

    rooms[room]["members"] += 1
    
    print(f"Emitting players list to room {room}: {rooms[room]['players']}")
    socketio.emit("username", rooms[room]["players"])

    host = rooms[room]["players"][0] == name
    print(f"Host: {host}")
    print(f"Players: {rooms[room]['players']}")

    return render_template("room.html", code=room, messages=rooms[room]["messages"], host=host)

@app.route("/create-room", methods=["GET", "POST"])
def create_room():
    print("Session in create_room():", session)
    name = session.get("name")
    if not name:
        return redirect(url_for("index"))

    room = generate_unique_code(4)
    rooms[room] = {
        "members": 0,
        "messages": []
    }
    session["room"] = room

    if request.method == "POST":
        try:
            maxPlayers = request.form.get("maxPlayers")
            maxPlayers = int(maxPlayers)
            rooms[room]["maxPlayers"] = maxPlayers
        except:
            rooms[room]["maxPlayers"] = 10
        try:
            rounds = request.form.get("rounds")
            rounds = int(rounds)
            rooms[room]["rounds"] = rounds
        except:
            rooms[room]["rounds"] = 5
        try:
            roundDuration = request.form.get("roundDuration")
            roundDuration = int(roundDuration)
            rooms[room]["roundDuration"] = roundDuration
        except:
            rooms[room]["roundDuration"] = 60
        rooms[room]["customWordsList"] = request.form.get("customWords")
        print(rooms[room])
        return jsonify({'status': 'success', 'room': room})

    return render_template("create room.html", code=room, messages=rooms[room]["messages"])

@app.route("/join-room", methods=["POST"])
def join_room(room):
    return render_template("room.html", code=room, messages=rooms[room]["messages"])

@app.route("/game", methods=["GET", "POST"])
def game():
    return render_template("drawing.html")

@app.route("/leaderboard", methods=["GET", "POST"])
def leaderboard():
    return render_template("leaderboard.html")

@app.route("/report", methods=["GET", "POST"])
def report():
    return render_template("report.html")

# ----------------- Real Time Connection ----------------- #

@socketio.on("message")
def message(data):
    room = session.get("room")
    if room not in rooms:
        return

    content = {
        "name": session.get("name"),
        "message": data["data"]
    }

    print("Content:", content)

    socketio.emit("message", content)
    rooms[room]["messages"].append(content)
    print("Messages:", rooms[room]["messages"])
    print(f"{session.get('name')} said: {data['data']}")

@socketio.on("start")
def startGame():
    name = session.get("name")
    room = session.get("room")
    if room not in rooms or len(rooms[room]["players"]) == 0:
        return url_for("index")
    
    first_drawer = rooms[room]["players"][0]
    content = {
        "username": name,
        "drawer": first_drawer
    }
    
    print("Starting...")
    socketio.emit("start")

@socketio.on("request_drawer")
def request_drawer():
    name = session.get("name")
    room = session.get("room")
    if room not in rooms or len(rooms[room]["players"]) == 0:
        return url_for("index")
    
    first_drawer = rooms[room]["players"][0]
    content = {
        "username": name,
        "drawer": first_drawer
    }
    
    print("Updating drawer...")
    socketio.emit("update_drawer", content)

@socketio.on("new_round")
def new_round():
    room = session.get("room")
    if room not in rooms:
        return
    
    current_drawer = rooms[room].get("drawer", None)
    players = rooms[room]["players"]

    if current_drawer and current_drawer in players:
        current_index = players.index(current_drawer)
        next_drawer = players[(current_index + 1) % len(players)]
    else:
        next_drawer = players[0]

    rooms[room]["drawer"] = next_drawer
    socketio.emit("update_drawer", {"drawer": next_drawer}, to=room)

@socketio.on("connect")
def connect(auth):
    room = session.get("room")
    name = session.get("name")
    if not room or not name:
        return
    if room not in rooms:
        leave_room(room)
        return
    
    join_room(room)
    send({"name": name, "message": "has entered the room"}, to=room)

    if name not in rooms[room]["players"]:
        rooms[room]["players"].append(name)
        print("List of Players:", rooms[room]["players"])

    rooms[room]["members"] += 1
    print(f"{name} joined room {room}")
    print(f"Assigning username {name} to session ID: {request.sid}")

    socketio.emit("username", rooms[room]["players"]) # Sends an array containing all usernames in a lobby.
    socketio.emit("individual_username", name, room=request.sid) # Sends a string consisting of an individual username.

@socketio.on("drawing_update")
def drawing_update(data):
    print("Sending drawing update...")
    room = session.get("room")

    image_data = data.get("image", "")
    if not image_data.startswith("data:image/png;base64,"):
        print("Error: Invalid Base64 format!")
        return

    try:
        base64_data = image_data.split(",")[1]
        base64.b64decode(base64_data)
    except Exception as error:
        print("Error decoding Base64:", error)
        return

    print(f"Received drawing from {session.get('name')} in room {room}.")

    socketio.emit("display_drawing", {"image": data["image"]})
    print("Emitted display_drawing event to room:", room)

@socketio.on("disconnect")
def disconnect():
    room = session.get("room")
    name = session.get("name")
    leave_room(room)

    if room in rooms and name in rooms[room]["players"]:
        rooms[room]["players"].remove(name)
        rooms[room]["members"] -= 1
        if rooms[room]["members"] <= 0:
            del rooms[room]
    
    send({"name": name, "message": "has left the room"}, to=room)
    print(f"{name} has left the room {room}")

    socketio.emit("update_players", rooms[room]["players"])

if __name__ == "__main__":
    socketio.run(app, debug = True)

# Use this to run the server:
# python init_db.py (if there is no instance folder)
# flask --app main.py run --host=0.0.0.0 --port=5000