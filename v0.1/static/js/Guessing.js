// ---Variables---
let mouseX = 0;
let mouseY = 0;
let guessed = false;

console.log(window.minutes, window.ten_secs, window.secs);

let minutes = window.minutes;
let tenSeconds = window.ten_secs;
let seconds = window.secs;

// ---Define the Canvases---
// Back Canvas
var backCanvas = document.getElementById("BackCanvas");
var Bcnvs = backCanvas.getContext("2d");

// Create Word Canvas
var wordCanvas = document.getElementById("WordCanvas");
var Wcnvs = wordCanvas.getContext("2d");

// Timer Canvas
var timerCanvas = document.getElementById("TimerCanvas");
var Tcnvs = timerCanvas.getContext("2d");


var drawingCanvas = document.getElementById("DrawingImage");

// ---Functions---

//Get coords of canvas topleft corner
function getCanvasCorners(canvas) {
    let rect = canvas.getBoundingClientRect();
    return [rect.left, rect.top]
}

// Display word at Word Canvas
function displayWord(word, guessed) {
    if (guessed) { // If user has guessed the word
        addText(Wcnvs, "50", "center", word, 350, 55)
    }
    else { // User has not guessed the word
        // Get underscores for each letter in word
        length = word.length;
        let displayedWord = "";
        for (let i = 0; i < length; i++) {
            if (word[i] != " ") displayedWord += "_ ";
            else displayedWord += "  ";
        }
        displayedWord = displayedWord.slice(0, -1);
        
        let textSize = "50";
        if (length > 15) textSize = "40";
        addText(Wcnvs, textSize, "center", displayedWord, 350, 55);
    }
}

// Add text to a canvas
function addText(cnvs, size, align, text, textX, textY) {
    cnvs.font = size + "px Arial, sans-serif";
    cnvs.textAlign = align;
    cnvs.fillStyle = "black";
    cnvs.fillText(text, textX, textY);
}

// Runs when the Back Button is pressed 
function back() {
    window.location.href = '/';
}

// Update Timer
function runTimer() {
    // Clear Tcnvs
    Tcnvs.clearRect(0, 0, 250, 75);

    // Background
    Tcnvs.fillStyle = "#ffd296";
    Tcnvs.fillRect(0, 0, 250, 75);

    // update timer
    if (seconds == "0") {
        if (tenSeconds == "0") {
            if (minutes == "0") {
                addText(Tcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 125, 50);
                stopTimer();
                // Need to add logic to end the round and move on to the next
                
                // Store data (username, score, current round, etc.)
            }

            else {
                seconds = "9"
                tenSeconds = "5"
                minutes = parseInt(minutes) - 1
                minutes = minutes.toString()
    
                addText(Tcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 125, 50);
            }
        }

        else {
            seconds = "9"
            tenSeconds = parseInt(tenSeconds) - 1
            tenSeconds = tenSeconds.toString()

            addText(Tcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 125, 50);
        }
    }

    else {
        seconds = parseInt(seconds) - 1
        seconds = seconds.toString()

        addText(Tcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 125, 50);
    }
}

// Stop the timer
function stopTimer() {
    clearInterval(timer);
}

// Player has guesssed correctly
function correctGuess() {
    guessed = true
    Wcnvs.clearRect(0, 0, 700, 75)
    
    // Background for Word Canvas
    Wcnvs.fillStyle = "#ffd296";
    Wcnvs.fillRect(0, 0, 700, 75)
    
    // Display the word at the top
    displayWord(word, true);

    // Send message that this player has guessed correctly
    socketio.emit("message", {data: "I've guessed correctly!"});

    // Update score to leaderboard
    socketio.emit("calculate_score", {
        "minutes": minutes,
        "ten_seconds": tenSeconds,
        "seconds": seconds
    });
}

