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


def generate_unique_code(Length):
    # Creates a random uppercase letter code of specified length
    while True:
        code = ""
        for _ in range(Length):
            code += random.choice(ascii_uppercase)

        if not Room.query.filter_by(code=code).first():
            break
    return code


def sec_to_timer(secs):
    # Converts total seconds to minutes, tens of seconds, and seconds
    # For example: 125 seconds becomes 2 minutes, 0 tens, and 5 seconds
    mins = secs // 60
    ten_seconds = (secs % 60) // 10
    seconds = secs % 10

    return (mins, ten_seconds, seconds)


def timer_to_sec(mins, ten_seconds, seconds):
    # Converts minutes, tens of seconds, and seconds to total seconds
    # Inverse of sec_to_timer function
    secs = (mins * 60) + (ten_seconds * 10) + seconds

    return secs


def calc_score(timer, room, max_score=100, k=1):
    # Calculate score based on time remaining
    # More time remaining = higher score
    # timer: dict with minutes, ten_seconds, seconds
    # max_score: highest possible score (default 100)
    # k: score scaling factor
    duration = room.round_duration
    time_ratio = timer / duration

    drawer = room.current_drawer

    additional_score = max_score * math.exp(-k * (1 - time_ratio))
    drawer_score = round((additional_score * 0.5))

    return round(additional_score), drawer_score

# ----------------- Database Models ----------------- #


class Room(db.Model):
    # Room model to store game room information
    # Includes settings, players, and game state
    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(6), unique=True, nullable=False)
    host = db.Column(db.String(50), nullable=False)
    num_of_rounds = db.Column(db.Integer, default=5)
    current_round = db.Column(db.Integer, default=1)
    num_of_players = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=db.func.now())
    max_players = db.Column(db.Integer, default=10)
    round_duration = db.Column(db.Integer, default=60)
    current_drawer = db.Column(db.String(50))
    correct_guesses = db.Column(db.Integer, default=0)
    mins = db.Column(db.Integer, default=0)
    ten_seconds = db.Column(db.Integer, default=0)
    seconds = db.Column(db.Integer, default=0)
    word_list = db.Column(db.Text)
    player_order = db.Column(db.Text)
    messages = db.Column(db.Text, default="[]")
    scores = db.Column(db.Text, default="{}")

    players = db.relationship('Player', backref='room',
                              cascade="all, delete-orphan", lazy=True)

    def get_player_names(self):
        return [player.name for player in self.players]

    def get_messages(self):
        return json.loads(self.messages)

    def add_message(self, message):
        messages = json.loads(self.messages)
        messages.append(message)
        self.messages = json.dumps(messages)

    def get_scores(self):
        return json.loads(self.scores)

    def set_player_order(self, order):
        self.player_order = json.dumps(order)

    def get_word_list(self):
        return json.loads(self.word_list)


class Player(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), nullable=False)
    score = db.Column(db.Integer, default=0)
    is_drawing = db.Column(db.Boolean, default=False)
    room_id = db.Column(db.Integer, db.ForeignKey('room.id'), nullable=False)
    socket_id = db.Column(db.String(100))


class Report(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    issue_type = db.Column(db.String(50), nullable=False)
    issue_description = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=db.func.now())


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
        # Handle form submission (join or create room)
        name = request.form.get("name")
        code = request.form.get("code")
        join = request.form.get("join", False)
        create = request.form.get("create", False)

        room_obj = Room.query.filter_by(code=code).first() if code else None

        if not name:
            # Require a username
            return render_template("index.html", error="Please enter a name.", code=code, name=name)

        if create != False:
            # Redirect to room creation page
            session["name"] = name
            return redirect(url_for("create_room"))

        if not room_obj:
            # Error if trying to join non-existent room
            return render_template("index.html", error="Room does not exist.", code=code, name=name)

        if join != False:
            if not code:
                # Require a room code for joining
                return render_template("index.html", error="Please enter a room code.", code=code, name=name)

            if room_obj.num_of_players >= room_obj.max_players:
                # Prevent joining full rooms
                return render_template("index.html", error="Room is full", code=code, name=name)

            if name in room_obj.get_player_names():
                # Prevent duplicate usernames in same room
                return render_template("index.html", error="Username is already taken", code=code, name=name)

        # Store session data and redirect to room
        session["room"] = code
        session["name"] = name

        print(name, code, join, create)

        return redirect(url_for("room"))

    return render_template("index.html")


