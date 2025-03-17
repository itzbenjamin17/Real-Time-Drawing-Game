// ---Variables---
let mouseX = 0;
let mouseY = 0;

let colour = "black";

let mode = "pencil";

let minutes = "3";
let tenSeconds = "0";
let seconds = "0";

let isDrawing = false;

let lastX = 0;
let lastY = 0;

// ---Data from Back-End---
let word = "apple";

// Get usernames and scores for each player
let username1 = "shel";
let score1 = 239;

let username2 = "shell";
let score2 = 2399;

let username3 = "shelll";
let score3 = 23999;

let username4 = "shellll";
let score4 = 239999;

let username5 = "shelllll";
let score5 = 2399999;

// ---Images---
const pencil = new Image();
pencil.src = "static/pencil.png";

const eraser = new Image();
eraser.src = "static/eraser.png";

// ---Define the Canvases---

// Back Canvas
var backCanvas = document.getElementById("BackCanvas");
var Bcnvs = backCanvas.getContext("2d");

// Create Word Canvas
var wordCanvas = document.getElementById("WordCanvas");
var Wcnvs = wordCanvas.getContext("2d");

// Timer Canvas
var timerCanvas = document.getElementById("TimerCanvas");
var TIcnvs = timerCanvas.getContext("2d");

// Leaderboard Canvas
var leaderboardCanvas = document.getElementById("LeaderboardCanvas");
var Lcnvs = leaderboardCanvas.getContext("2d");

// Create Drawing Canvas
var drawingCanvas = document.getElementById("DrawingCanvas");
var Dcnvs = drawingCanvas.getContext("2d");

// Chat Canvas
var chatCanvas = document.getElementById("ChatCanvas");
var CHcnvs = chatCanvas.getContext("2d");

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
    TIcnvs.clearRect(0, 0, 150, 75);

    // Background
    TIcnvs.fillStyle = "#ffd296";
    TIcnvs.fillRect(0, 0, 150, 75);

    // update timer
    if (seconds == "0") {
        if (tenSeconds == "0") {
            if (minutes == "0") {
                addText(TIcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 75, 50);
                stopTimer();
                console.log("Time's Up! The word was: " + word);
            }
            else {
                seconds = "9";
                tenSeconds = "5";
                minutes = parseInt(minutes) - 1;
                minutes = minutes.toString();
    
                addText(TIcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 75, 50);
            }
        }
        else {
            seconds = "9";
            tenSeconds = parseInt(tenSeconds) - 1;
            tenSeconds = tenSeconds.toString();

            addText(TIcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 75, 50);
        }
    }
    else {
        seconds = parseInt(seconds) - 1;
        seconds = seconds.toString();

        addText(TIcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 75, 50);
    }
}

// Stop the timer
function stopTimer() {
    clearInterval(timer);
}

function loadLeaderboard() {
    // Load player list

    // Draw the black outline
    Lcnvs.strokeStyle = "black";
    Lcnvs.lineWidth = 2;
    Lcnvs.strokeRect(10, 10, 130, 75); 
    Lcnvs.strokeRect(10, 95, 130, 75);
    Lcnvs.strokeRect(10, 185, 130, 75);
    Lcnvs.strokeRect(10, 275, 130, 75);
    Lcnvs.strokeRect(10, 365, 130, 75);

    // Draw the white background
    Lcnvs.fillStyle = "white";
    Lcnvs.fillRect(10, 10, 130, 75);
    Lcnvs.fillRect(10, 95, 130, 75);
    Lcnvs.fillRect(10, 185, 130, 75);
    Lcnvs.fillRect(10, 275, 130, 75);
    Lcnvs.fillRect(10, 365, 130, 75);

    // Add the texts
    addText(Lcnvs, "20", "center", "1st", 75, 35);
    addText(Lcnvs, "20", "center", username1, 75, 55);
    addText(Lcnvs, "20", "center", score1.toString(), 75, 75);

    addText(Lcnvs, "20", "center", "2nd", 75, 120);
    addText(Lcnvs, "20", "center", username2, 75, 140);
    addText(Lcnvs, "20", "center", score2.toString(), 75, 160);

    addText(Lcnvs, "20", "center", "3rd", 75, 210);
    addText(Lcnvs, "20", "center", username3, 75, 230);
    addText(Lcnvs, "20", "center", score3.toString(), 75, 250);

    addText(Lcnvs, "20", "center", "4th", 75, 300);
    addText(Lcnvs, "20", "center", username4, 75, 320);
    addText(Lcnvs, "20", "center", score4.toString(), 75, 340);

    addText(Lcnvs, "20", "center", "5th", 75, 390);
    addText(Lcnvs, "20", "center", username5, 75, 410);
    addText(Lcnvs, "20", "center", score5.toString(), 75, 430);
}

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
Wcnvs.fillRect(0, 0, 800, 75);

// Background for Timer Canvas
TIcnvs.fillStyle = "#ffd296";
TIcnvs.fillRect(0, 0, 150, 75);

// Background for Leaderboard Canvas
Lcnvs.fillStyle = "#ffd296";
Lcnvs.fillRect(0, 0, 150, 450);

// White Background for Drawing Canvas
Dcnvs.fillStyle = "white";
Dcnvs.fillRect(0, 0, 800, 500);

// Background for Chat Canvas
CHcnvs.fillStyle = "#ffd296";
CHcnvs.fillRect(0, 0, 150, 450);

// When these images load, put them on the screen
pencil.onload = function () {
    if (eraser.complete) {
        updateToolHighlight(); // Only update when both images are loaded
    } else {
        Tcnvs.drawImage(pencil, 0, 0, 75, 75);
    }
};

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
addText(TIcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 75, 50);

loadLeaderboard();

// ---Socketio---

var socketio = io();

window.onload = function() {
    socketio.emit('ready')
}

socketio.onAny((event, ...args) => {
    console.log(`Received Event: ${event}`, args);
});

socketio.on("connect", () => {
    console.log("Socket Connected!");
});

socketio.on('redirect', (url) => {
    window.location.href = url;
});

socketio.on('chooseWords', (words) => {
    const wordList = document.getElementById('word-list');
    wordList.innerHTML = '';
    words.forEach((word) => {
        const listItem = document.createElement('li');
        listItem.textContent = word;
        listItem.onclick = function() {
            socketio.emit('wordSelected', word);
            document.getElementById('overlay').style.display = 'none';
            document.getElementById('word-selection-modal').style.display = 'none';
            timer = setInterval(runTimer, 1000);
            addText(Wcnvs, "50", "center", word, 400, 50);
        };
        wordList.appendChild(listItem);
    });

    document.getElementById('overlay').style.display = 'block';
    document.getElementById('word-selection-modal').style.display = 'block';
});

// Sending canvas data
const sendDrawing = () => {
    const canvas = document.getElementById("DrawingCanvas");
    const dataURL = canvas.toDataURL();

    console.log("Sending drawing update:", dataURL.slice(0, 50) + "...");
    socketio.emit("drawing_update", {"image": dataURL});
};
setInterval(sendDrawing, 500); // Sends an image of the canvas to all players every half-second.