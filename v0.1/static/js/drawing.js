// ---Variables---
let mouseX = 0;
let mouseY = 0;


let colour = "black";
let mode = "pencil";
let isDrawing = false;
let lastX = 0;
let lastY = 0;

console.log(window.minutes, window.ten_secs, window.secs);

let minutes = window.minutes;
let tenSeconds = window.ten_secs;
let seconds = window.secs;


let theme = ""

// ---Images---
const pencil = new Image();
pencil.src = "static/pencil.png";

const eraser = new Image();
eraser.src = "static/eraser.png";

// ---Canvases---
// Back Canvas
var backCanvas = document.getElementById("BackCanvas");
var Bcnvs = backCanvas.getContext("2d");

// Create Word Canvas
var wordCanvas = document.getElementById("WordCanvas");
var Wcnvs = wordCanvas.getContext("2d");

// Timer Canvas
var timerCanvas = document.getElementById("TimerCanvas");
var TIcnvs = timerCanvas.getContext("2d");

// Create Drawing Canvas
var drawingCanvas = document.getElementById("DrawingCanvas");
var Dcnvs = drawingCanvas.getContext("2d");

// Create Colour Choosing Canvas
var coloursCanvas = document.getElementById("ColoursCanvas");
var Ccnvs = coloursCanvas.getContext("2d");

// Tools Canvas
var toolsCanvas = document.getElementById("ToolsCanvas");
var Tcnvs = toolsCanvas.getContext("2d");

// ---Functions---
// Start drawing when mouse is pressed
function startDrawing(e) {
    isDrawing = true;
    let [canvasX, canvasY] = getCanvasCorners(drawingCanvas);
    lastX = e.clientX - canvasX;
    lastY = e.clientY - canvasY;
}

// Draw line to current position
function draw(e) {
    if (!isDrawing) return;
    
    let [canvasX, canvasY] = getCanvasCorners(drawingCanvas);
    let currentX = e.clientX - canvasX;
    let currentY = e.clientY - canvasY;
    
    Dcnvs.lineJoin = 'round';
    Dcnvs.lineCap = 'round';
    
    if (mode === "pencil") {
        Dcnvs.strokeStyle = colour;
        Dcnvs.lineWidth = 5;
        
        Dcnvs.beginPath();
        Dcnvs.moveTo(lastX, lastY);
        Dcnvs.lineTo(currentX, currentY);
        Dcnvs.stroke();
    } else {
        // Eraser mode
        Dcnvs.strokeStyle = "white";
        Dcnvs.lineWidth = 15;
        
        Dcnvs.beginPath();
        Dcnvs.moveTo(lastX, lastY);
        Dcnvs.lineTo(currentX, currentY);
        Dcnvs.stroke();
    }
    
    lastX = currentX;
    lastY = currentY;
}

// Stop drawing
function stopDrawing() {
    isDrawing = false;
}

//Get coords of canvas topleft corner
function getCanvasCorners(canvas) {
    let rect = canvas.getBoundingClientRect();
    return [rect.left, rect.top];
}

// Draw the Colour Choice Circles
function drawCircle(circleX, colour) {
    Ccnvs.beginPath();
    Ccnvs.arc(circleX, 40, 30, 0, 2 * Math.PI);
    Ccnvs.fillStyle = colour;
    Ccnvs.fill();
    Ccnvs.lineWidth = 2;
    Ccnvs.stroke();
}

// Check if click is inside the circle
function isInsideCircle(mouseX, mouseY) {
    let [canvasX, canvasY] = getCanvasCorners(coloursCanvas);
    // Run checkColour for each colour
    if (checkColour(mouseX - canvasX, mouseY - canvasY, 40)) {
        colour = "red";
    }
    else if (checkColour(mouseX - canvasX, mouseY - canvasY, 130)) {
        colour = "orange";
    }
    else if (checkColour(mouseX - canvasX, mouseY - canvasY, 220)) {
        colour = "yellow";
    }
    else if (checkColour(mouseX - canvasX, mouseY - canvasY, 310)) {
        colour = "green";
    }
    else if (checkColour(mouseX - canvasX, mouseY - canvasY, 400)) {
        colour = "blue";
    }
    else if (checkColour(mouseX - canvasX, mouseY - canvasY, 490)) {
        colour = "purple";
    }
    else if (checkColour(mouseX - canvasX, mouseY - canvasY, 580)) {
        colour = "pink";
    }
    else if (checkColour(mouseX - canvasX, mouseY - canvasY, 670)) {
        colour = "brown";
    }
    else if (checkColour(mouseX - canvasX, mouseY - canvasY, 760)) {
        colour = "black";
    }
}

