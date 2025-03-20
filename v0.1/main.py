# Use this to run the server:
# python main.py

from flask import Flask, render_template, request, session, redirect, url_for, jsonify
from flask_socketio import join_room, leave_room, send, SocketIO
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from flask_restful import Resource, Api
import random
import base64
import time
import math
from string import ascii_uppercase
import json

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
    '''
    Used to generate a unique code when a room is created.
    '''
    while True:
        code = ""
        for _ in range(Length):
            code += random.choice(ascii_uppercase)

        if code not in rooms:
            break

    return code


def sec_to_timer(secs):
    '''
    Used to calculate the timer parameters for drawing and guessing, given a duration in seconds.
    '''
    mins = secs // 60
    ten_seconds = (secs % 60) // 10
    seconds = secs % 10

    return (mins, ten_seconds, seconds)


def timer_to_sec(mins, ten_seconds, seconds):
    '''
    Used to convert the timer parameters back into seconds.
    '''
    secs = (mins * 60) + (ten_seconds * 10) + seconds

    return secs


def calc_score(timer, room, max_score=100, k=1):
    '''
    Used to calculate the score a player gets upon guessing the word correctly.
    Requires the timer data from the frontend, as well as the room code.
    The faster the guess was, the higher the score.
    '''
    duration = rooms[room]["roundDuration"]
    time_ratio = timer / duration

    drawer = rooms[room]["current_drawer"]

    additional_score = max_score * math.exp(-k * (1 - time_ratio))
    drawer_score = round((additional_score * 0.5))

    return round(additional_score), drawer_score

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
    num_of_rounds = db.Column(db.Integer, default=5)
    current_round = db.Column(db.Integer, default=1)
    num_of_players = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=db.func.now())

    players = db.relationship('Player', backref='room',
                              cascade="all, delete-orphan", lazy=True)


class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    score = db.Column(db.Integer, default=0)
    is_drawing = db.Column(db.Boolean, default=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)


class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    issue_type = db.Column(db.String(50), nullable=False)
    issue_description = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.now())

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
        new_room = Room(code=room_code, host=data.get("host"),
                        num_of_rounds=data.get("num_of_rounds", 3))
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
        players_data = [{"id": player.id, "name": player.name,
                         "score": player.score} for player in players]
        return jsonify(players_data)


# Register API endpoints with Flask-RESTful
api.add_resource(RoomView, '/api/rooms/')
api.add_resource(ValidateRoomCode, '/api/validate-room-code/<string:code>/')
api.add_resource(CreateRoom, '/api/create-room/')
api.add_resource(GetRoom, '/api/get-room/<string:code>/')
api.add_resource(AddPlayer, '/api/add-player/')
api.add_resource(GetPlayersInRoom,
                 '/api/get-players-in-room/<string:room_code>/')

# ----------------- Routes ----------------- #


@app.route("/", methods=["POST", "GET"])  # --- COMPLETE ---
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
        
        if create != False:
            return redirect(url_for("create_room"))

        if code not in rooms:
            return render_template("index.html", error="Room does not exist.", code=code, name=name)

        if join != False:
            if not code:  # and not code:
                return render_template("index.html", error="Please enter a room code.", code=code, name=name)

            if rooms[room]["members"] > rooms[room]["maxPlayers"]:
                return render_template("index.html", error="Room is full", code=code, name=name)

            if name in rooms[room]["players"]:
                return render_template("index.html", error="Username is already taken", code=code, name=name)

        print("After setting session:", session)

        return redirect(url_for("room"))

    return render_template("index.html")


@app.route("/room", methods=["GET", "POST"])  # --- COMPLETE ---
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
        rooms[room]["sid_map"] = {}

    if name not in rooms[room]["players"]:
        rooms[room]["players"].append(name)

    rooms[room]["members"] += 1

    print(f"Emitting players list to room {room}: {rooms[room]['players']}")
    socketio.emit("username", rooms[room]["players"])

    host = rooms[room]["players"][0] == name
    print(f"Host: {host}")
    print(f"Players: {rooms[room]['players']}")

    return render_template("room.html", code=room, messages=rooms[room]["messages"], host=host)