@app.route("/room", methods=["GET", "POST"])  # --- COMPLETE ---
def room():
    name = session.get("name")
    if not name:
        return redirect(url_for("index"))

    if request.method == "POST":
        # POST request handling for room creation
        room = request.form.get("code")

        if not room:
            # Generate new room code if none provided
            room = generate_unique_code(4)
            new_room = Room(code=room, host=name)
            db.session.add(new_room)
            db.session.commit()
        session["room"] = room

    room = session.get("room")
    if room is None or session.get("name") is None:
        return redirect(url_for("index"))

    room_obj = Room.query.filter_by(code=room).first()
    if not room_obj:
        return redirect(url_for("index"))

    # Create player if they don't exist in this room yet
    player = Player.query.filter_by(name=name, room_id=room_obj.id).first()
    if not player:
        player = Player(name=name, room_id=room_obj.id)
        db.session.add(player)
        room_obj.num_of_players += 1
        db.session.commit()

    player_names = room_obj.get_player_names()
    socketio.emit("username", player_names, to=room)

    host = (room_obj.host == name)

    return render_template("room.html", code=room, messages=room_obj.get_messages(), host=host)


@app.route("/create-room", methods=["GET", "POST"])  # --- COMPLETE ---
def create_room():
    print("Session in create_room():", session)
    name = session.get("name")
    if not name:
        return redirect(url_for("index"))

    # Generate a unique room code
    room = generate_unique_code(4)
    new_room = Room(code=room, host=name)
    db.session.add(new_room)
    db.session.commit()
    session["room"] = room

    if request.method == "POST":
        # Set room parameters from form data
        try:
            new_room.max_players = int(request.form.get("maxPlayers"))
        except:
            new_room.max_players = 10  # Default if invalid input
        try:
            new_room.num_of_rounds = int(request.form.get("rounds"))
        except:
            new_room.num_of_rounds = 5  # Default if invalid input
        try:
            new_room.round_duration = int(request.form.get("roundDuration"))
        except:
            new_room.round_duration = 60  # Default if invalid input

        # Convert total seconds to timer format (minutes, tens, seconds)
        times = sec_to_timer(new_room.round_duration)
        new_room.mins, new_room.ten_seconds, new_room.seconds = times

        default_words = ["horse", "suitcase", "rain", "socks", "grapes",
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

        custom_words = json.loads(request.form.get("customWords", "[]"))
        default_words.extend(custom_words)
        new_room.word_list = json.dumps(default_words)

        db.session.commit()

        return jsonify({'status': 'success', 'room': room})

    return render_template("create room.html", code=room, messages=new_room.get_messages())


@app.route("/join-room", methods=["POST"])  # --- COMPLETE ---
def joining_room(room):
    return render_template("room.html", code=room, messages=Room.query.filter_by(code=room).first().get_messages())


@app.route("/game", methods=["GET", "POST"])  # !-- INCOMPLETE --!
def game():
    name = session.get("name")
    room = session.get("room")

    room_obj = Room.query.filter_by(code=room).first()
    print(room_obj)
    if not room_obj:
        print("room does not exist")
        return render_template("index.html", error="You cannot start a game on your own.")

    # Sets the current drawer to the player rendering '/game'.
    room_obj.current_drawer = name
    # Reset correct guesses to 0 at the start of every round.
    room_obj.correct_guesses = 0
    if not room_obj.current_round:
        room_obj.current_round = 1
    else:
        room_obj.current_round += 1

    db.session.commit()

    try:
        return render_template("drawing.html", current_drawer=room_obj.current_drawer, mins=room_obj.mins, ten_secs=room_obj.ten_seconds, secs=room_obj.seconds, scores=room_obj.get_scores())
    except:
        scores = {username: 0 for username in room_obj.get_player_names()}
        return render_template("drawing.html", current_drawer=room_obj.current_drawer, mins=room_obj.mins, ten_secs=room_obj.ten_seconds, secs=room_obj.seconds, scores=scores)


@app.route("/guess", methods=["GET", "POST"])  # !-- INCOMPLETE --!
def guess():
    room = session.get("room")
    time.sleep(0.5)  # Adds a delay to prevent clients joining before the host.

    room_obj = Room.query.filter_by(code=room).first()
    if not room_obj:
        return redirect(url_for("index"))

    try:
        return render_template("Guessing.html", current_drawer=room_obj.current_drawer, mins=room_obj.mins, ten_secs=room_obj.ten_seconds, secs=room_obj.seconds, scores=room_obj.get_scores())
    except:
        scores = {username: 0 for username in room_obj.get_player_names()}
        return render_template("Guessing.html", current_drawer=room_obj.current_drawer, mins=room_obj.mins, ten_secs=room_obj.ten_seconds, secs=room_obj.seconds, scores=scores)


@app.route("/leaderboard", methods=["GET", "POST"])  # !-- INCOMPLETE --!
def leaderboard():
    name = session.get("name")
    room = session.get("room")

    room_obj = Room.query.filter_by(code=room).first()
    if not room_obj:
        return redirect(url_for("index"))

    data = {
        "scores": room_obj.get_scores(),  # Sends a dictionary of scores.
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
    if not room:
        return

    room_obj = Room.query.filter_by(code=room).first()
    if not room_obj:
        return

    content = {
        "name": session.get("name"),
        "message": data["data"]
    }

    print("Content:", content)

    socketio.emit("message", content, to=room)
    room_obj.add_message(content)
    db.session.commit()
    print("Messages:", room_obj.get_messages())
    print(f"{session.get('name')} said: {data['data']}")


@socketio.on("start")
def startGame():
    room_code = session.get('room')
    name = session.get('name')
    room_obj = Room.query.filter_by(code=room_code).first()
    if not room_obj:
        return
    # Only the host (first player) should trigger starting the round.
    if name != room_obj.host:
        return
    player_order = room_obj.get_player_names()
    room_obj.set_player_order(player_order)
    print(f"Player Order: {player_order}")
    db.session.commit()
    for player in room_obj.players:
        if player.name == player_order[0]:
            print(f"Triggered game for {player.name}!")
            socketio.emit('redirect', '/game', room=player.socket_id)
        else:
            print(f"Triggered guess for {player.name}!")
            socketio.emit('redirect', '/guess', room=player.socket_id)


@socketio.on("ready")
def sendWords():
    room = session.get('room')
    room_obj = Room.query.filter_by(code=room).first()
    if not room_obj:
        return

    words = []
    word_list = room_obj.get_word_list()[:]
    for i in range(3):
        if word_list:
            word = random.choice(word_list)
            words.append(word)
            word_list.remove(word)
    socketio.emit('chooseWords', words, to=room)


@socketio.on('wordSelected')
def receiveWord(word):
    room = session.get("room")
    socketio.emit('wordSelected', word, to=room)


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
    room_obj = Room.query.filter_by(code=room).first()
    if not room_obj:
        leave_room(room)
        return

    join_room(room)
    send({"name": name, "message": "has entered the room"}, to=room)

    # Always update the player's socket_id
    player = Player.query.filter_by(name=name, room_id=room_obj.id).first()
    if not player:
        player = Player(name=name, room_id=room_obj.id)
        db.session.add(player)
        room_obj.num_of_players += 1
    player.socket_id = request.sid
    db.session.commit()

    # Instead of resetting scores to 0 on key mismatch,
    # update current_scores by adding missing players, keeping existing scores intact.
    current_scores = room_obj.get_scores()  # might be {} or partially filled
    for player_name in room_obj.get_player_names():
        if player_name not in current_scores:
            current_scores[player_name] = 0
    room_obj.scores = json.dumps(current_scores)
    db.session.commit()

    player_names = room_obj.get_player_names()
    socketio.emit("username", player_names, to=room)
    socketio.emit("individual_username", name, to=room)
    socketio.emit("assigned_room", room, to=room)
    try:
        socketio.emit("scores", room_obj.get_scores(), to=room)
    except:
        scores = {player_name: 0 for player_name in player_names}
        socketio.emit("scores", scores, to=room)

@socketio.on("join")
def join():
    room = session.get("room")
    session.modified = True
    if room:
        print(f"Player {request.sid} is joining {room}.")
        join_room(room)
    else:
        print("Room does not exist.")
    print(f"Player {request.sid} is in the rooms: {socketio.server.rooms(request.sid)}")

@socketio.on("new_round")
def new_round():
    room = session.get("room")
    room_obj = Room.query.filter_by(code=room).first()
    if not room_obj:
        return

    num_of_players = len(room_obj.players)
    # End game if current_round is greater than num_of_rounds * num_of_players so each player can play even if num_of_rounds < num_of_players.
    if room_obj.current_round > room_obj.num_of_rounds * num_of_players:
        for player in room_obj.players:
            socketio.emit('redirect', '/leaderboard', room=player.socket_id)
        return

    players = json.loads(room_obj.player_order)
    current_drawer = room_obj.current_drawer

    # Determine next drawer once.
    next_index = (players.index(current_drawer) + 1) % len(players)
    next_drawer = players[next_index]

    # Emit redirect once for each player.
    for player in room_obj.players:
        if player.name == next_drawer:
            socketio.emit('redirect', '/game', room=player.socket_id)
        else:
            socketio.emit('redirect', '/guess', room=player.socket_id)


@socketio.on("drawing_update")
def drawing_update(data):
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

    socketio.emit("display_drawing", {"image": data["image"]}, to=room)


@socketio.on("disconnect")
def disconnect():
    room = session.get("room")
    name = session.get("name")
    leave_room(room)

    room_obj = Room.query.filter_by(code=room).first()
    if room_obj:
        player = Player.query.filter_by(name=name, room_id=room_obj.id).first()
        if player:
            db.session.delete(player)
            room_obj.num_of_players -= 1
            if room_obj.num_of_players <= 0:
                db.session.delete(room_obj)
            db.session.commit()

        send({"name": name, "message": "has left the room"}, to=room)
        socketio.emit("update_players", room_obj.get_player_names(), to=room)


@socketio.on("calculate_score")
def handle_score_calculation(data):
    room = session.get("room")
    name = session.get("name")
    room_obj = Room.query.filter_by(code=room).first()
    if not room_obj:
        return

    room_obj.correct_guesses += 1  # Increases the counter.
    current_drawer = room_obj.current_drawer

    # Get timer values from client
    minutes = int(data.get("minutes", 0))
    ten_seconds = int(data.get("ten_seconds", 0))
    seconds = int(data.get("seconds", 0))

    # Convert to total seconds remaining
    timer_seconds = timer_to_sec(minutes, ten_seconds, seconds)

    # Calculate score using existing function
    score, drawer_score = calc_score(timer_seconds, room_obj)

    # Initialize scores dictionary if needed
    scores = room_obj.get_scores()
    if not scores:
        scores = {player.name: 0 for player in room_obj.players}

    # Add points to player's score
    if name in scores:
        scores[name] += score
    else:
        scores[name] = score

    if current_drawer in scores:
        scores[current_drawer] += drawer_score
    else:
        scores[current_drawer] = drawer_score

    room_obj.scores = json.dumps(scores)
    db.session.commit()

    print(f"Player {name} scored {score} points (total: {scores[name]})")

    # Send back the updated score
    socketio.emit("score_updated", {
        "username": room_obj.get_player_names(),
        "score": scores
    }, to=room)

    if room_obj.correct_guesses == (len(room_obj.players) - 1):
        socketio.emit("all_guessed", to=room)


@socketio.on("new_player_joined")
def new_player_joined():
    room = session.get("room")
    room_obj = Room.query.filter_by(code=room).first()
    if not room_obj:
        return

    if not room_obj.scores:
        scores = {username: 0 for username in room_obj.get_player_names()}
        room_obj.scores = json.dumps(scores)
        db.session.commit()

    socketio.emit("score_updated", {
        "username": room_obj.get_player_names(),
        "score": room_obj.get_scores()
    }, to=room)


if __name__ == "__main__":
    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()
        print("Database initialized successfully!")

    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
