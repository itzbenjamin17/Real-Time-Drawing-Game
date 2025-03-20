// ---Variables---
let mouseX = 0;
let mouseY = 0;
let guessed = false; // Tracks if the current player has guessed correctly

console.log(window.minutes, window.ten_secs, window.secs);

// Timer values passed from backend
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

// Display word at Word Canvas - shows blanks or the full word depending on if guessed
function displayWord(word, guessed) {
    // Clear previous content
    Wcnvs.clearRect(0, 0, 700, 75);
    
    // Redraw background
    Wcnvs.fillStyle = "#ffd296";
    Wcnvs.fillRect(0, 0, 700, 75);
    
    if (guessed) {
        // If the player guessed correctly, show the complete word
        addText(Wcnvs, "40", "center", word, 350, 50);
    } else {
        // Otherwise show blanks representing each letter
        let blanks = "";
        for (let i = 0; i < word.length; i++) {
            if (word[i] === " ") {
                blanks += "  ";  // Preserve spaces
            } else {
                blanks += "_ ";  // Use underscore for letters
            }
        }
        addText(Wcnvs, "40", "center", blanks, 350, 50);
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

// Update Timer - counts down and formats display
function runTimer() {
    // Clear timer canvas and redraw background
    Tcnvs.clearRect(0, 0, 250, 75);
    Tcnvs.fillStyle = "#ffd296";
    Tcnvs.fillRect(0, 0, 250, 75);

    // Timer logic - similar structure to drawing.js
    if (seconds == "0") {
        if (tenSeconds == "0") {
            if (minutes == "0") {
                // Time's up
                addText(Tcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 125, 50);
                stopTimer();
                // Round ends when time runs out
                
            }
            else {
                // Decrement minutes, reset seconds
                seconds = "9"
                tenSeconds = "5"
                minutes = parseInt(minutes) - 1
                minutes = minutes.toString()

                addText(Tcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 125, 50);
            }
        }
        else {
            // Decrement ten seconds place, reset seconds
            seconds = "9"
            tenSeconds = parseInt(tenSeconds) - 1
            tenSeconds = tenSeconds.toString()

            addText(Tcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 125, 50);
        }
    }
    else {
        // Just decrement seconds
        seconds = parseInt(seconds) - 1
        seconds = seconds.toString()

        addText(Tcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 125, 50);
    }
}

// Stop the timer
function stopTimer() {
    clearInterval(timer);
}

// Player has guessed correctly
function correctGuess() {
    guessed = true
    // Clear and reset word display
    Wcnvs.clearRect(0, 0, 700, 75)
    
    // Background for Word Canvas
    Wcnvs.fillStyle = "#ffd296";
    Wcnvs.fillRect(0, 0, 700, 75)
    
    // Show the full word now that player has guessed it
    displayWord(word, true);

    // Inform other players this user has guessed correctly
    socketio.emit("message", {data: "I've guessed correctly!"});

    // Calculate score based on remaining time
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

    // Create table rows for each player
    sortedPlayers.forEach(([name, score]) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${name}</td><td>${score}</td>`;
        playersList.appendChild(row);
    });
}


// ---Socketio---

var socketio = io();

const messages = document.getElementById("messages");

// Waiting for drawer to select a word
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

// Word has been selected by the drawer
socketio.on('wordSelected', (wordToGuess) => {
    // Hide waiting modal
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('waiting-modal').style.display = 'none';
    // Store the word and display blanks
    word = wordToGuess;
    displayWord(word, false);
    // Start the timer
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
    socketio.emit("new_player_joined")
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
});

// All players guessed correctly
socketio.on("all_guessed", () => {
    stopTimer();
});

// Receiving canvas data
socketio.on("display_drawing", (data) => {
    // Update the drawing image with the latest canvas data
    drawingCanvas.src = data.image;
    
    drawingCanvas.onload = () => {
    //console.log("Image loaded.");
    };
    drawingCanvas.onerror = () => {
    //console.error("Failed to load image.");
    };
});

socketio.on("score_updated", (data) => {
    usernames = data.username;
    scores = data.score;
    console.log("score updated has ran")
    // NO idea who the current player is
    score1 = data.total;
    // Update the leaderboard display
    renderLeaderboard(scores);
    //updateLeaderboard(individualUsername, data.score)
});

// Chat
const sendMessage = () => {
    const message = document.getElementById("message"); // Get message input
    if (message.value == "") return; // Skip empty messages
    
    if (!guessed) {
        // Check if message matches the word (case-sensitive)
        if (message.value == word) correctGuess();
        else socketio.emit("message", {data: message.value}); // Otherwise send as chat
    }
    message.value = ""; // Clear input field
};

// Add a message to the chat display
const createMessage = (name, msg) => {
    const content = `
    <div class="text">
        <span>
            <strong>${name}</strong>: ${msg}
        </span>
    </div>
    `;
    messages.innerHTML += content;
    messages.scrollTop = messages.scrollHeight; // Auto-scroll to bottom
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