// Need logic that checks if all guessing players have guessed correctly
function renderLeaderboard(playersData) {
    if (!playersData) {
        console.log("No player data");
        return;
    }
    
    const playersList = document.getElementById("players-list");
    playersList.innerHTML = "";

    // Sort players by score (highest first)
    const sortedPlayers = Object.entries(playersData).sort((a, b) => b[1] - a[1]);

    sortedPlayers.forEach(([name, score]) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${name}</td><td>${score}</td>`;
        playersList.appendChild(row);
    });
}

// ---Socketio---

var socketio = io();

const messages = document.getElementById("messages");

window.onload = function() {
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('waiting-modal').style.display = 'block';
}

//socketio.onAny((event, ...args) => {
//    console.log(`Received Event: ${event}`, args);
//});

socketio.on("connect", () => {
    console.log("Socket Connected!");
});

socketio.on('wordSelected', (wordToGuess) => {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('waiting-modal').style.display = 'none';
    word = wordToGuess;
    displayWord(word, false);
    timer = setInterval(runTimer, 1000);
});

socketio.on("message", (data) => {
    console.log("Received Message:", data);
    createMessage(data.name, data.message);
    console.log("Still connected...")
});

socketio.on('redirect', (url) => {
    window.location.href = url;
});

// Used to receive the usernames of the whole lobby.
socketio.on("username", (playerName) => {
    console.log("New Player:", playerName);
});

// Used to receive the client's individual username from the backend.
socketio.on("individual_username", (username) => {
    console.log("Received Username:", username);
    individualUsername = username;
    console.log("Client's Username:", individualUsername);
});

// Used to receive the players' scores.
socketio.on("scores", (scores) => {
    console.log("Received Scores:", scores);
    playerScores = scores;
    console.log("Player Scores:", playerScores);
    renderLeaderboard(scores)
});

// All players guessed correctly
socketio.on("all_guessed", () => {
    stopTimer();
});


// Receiving canvas data
socketio.on("display_drawing", (data) => {
    //console.log("Received drawing update:", data.image.slice(0, 50) + "...");

    //const imageElement = document.getElementById("DrawingImage");
    //console.log("DrawingImage element exists?", document.getElementById("DrawingImage"));

    //if (!imageElement) {
    //  console.error("Error: Image element not found!");
    //  return;
    //}

    //console.log("Updating image src...");
    drawingCanvas.src = data.image;
    
    drawingCanvas.onload = () => {
    //console.log("Image loaded.");
    };
    drawingCanvas.onerror = () => {
    //console.error("Failed to load image.");
    };
});

socketio.on("score_updated", (data) => {
    console.log(`Scored ${data.score} points! New total: ${data.total}`);
    
    // NO idea who the current player is
    score1 = data.total;
    // renderLeaderboard(data)
    // Update the leaderboard display
});

// Chat
const sendMessage = () => {
    const message = document.getElementById("message"); // fetch message
    if (message.value == "") return; // if empty do nothing
    if (!guessed) {
        if (message.value == word) correctGuess();
        else socketio.emit("message", {data: message.value}); // send to other players
    }
    message.value = ""; // empties box
};

const createMessage = (name, msg) => {
    const content = `
    <div class="text">
        <span>
            <strong>${name}</strong>: ${msg}
        </span>
    </div>
    `;
    messages.innerHTML += content;
    messages.scrollTop = messages.scrollHeight;
};

// ---Event Listeners---

// Detect when the mouse is moved
document.addEventListener("mousemove", function(event) {
    mouseX = event.clientX; // Update global X coordinate
    mouseY = event.clientY; // Update global Y coordinate
});

// Detect when mouse is held down or released
backCanvas.addEventListener("mouseup", back);

// Chat or Guessing
document.getElementById("send-btn").addEventListener("click", sendMessage);
document.getElementById("message").addEventListener("keypress", function(event) {
    if (event.key === "Enter") sendMessage();
});

// ---Drawing to the screen---

// Background for Back Canvas
Bcnvs.fillStyle = "#f93cff";
Bcnvs.fillRect(0, 0, 150, 75);

// Background for Word Canvas
Wcnvs.fillStyle = "#ffd296";
Wcnvs.fillRect(0, 0, 700, 75)

// Background for Timer Canvas
Tcnvs.fillStyle = "#ffd296";
Tcnvs.fillRect(0, 0, 250, 75)

// Back Button Text
addText(Bcnvs, "40", "center", "Back", 75, 50);

// Timer Text 
addText(Tcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 125, 50);