@app.route("/create-room", methods=["GET", "POST"])  # --- COMPLETE ---
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

        times = sec_to_timer(rooms[room]["roundDuration"])
        count = 0
        for time in ["mins", "ten_seconds", "seconds"]:
            rooms[room][time] = times[count]
            count += 1

        defaultWords = ["horse", "suitcase", "rain", "socks", "grapes",
                        "skateboard", "dream", "cat", "fly", "monster",
                        "solar system", "hip", "fist", "fruit", "dragon",
                        "penguin", "trap", "glove", "tail", "jellyfish", "snail",
                        "chimney", "lolipop", "rival", "caterpillar", "football",
                        "computer", "camera", "sun", "grandpa", "octopus", "iron", 
                        "hospital", "jungle", "astronaut", "dollar", "empty", 
                        "positive", "circus", "party", "shipwreck",  "ceiling fan", 
                        "sleeve", "hunter", "chest", "mirror", "signal", "company", 
                        "stew", "record", "zoom", "gold medal", "dodgeball", 
                        "cartoon", "time machine", "cleaning spray", "garden hose", 
                        "earthquake", "photosynthesis", "airport security", "taxi", 
                        "living room", "schedule", "knowledge", "destruction", 
                        "bar of chocolate", "cell phone charger"]
        customWords = json.loads(request.form.get("customWords"))
        defaultWords.extend(customWords)
        rooms[room]['wordList'] = defaultWords

        print(rooms[room])

        return jsonify({'status': 'success', 'room': room})

    return render_template("create room.html", code=room, messages=rooms[room]["messages"])


@app.route("/join-room", methods=["POST"])  # --- COMPLETE ---
def join_room(room):
    return render_template("room.html", code=room, messages=rooms[room]["messages"])


@app.route("/game", methods=["GET", "POST"])  # !-- INCOMPLETE --!
def game():
    name = session.get("name")
    room = session.get("room")

    rooms[room]["current_drawer"] = name # Sets the current drawer to the player rendering '/game'.
    rooms[room]["correct"] = 0 # Reset correct guesses to 0 at the start of every round.
    if 'current_round' not in rooms[room]:
        print("Creating 'current_round'...")
        rooms[room]["current_round"] = 1
    else:
        print("Incrementing 'current_round'...")
        rooms[room]["current_round"] += 1



    try:
        return render_template("drawing.html", current_drawer=rooms[room]["current_drawer"], mins=rooms[room]["mins"], ten_secs=rooms[room]["ten_seconds"], secs=rooms[room]["seconds"], scores = rooms[room]["scores"])
    except:
        scores = {username:0 for username in rooms[room]["players"] }
        return render_template("drawing.html", current_drawer=rooms[room]["current_drawer"], mins=rooms[room]["mins"], ten_secs=rooms[room]["ten_seconds"], secs=rooms[room]["seconds"], scores = scores)
    # Sends drawer data and timer parameters to the frontend. 


@app.route("/guess", methods=["GET", "POST"])  # !-- INCOMPLETE --!
def guess():
    room = session.get("room")
    time.sleep(0.5) # Adds a delay to prevent clients joining before the host.
    try:
        return render_template("Guessing.html", current_drawer=rooms[room]["current_drawer"], mins=rooms[room]["mins"], ten_secs=rooms[room]["ten_seconds"], secs=rooms[room]["seconds"], scores = rooms[room]["scores"])
    except:
        scores = {username:0 for username in rooms[room]["players"] }
        return render_template("Guessing.html", current_drawer=rooms[room]["current_drawer"], mins=rooms[room]["mins"], ten_secs=rooms[room]["ten_seconds"], secs=rooms[room]["seconds"], scores = scores)
    # Sends drawer data and timer parameters to the frontend. 


@app.route("/leaderboard", methods=["GET", "POST"])  # !-- INCOMPLETE --!
def leaderboard():
    name = session.get("name")
    room = session.get("room")

    data = {
        "scores": rooms[room]["scores"], # Sends a dictionary of scores.
        "individual_username": name 
    }

    return render_template("leaderboard.html", data=data)


@app.route("/about", methods=["GET", "POST"])  # --- COMPLETE ---
def about():
    return render_template("frp.html")


@app.route("/report", methods=["GET", "POST"])  # --- COMPLETE ---
def report():
    return render_template("lrp.html")


@app.route("/admin/reports", methods=["GET"])  # --- COMPLETE ---
def admin_reports():
    reports = Report.query.order_by(Report.timestamp.desc()).all()
    return render_template("admin reports.html", reports=reports)

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
    room = session.get('room')
    rooms[room]['playerOrder'] = rooms[room]['players'].copy()
    for sid, player in rooms[room]['sid_map'].items():
        if player == rooms[room]['players'][0]:
            socketio.emit('redirect', '/game', room=sid)
        else:
            socketio.emit('redirect', '/guess', room=sid)


