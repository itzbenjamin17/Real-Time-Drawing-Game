// ---Variables---
let mouseX = 0;
let mouseY = 0;
let guessed = false; // Tracks if the current player has guessed correctly

console.log(window.minutes, window.ten_secs, window.secs);

// Timer values passed from backend
let minutes = window.minutes;
let tenSeconds = window.ten_secs;
let seconds = window.secs;

let theme = ""

var drawingCanvas = document.getElementById("DrawingImage");

// ---Functions---

//Get coords of canvas topleft corner
function getCanvasCorners(canvas) {
    let rect = canvas.getBoundingClientRect();
    return [rect.left, rect.top]
}

// Display word at Word Canvas - shows blanks or the full word depending on if guessed
function displayWord(word, guessed) {
    
    if (guessed) {
        document.getElementById('word-display').style.fontSize = "60px";
        document.getElementById('word-display').textContent = word;
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
        if (word.length > 15) {
            document.getElementById('word-display').style.fontSize = "40px";
        } else {
            document.getElementById('word-display').style.fontSize = "60px";
        }
        document.getElementById('word-display').textContent = blanks;
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

    // Timer logic - similar structure to drawing.js
    if (seconds == "0") {
        if (tenSeconds == "0") {
            if (minutes == "0") {
                // Time's up
                document.getElementById("timer").textContent = minutes + ":" + tenSeconds + seconds;
                stopTimer();
                // Round ends when time runs out
                
                // Reveal the word to client
                const themeReveal = document.getElementById('times-up');
                themeReveal.innerHTML = '';
                themeReveal.textContent = "The theme was: " + theme;

                // Show the times up modal
                document.getElementById('overlay').style.display = 'block';
                document.getElementById('times-up-modal').style.display = 'block';
            }
            else {
                // Decrement minutes, reset seconds
                seconds = "9"
                tenSeconds = "5"
                minutes = parseInt(minutes) - 1
                minutes = minutes.toString()

                document.getElementById("timer").textContent = minutes + ":" + tenSeconds + seconds;
            }
        }
        else {
            // Decrement ten seconds place, reset seconds
            seconds = "9"
            tenSeconds = parseInt(tenSeconds) - 1
            tenSeconds = tenSeconds.toString()

            document.getElementById("timer").textContent = minutes + ":" + tenSeconds + seconds;
        }
    }
    else {
        // Just decrement seconds
        seconds = parseInt(seconds) - 1
        seconds = seconds.toString()

        document.getElementById("timer").textContent = minutes + ":" + tenSeconds + seconds;
    }
}

// Stop the timer
function stopTimer() {
    clearInterval(timer);
}

// Player has guessed correctly
function correctGuess() {
    guessed = true
    
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

    // Show waiting model
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('waiting-modal').style.display = 'block';

    // Hide theme reveal modals
    document.getElementById('times-up-modal').style.display = 'none';
    document.getElementById('all-guessed-modal').style.display = 'none';
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
    theme = word;
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

    console.log("hahaha")
    // Reveal the word to client
    const themeReveal = document.getElementById('all-guessed');
    themeReveal.innerHTML = '';
    themeReveal.textContent = "The theme was: " + theme;

    // Show the times up modal
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('all-guessed-modal').style.display = 'block';
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
        if (message.value.toLowerCase().trim() == word) correctGuess();
        else socketio.emit("message", {data: message.value}); // send to other players
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

// Back Button event listener
document.getElementById("back-button").addEventListener("mouseup", back);

// Chat or Guessing
document.getElementById("send-btn").addEventListener("click", sendMessage);
document.getElementById("message").addEventListener("keypress", function(event) {
    if (event.key === "Enter") sendMessage();
});

// ---Drawing to the screen---

// Timer Text 
document.getElementById("timer").textContent = minutes + ":" + tenSeconds + seconds;