// Check if the click is in circle
function checkColour(mouseX, mouseY, circleX) {
    const distance = Math.sqrt((mouseX - circleX) ** 2 + (mouseY - 40) ** 2); // Calculate distance to center of circle
    return (distance <= 30); // True if mouse is in circle
}

// Add text to a canvas
function addText(cnvs, size, align, text, textX, textY) {
    cnvs.font = size + "px Arial, sans-serif";
    cnvs.textAlign = align;
    cnvs.fillStyle = "black";
    cnvs.fillText(text, textX, textY);
}

// Runs when the Back Button is pressed (incomplete)
function back() {
    console.log("Back Button"); // Send to back end that user has left the room
    window.location.href = '/';
}

// Highlight the selected tool
function updateToolHighlight() {
    // Clear the tools canvas
    Tcnvs.clearRect(0, 0, 150, 75);
    
    // Draw both tools
    Tcnvs.drawImage(pencil, 0, 0, 75, 75);
    Tcnvs.drawImage(eraser, 75, 0, 75, 75);
    
    // Add highlight to the selected tool
    Tcnvs.lineWidth = 4;
    
    if (mode === "pencil") {
        // Highlight pencil
        Tcnvs.strokeStyle = "#ff6bcb";
        Tcnvs.strokeRect(2, 2, 71, 71);
    } else {
        // Highlight eraser
        Tcnvs.strokeStyle = "#ff6bcb";
        Tcnvs.strokeRect(77, 2, 71, 71);
    }
}

// Runs when the pencil or eraser image is clicked
function toolsClick(mouseX) {
    let [canvasX, canvasY] = getCanvasCorners(toolsCanvas);
    if (mouseX - canvasX <= 75) {
        mode = "pencil";
    }
    else {
        mode = "eraser";
    }
    
    // Update the visual highlight
    updateToolHighlight();
}

// Update Timer
function runTimer() {
    // Clear Tcnvs
    TIcnvs.clearRect(0, 0, 250, 75);

    // Background
    TIcnvs.fillStyle = "#ffd296";
    TIcnvs.fillRect(0, 0, 250, 75);

    // update timer
    if (seconds == "0") {
        if (tenSeconds == "0") {
            if (minutes == "0") {
                addText(TIcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 125, 50);
                stopTimer();
                // Need to add logic to end the round and move on to the next
                
                // Store data (username, score, current round, etc.)

                // Redirect to new round after 5 seconds
                setTimeout(() => {
                    socketio.emit("new_round");
                }, 5000);

                // Display the word to the player
                socketio.emit("message", {data: "Time's up! The word was: " + theme});
            }
            else {
                seconds = "9";
                tenSeconds = "5";
                minutes = parseInt(minutes) - 1;
                minutes = minutes.toString();
    
                addText(TIcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 125, 50);
            }
        }
        else {
            seconds = "9";
            tenSeconds = parseInt(tenSeconds) - 1;
            tenSeconds = tenSeconds.toString();

            addText(TIcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 125, 50);
        }
    }
    else {
        seconds = parseInt(seconds) - 1;
        seconds = seconds.toString();

        addText(TIcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 125, 50);
    }
}

// Stop the timer
function stopTimer() {
    clearInterval(timer);
}

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

window.onload = function() {
    socketio.emit('ready')
}

//socketio.onAny((event, ...args) => {
//    console.log(`Received Event: ${event}`, args);
//});

socketio.on("connect", () => {
    console.log("Socket Connected!");
});


socketio.on('redirect', (url) => {
    window.location.href = url;
});