@socketio.on("ready")
def sendWords():
    room = session.get('room')
    words = []
    wordList = rooms[room]['wordList'].copy()
    for i in range(3):
        word = random.choice(wordList)
        words.append(word)
        wordList.remove(word)
    socketio.emit('chooseWords', words)


@socketio.on('wordSelected')
def receiveWord(word):
    socketio.emit('wordSelected', word)


@socketio.on("reported")
def reported(data):
    print(data)

    name = data["username"]
    email = data["email"]
    issue_type = data["issue_type"]
    issue_desc = data["issue_description"]

    report = Report(
        username=name,
        email=email,
        issue_type=issue_type,
        issue_description=issue_desc
    )

    try:
        db.session.add(report)
        db.session.commit()
        print("Report added to database.")
    except Exception as e:
        db.session.rollback()
        print("Error adding report to database:", e)


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
    rooms[room]["sid_map"][request.sid] = name

    rooms[room]["members"] += 1
    print(f"{name} joined room {room}")

    socketio.emit("username", rooms[room]["players"]) # Sends a list of players in the room.
    socketio.emit("individual_username", name, room=request.sid) # Sends a string of the client's username.
    try:
        socketio.emit("scores", rooms[room]["score"]) # Sends a dictionary of the players' scores.
    except:
        scores = {username: 0 for username in rooms[room]["players"]}
        socketio.emit("scores", scores) # Sends a dictionary of the players' scores.


@socketio.on("new_round")
def new_round():
    room = session.get("room")
    players = rooms[room]["playerOrder"]
    current_drawer = rooms[room]["current_drawer"]

    next_index = (players.index(current_drawer) + 1) % len(players)
    next_drawer = players[next_index]
    drawerInRoom = False

    while not drawerInRoom:
        for sid, player in rooms[room]['sid_map'].items():
            if rooms[room]["current_round"] == int(rooms[room]["rounds"]) * len(rooms[room]["players"]):
                socketio.emit('redirect', '/leaderboard', room=sid)
            elif player == next_drawer:
                socketio.emit('redirect', '/game', room=sid)
                drawerInRoom = True
            else:
                socketio.emit('redirect', '/guess', room=sid)
        next_index = (next_index + 1) % len(players)
        next_drawer = players[next_index]


@socketio.on("drawing_update")
def drawing_update(data):
    #print("Sending drawing update...")
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

    #print(f"Received drawing from {session.get('name')} in room {room}.")

    socketio.emit("display_drawing", {"image": data["image"]})
    #print("Emitted display_drawing event to room:", room)


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


@socketio.on("calculate_score")
def handle_score_calculation(data):
    room = session.get("room")
    name = session.get("name")
    rooms[room]["correct"] += 1 # Increases the counter.
    current_drawer = rooms[room]["current_drawer"]

    # Get timer values from client
    minutes = int(data.get("minutes", 0))
    ten_seconds = int(data.get("ten_seconds", 0))
    seconds = int(data.get("seconds", 0))

    # Convert to total seconds remaining
    timer_seconds = timer_to_sec(minutes, ten_seconds, seconds)

    # Calculate score using existing function
    score, drawer_score = calc_score(timer_seconds, room)

    # Initialize scores dictionary if needed
    if "scores" not in rooms[room]:
        rooms[room]["scores"] = {
            player: 0 for player in rooms[room]["players"]}

    # Add points to player's score
    if name in rooms[room]["scores"]:
        rooms[room]["scores"][name] += score
    else:
        rooms[room]["scores"][name] = score

    if current_drawer in rooms[room]["scores"]:
        rooms[room]["scores"][current_drawer] += drawer_score
    else:
        rooms[room]["scores"][current_drawer] = drawer_score



    print(
        f"Player {name} scored {score} points (total: {rooms[room]['scores'][name]})")

    # Send back the updated score
    socketio.emit("score_updated", {
        "username": rooms[room]["players"],
        "score": rooms[room]["scores"]
    })

    if rooms[room]["correct"] == (len(rooms[room]["players"]) - 1):
        socketio.emit("all_guessed")

@socketio.on("new_player_joined")
def new_player_joined():
    room = session.get("room")
    print("iam rujning")
    if 'scores' not in rooms[room]:
        rooms[room]["scores"] = {username: 0 for username in rooms[room]["playerOrder"]}
    print(rooms[room]["playerOrder"])
    print(rooms[room]["scores"])
    socketio.emit("score_updated", {
        "username": rooms[room]["playerOrder"],
        "score": rooms[room]["scores"]
})

if __name__ == "__main__":
    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()
        print("Database initialized successfully!")

    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
