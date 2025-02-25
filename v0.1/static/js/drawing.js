// Variables
let mouseX = 0;
let mouseY = 0;
let colour = "black";
let mode = "pencil";
let minutes = "3";
let tenSeconds = "0";
let seconds = "0";

// Data from Back-End
let word = "apple";

// Images
const pencil = new Image();
pencil.src = "pencil.png";

const eraser = new Image();
eraser.src = "eraser.png";

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

// Keep drawing pixels at the cursor
function mouseHold() {
    // Run drawPixel every 10ms
    drawLoop = setInterval(drawPixel, 10, 5, 5, colour);
}

// Stop drawing
function mouseRelease() {
    clearInterval(drawLoop);
}

//Get coords of canvas topleft corner
function getCanvasCorners(canvas) {
    let rect = canvas.getBoundingClientRect();
    return [rect.left, rect.top]
}

// Draw pixel at mouse coords
function drawPixel(width, height, colour) {
    let [canvasX, canvasY] = getCanvasCorners(drawingCanvas);

    // If current mode is pencil
    if (mode == "pencil") {
        Dcnvs.fillStyle = colour;
        Dcnvs.fillRect(mouseX - canvasX - 10, mouseY - canvasY - 10, 5, 5);
    }

    // If current mode is eraser
    else {
        Dcnvs.fillStyle = "white";
        Dcnvs.fillRect(mouseX - canvasX - 10, mouseY - canvasY - 10, 15, 15);
    }
    Dcnvs.stroke(); // Send data to back end, where to draw a pixel or to delete a pixel
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
        colour = "red"
    }
    else if (checkColour(mouseX - canvasX, mouseY - canvasY, 130)) {
        colour = "orange"
    }
    else if (checkColour(mouseX - canvasX, mouseY - canvasY, 220)) {
        colour = "yellow"
    }
    else if (checkColour(mouseX - canvasX, mouseY - canvasY, 310)) {
        colour = "green"
    }
    else if (checkColour(mouseX - canvasX, mouseY - canvasY, 400)) {
        colour = "blue"
    }
    else if (checkColour(mouseX - canvasX, mouseY - canvasY, 490)) {
        colour = "purple"
    }
    else if (checkColour(mouseX - canvasX, mouseY - canvasY, 580)) {
        colour = "pink"
    }
    else if (checkColour(mouseX - canvasX, mouseY - canvasY, 670)) {
        colour = "brown"
    }
    else if (checkColour(mouseX - canvasX, mouseY - canvasY, 760)) {
        colour = "black"
    }
}

// Check if the click is in circle
function checkColour(mouseX, mouseY, circleX) {
    const distance = Math.sqrt((mouseX - circleX) ** 2 + (mouseY - 40) ** 2); // Calculate distance to center of circle
    return (distance <= 30) // True if mouse is in circle
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
    console.log("Back Button") // Send to back end that user has left the room
}

// Runs when the pencil or eraser image is clicked
function toolsClick(mouseX) {
    let [canvasX, canvasY] = getCanvasCorners(toolsCanvas);
    if (mouseX - canvasX <= 75) {
        mode = "pencil"
    }
    else {
        mode = "eraser"
    }
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
                console.log("Time's Up! The word was: " + word)
            }

            else {
                seconds = "9"
                tenSeconds = "5"
                minutes = parseInt(minutes) - 1
                minutes = minutes.toString()
    
                addText(TIcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 75, 50);
            }
        }

        else {
            seconds = "9"
            tenSeconds = parseInt(tenSeconds) - 1
            tenSeconds = tenSeconds.toString()

            addText(TIcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 75, 50);
        }
    }

    else {
        seconds = parseInt(seconds) - 1
        seconds = seconds.toString()

        addText(TIcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 75, 50);
    }
}

// Stop the timer
function stopTimer() {
    clearInterval(timer);
}

// Detect when the mouse clicks on coloursCanvas
coloursCanvas.addEventListener("click", function() { isInsideCircle(mouseX, mouseY); });

// Detect when the mouse is moved
document.addEventListener("mousemove", function(event) {
    mouseX = event.clientX; // Update global X coordinate
    mouseY = event.clientY; // Update global Y coordinate
});

// Detect when mouse is held down or released
backCanvas.addEventListener("mouseup", back);
drawingCanvas.addEventListener("mousedown", mouseHold);
document.addEventListener("mouseup", mouseRelease);
toolsCanvas.addEventListener("mouseup", function() { toolsClick(mouseX); });

// Background for Back Canvas
Bcnvs.fillStyle = "#f93cff";
Bcnvs.fillRect(0, 0, 150, 75);

// Background for Word Canvas
Wcnvs.fillStyle = "#ffd296";
Wcnvs.fillRect(0, 0, 800, 75)

// Background for Timer Canvas
TIcnvs.fillStyle = "#ffd296";
TIcnvs.fillRect(0, 0, 150, 75)

// Background for Leaderboard Canvas
Lcnvs.fillStyle = "#ffd296";
Lcnvs.fillRect(0, 0, 150, 450)

// White Background for Drawing Canvas
Dcnvs.fillStyle = "white";
Dcnvs.fillRect(0, 0, 800, 500);

// Background for Chat Canvas
CHcnvs.fillStyle = "#ffd296";
CHcnvs.fillRect(0, 0, 150, 450)

// Back Button Text
addText(Bcnvs, "40", "center", "Back", 75, 50)

// When these images load, put them on the screen
pencil.onload = function () {
    Tcnvs.drawImage(pencil, 0, 0, 75, 75);
};
eraser.onload = function () {
    Tcnvs.drawImage(eraser, 75, 0, 75, 75);
};

// Draw the colour circles to the screen
drawCircle(40, "red")
drawCircle(130, "orange")
drawCircle(220, "yellow")
drawCircle(310, "green")
drawCircle(400, "blue")
drawCircle(490, "purple")
drawCircle(580, "pink")
drawCircle(670, "brown")
drawCircle(760, "black")

// Display the word at the top
addText(Wcnvs, "50", "center", word, 400, 50)

// Timer Text 
addText(TIcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 75, 50);

// Start Timer
timer = setInterval(runTimer, 1000)