// ---Variables---
let mouseX = 0;
let mouseY = 0;

// Current drawing color and tool state
let colour = "black";
let mode = "pencil"; // Controls whether we're drawing or erasing
let isDrawing = false; // Tracks if user is currently drawing
let lastX = 0; // Last X position for line drawing
let lastY = 0; // Last Y position for line drawing

console.log(window.minutes, window.ten_secs, window.secs);

// Timer values passed from backend
let minutes = window.minutes;
let tenSeconds = window.ten_secs;
let seconds = window.secs;

let theme = "" // Stores the current drawing theme/word

// ---Images---
// Load tool images for the toolbar
const pencil = new Image();
pencil.src = "static/pencil.png";

const eraser = new Image();
eraser.src = "static/eraser.png";

// ---Canvases---

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
    // Calculate position relative to canvas by subtracting canvas position from mouse coordinates
    let [canvasX, canvasY] = getCanvasCorners(drawingCanvas);
    lastX = e.clientX - canvasX;
    lastY = e.clientY - canvasY;
}

// Draw line to current position
function draw(e) {
    if (!isDrawing) return; // Exit if not in drawing state
    
    // Get current mouse position relative to canvas
    let [canvasX, canvasY] = getCanvasCorners(drawingCanvas);
    let currentX = e.clientX - canvasX;
    let currentY = e.clientY - canvasY;
    
    // Set line join style for smoother lines
    Dcnvs.lineJoin = 'round';
    Dcnvs.lineCap = 'round';
    
    if (mode === "pencil") {
        // Drawing mode - use selected color
        Dcnvs.strokeStyle = colour;
        Dcnvs.lineWidth = 5;
        
        // Draw line from previous position to current position
        Dcnvs.beginPath();
        Dcnvs.moveTo(lastX, lastY);
        Dcnvs.lineTo(currentX, currentY);
        Dcnvs.stroke();
    } else {
        // Eraser mode - use white to "erase"
        Dcnvs.strokeStyle = "white";
        Dcnvs.lineWidth = 15; // Wider stroke for eraser
        
        Dcnvs.beginPath();
        Dcnvs.moveTo(lastX, lastY);
        Dcnvs.lineTo(currentX, currentY);
        Dcnvs.stroke();
    }
    
    // Update last position for next draw call
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
    // Check if mouse click coordinates are within each color circle
    // Each color circle is positioned at a different X coordinate (40, 130, 220, etc.)
    // but they all share the same Y coordinate (40)
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

// Check if the click is inside a specific circle
// mouseX, mouseY: coordinates relative to the canvas
// circleX: the x-coordinate of the circle's center (y is always 40)
function checkColour(mouseX, mouseY, circleX) {
    const distance = Math.sqrt((mouseX - circleX) ** 2 + (mouseY - 40) ** 2); // Calculate distance to center of circle
    return (distance <= 30); // True if mouse is in circle (radius is 30)
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
    console.log("Back Button");
    window.location.href = '/';
}

// Highlight the selected tool (pencil or eraser)
function updateToolHighlight() {
    // Clear the tools canvas
    Tcnvs.clearRect(0, 0, 150, 75);
    
    // Draw both tools
    Tcnvs.drawImage(pencil, 0, 0, 75, 75);
    Tcnvs.drawImage(eraser, 75, 0, 75, 75);
    
    // Add highlight to the selected tool
    Tcnvs.lineWidth = 4;
    
    if (mode === "pencil") {
        // Highlight pencil with pink border
        Tcnvs.strokeStyle = "#ff6bcb";
        Tcnvs.strokeRect(2, 2, 71, 71);
    } else {
        // Highlight eraser with pink border
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

// Update Timer - counts down from initial time and handles time formatting
function runTimer() {

    // Timer logic - checks each component (seconds, ten seconds, minutes)
    // and updates them appropriately
    if (seconds == "0") {
        if (tenSeconds == "0") {
            if (minutes == "0") {
                // Time's up - stop timer and handle end of round
                document.getElementById("timer").textContent = minutes + ":" + tenSeconds + seconds;
                stopTimer();

                // Redirect to new round after 5 seconds
                setTimeout(() => {
                    socketio.emit("new_round");
                }, 3000);

                // Reveal the word to client
                const themeReveal = document.getElementById('times-up');
                themeReveal.innerHTML = '';
                themeReveal.textContent = "The theme was: " + theme;

                // Show the times up modal
                document.getElementById('overlay').style.display = 'block';
                document.getElementById('times-up-modal').style.display = 'block';
            }

            else {
                // Decrement minutes, reset seconds to 59
                seconds = "9";
                tenSeconds = "5";
                minutes = parseInt(minutes) - 1;
                minutes = minutes.toString();
    
                document.getElementById("timer").textContent = minutes + ":" + tenSeconds + seconds;
            }
        }
        else {
            // Decrement ten seconds, reset seconds to 9
            seconds = "9";
            tenSeconds = parseInt(tenSeconds) - 1;
            tenSeconds = tenSeconds.toString();

            document.getElementById("timer").textContent = minutes + ":" + tenSeconds + seconds;
        }
    }
    else {
        // Just decrement seconds
        seconds = parseInt(seconds) - 1;
        seconds = seconds.toString();

        document.getElementById("timer").textContent = minutes + ":" + tenSeconds + seconds;
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

    // Create table rows for each player
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

    // Hide theme reveal modals
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('times-up-modal').style.display = 'none';
    document.getElementById('all-guessed-modal').style.display = 'none';
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
    // Display word selection modal for the drawer
    const wordList = document.getElementById('word-list');
    wordList.innerHTML = '';
    words.forEach((word) => {
        const listItem = document.createElement('li');
        listItem.textContent = word;

        // Run this function when a word is chosen
        listItem.onclick = function() {
            // When a word is selected, inform server and start round
            socketio.emit('wordSelected', word);
            // Send a message with hint about word length
            socketio.emit("message", {data: "The theme has been chosen. The theme has " +  word.length + " characters."});
            // Hide the word selection modal
            document.getElementById('overlay').style.display = 'none';
            document.getElementById('word-selection-modal').style.display = 'none';
            // Start the timer
            timer = setInterval(runTimer, 1000);
            // Display the word for the drawer
            document.getElementById('word-display').textContent = word;
            theme = word
        };
        wordList.appendChild(listItem);
    });

    // Show word selection modal
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('word-selection-modal').style.display = 'block';
});

// All players guessed correctly
socketio.on("all_guessed", () => {
    stopTimer();
    setTimeout(() => {
        socketio.emit("new_round");
    }, 3000);

    // Reveal the word to client
    const themeReveal = document.getElementById('all-guessed');
    themeReveal.innerHTML = '';
    themeReveal.textContent = "The theme was: " + theme;

    // Show the times up modal
    document.getElementById('overlay').style.display = 'block';
    document.getElementById('all-guessed-modal').style.display = 'block';
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
    // Convert canvas to data URL (base64 encoded image)
    const dataURL = canvas.toDataURL();

    // Send the image data to server for distribution to other players
    socketio.emit("drawing_update", {"image": dataURL});
};

// Send canvas updates at regular intervals (10ms)
// This creates a real-time drawing experience for viewers
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

// Back Button event listener
document.getElementById("back-button").addEventListener("mouseup", back);

// Tools event listener
toolsCanvas.addEventListener("mouseup", function(e) { toolsClick(e.clientX); });

// ---Drawing to the screen---

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

// Timer Text 
document.getElementById("timer").textContent = minutes + ":" + tenSeconds + seconds;

