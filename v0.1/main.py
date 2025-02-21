# Use this to run the server:
# flask --app main.py run --host=0.0.0.0 --port=5000

from flask import Flask, render_template, request, session, redirect, url_for
from flask_socketio import join_room, leave_room, send, SocketIO
import random
from string import ascii_uppercase

app = Flask(__name__)
app.config["SECRET_KEY"] = "test"
socketio = SocketIO(app)

rooms = {}

def generate_unique_code(Length):
    while True:
        code = ""
        for _ in range(Length):
            code += random.choice(ascii_uppercase)

        if code not in rooms:
            break

    return code

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
        
        if join != False and not code:
            return render_template("index.html", error="Please enter a room code.", code=code, name=name)
        
        if code not in rooms:
            return render_template("index.html", error="Room does not exist.", code=code, name=name)
        
        # Semi-permanent way of storing user information without creating accounts.


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
                "messages": []
            }
        session["room"] = room

    room = session.get("room")

    room = session.get("room")
    if room is None or session.get("name") is None or room not in rooms:
        print(room)
        print(session.get("name"))
        print(room in rooms)
        print("Room is missing.")
        return redirect(url_for("index"))

    return render_template("room.html", code=room, messages=rooms[room]["messages"])

@app.route("/create-room", methods=["GET", "POST"])
def create_room():
    print("Session in create_room():", session)
    name = session.get("name")
    print(name)
    if not name:
        return redirect(url_for("index"))

    if request.method == "POST":
        room = generate_unique_code(4)
        rooms[room] = {
            "members": 0,
            "messages": []
        }
        session["room"] = room

        return redirect(url_for("room"))

    return render_template("create room.html", code=room, messages=rooms[room]["messages"])

@app.route("/join-room", methods=["POST"])
def join_room():
    return render_template("room.html", code=room, messages=rooms[room]["messages"])

@socketio.on("message")
def message(data):
    room = session.get("room")
    if room not in rooms:
        return

    content = {
        "name": session.get("name"),
        "message": data["data"]
    }
    send(content, to=room)
    rooms[room]["messages"].append(content)
    print(f"{session.get('name')} said: {data['data']}")

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
    rooms[room]["members"] += 1
    print(f"{name} joined room {room}")

@socketio.on("disconnect")
def disconnect():
    room = session.get("room")
    name = session.get("name")
    leave_room(room)

    if room in rooms:
        rooms[room]["members"] -= 1
        if rooms[room]["members"] <= 0:
            del rooms[room]
    
    send({"name": name, "message": "has left the room"}, to=room)
    print(f"{name} has left the room {room}")

if __name__ == "__main__":
    socketio.run(app, debug = True)