// Detect when a message has been sent
socketio.on("message", (data) => {
    console.log("Received Message:", data);
    createMessage(data.name, data.message);
    console.log("Still connected...")
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

socketio.on("score_updated", (data) => {
    usernames = data.username;
    scores = data.score;
    console.log("score updated has ran")
    // NO idea who the current player is
    score1 = data.total;
    // Update the leaderboard display
    renderLeaderboard(scores);
});

// Choosing Words
socketio.on('chooseWords', (words) => {
    const wordList = document.getElementById('word-list');
    wordList.innerHTML = '';
    words.forEach((word) => {
        const listItem = document.createElement('li');
        listItem.textContent = word;
        listItem.onclick = function() {
            socketio.emit('wordSelected', word);
            socketio.emit("message", {data: "The theme has been chosen. The theme has " +  word.length + " characters."});
            document.getElementById('overlay').style.display = 'none';
            document.getElementById('word-selection-modal').style.display = 'none';
            timer = setInterval(runTimer, 1000);
            addText(Wcnvs, "50", "center", word, 350, 55);
            theme = word
        };
        wordList.appendChild(listItem);
    });

    document.getElementById('overlay').style.display = 'block';
    document.getElementById('word-selection-modal').style.display = 'block';
});

// All players guessed correctly
socketio.on("all_guessed", () => {
    stopTimer();
    setTimeout(() => {
        socketio.emit("new_round");
    }, 5000);
    socketio.emit("message", {data: "Round over, everyone guessed correctly! The word was: " + theme});
});

// Display Message
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

// Sending canvas data
const sendDrawing = () => {
    const canvas = document.getElementById("DrawingCanvas");
    const dataURL = canvas.toDataURL();

    //console.log("Sending drawing update:", dataURL.slice(0, 50) + "...");
    socketio.emit("drawing_update", {"image": dataURL});
};

// Sends an image of the canvas to all players every half-second.
setInterval(sendDrawing, 10);

// ---Event listeners---
coloursCanvas.addEventListener("click", function(e) { 
    isInsideCircle(e.clientX, e.clientY); 
});

document.addEventListener("mousemove", function(event) {
    mouseX = event.clientX;
    mouseY = event.clientY;
});

// Drawing event listeners
drawingCanvas.addEventListener("mousedown", startDrawing);
drawingCanvas.addEventListener("mousemove", draw);
document.addEventListener("mouseup", stopDrawing);
document.addEventListener("mouseout", stopDrawing);

// Back button event listener
backCanvas.addEventListener("mouseup", back);

// Tools event listener
toolsCanvas.addEventListener("mouseup", function(e) { toolsClick(e.clientX); });

// ---Drawing to the screen---

// Background for Back Canvas
Bcnvs.fillStyle = "#f93cff";
Bcnvs.fillRect(0, 0, 150, 75);

// Background for Word Canvas
Wcnvs.fillStyle = "#ffd296";
Wcnvs.fillRect(0, 0, 700, 75);

// Background for Timer Canvas
TIcnvs.fillStyle = "#ffd296";
TIcnvs.fillRect(0, 0, 250, 75);

// White Background for Drawing Canvas
Dcnvs.fillStyle = "white";
Dcnvs.fillRect(0, 0, 700, 500);

// Pencil
pencil.onload = function () {
    if (eraser.complete) {
        updateToolHighlight(); // Only update when both images are loaded
    } else {
        Tcnvs.drawImage(pencil, 0, 0, 75, 75);
    }
};

// Eraser
eraser.onload = function () {
    if (pencil.complete) {
        updateToolHighlight(); // Only update when both images are loaded
    } else {
        Tcnvs.drawImage(eraser, 75, 0, 75, 75);
    }
};

// Draw the colour circles to the screen
drawCircle(40, "red");
drawCircle(130, "orange");
drawCircle(220, "yellow");
drawCircle(310, "green");
drawCircle(400, "blue");
drawCircle(490, "purple");
drawCircle(580, "pink");
drawCircle(670, "brown");
drawCircle(760, "black");

// Back Button Text
addText(Bcnvs, "40", "center", "Back", 75, 50);

// Timer Text 
addText(TIcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 125, 50);

