// Variables
let mouseX = 0;
let mouseY = 0;
let minutes = "3";
let tenSeconds = "0";
let seconds = "0";

// Data from Back-End
let word = "apple";

// Back Canvas
var backCanvas = document.getElementById("BackCanvas");
var Bcnvs = backCanvas.getContext("2d");

// Create Word Canvas
var wordCanvas = document.getElementById("WordCanvas");
var Wcnvs = wordCanvas.getContext("2d");

// Timer Canvas
var timerCanvas = document.getElementById("TimerCanvas");
var Tcnvs = timerCanvas.getContext("2d");

// Leaderboard Canvas
var leaderboardCanvas = document.getElementById("LeaderboardCanvas");
var Lcnvs = leaderboardCanvas.getContext("2d");

// Create Drawing Canvas
var drawingCanvas = document.getElementById("DrawingCanvas");
var Dcnvs = drawingCanvas.getContext("2d");

// Chat Canvas
var chatCanvas = document.getElementById("ChatCanvas");
var CHcnvs = chatCanvas.getContext("2d");

// Create Guessing Canvas
var guessingCanvas = document.getElementById("GuessingCanvas");
var Gcnvs = guessingCanvas.getContext("2d");

// Text Area
let textArea = document.getElementById("Guess");

//Get coords of canvas topleft corner
function getCanvasCorners(canvas) {
    let rect = canvas.getBoundingClientRect();
    return [rect.left, rect.top]
}

// Display word at Word Canvas
function displayWord(word, guessed) {
    if (guessed) { // If user has guessed the word
        addText(Wcnvs, "50", "center", word, 400, 45)
    }
    else { // User has not guessed the word
        // Get underscores for each letter in word
        length = word.length;
        let displayedWord = "";
        for (let i = 0; i < length; i++) {
            displayedWord += "_ ";
        }
        displayedWord = displayedWord.slice(0, -1);
        
        addText(Wcnvs, "50", "center", displayedWord, 400, 45)
    }
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

// Update Timer
function runTimer() {
    // Clear Tcnvs
    Tcnvs.clearRect(0, 0, 150, 75);

    // Background
    Tcnvs.fillStyle = "#ffd296";
    Tcnvs.fillRect(0, 0, 150, 75);

    // update timer
    if (seconds == "0") {
        if (tenSeconds == "0") {
            if (minutes == "0") {
                addText(Tcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 75, 50);
                stopTimer();
                console.log("Time's Up! The word was: " + word)
            }

            else {
                seconds = "9"
                tenSeconds = "5"
                minutes = parseInt(minutes) - 1
                minutes = minutes.toString()
    
                addText(Tcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 75, 50);
            }
        }

        else {
            seconds = "9"
            tenSeconds = parseInt(tenSeconds) - 1
            tenSeconds = tenSeconds.toString()

            addText(Tcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 75, 50);
        }
    }

    else {
        seconds = parseInt(seconds) - 1
        seconds = seconds.toString()

        addText(Tcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 75, 50);
    }
}

// Stop the timer
function stopTimer() {
    clearInterval(timer);
}

// Resize the text area according to when the window is resized
function adjustTextArea() {
    let canvas = document.getElementById("GuessingCanvas");

    // Adjust size based on canvas size
    textArea.style.width = canvas.width * 0.965 + "px";
    textArea.style.height = canvas.height * 0.655 + "px";

    // Adjust position based on canvas position
    let [canvasX, canvasY] = getCanvasCorners(guessingCanvas)
    textArea.style.left = canvasX + canvas.width * 0.025 + "px";
    textArea.style.top = canvasY + canvas.height * 0.25 + "px";
}

// Check the guess
function makeGuess() {
    if (textArea.value == word) {
        console.log("Correct!") // Send to back end that user has guessed correctly
        Wcnvs.clearRect(0, 0, 800, 75)
        
        // Background for Word Canvas
        Wcnvs.fillStyle = "#ffd296";
        Wcnvs.fillRect(0, 0, 800, 75)
        
        // Display the word at the top
        displayWord(word, true);
    }
    else {
        console.log("Wrong. Guess again!") // Send to back end user's guess
    }
}

// Detect when the mouse is moved
document.addEventListener("mousemove", function(event) {
    mouseX = event.clientX; // Update global X coordinate
    mouseY = event.clientY; // Update global Y coordinate
});

// Detect when mouse is held down or released
backCanvas.addEventListener("mouseup", back);

// Detect when the window is resized
window.addEventListener("resize", adjustTextArea)

// Detect when the enter key is released when the text area is active
textArea.addEventListener("keyup", function(event) { 
    if (event.key === "Enter") {
        makeGuess()
    }
})

// Background for Back Canvas
Bcnvs.fillStyle = "#f93cff";
Bcnvs.fillRect(0, 0, 150, 75);

// Background for Word Canvas
Wcnvs.fillStyle = "#ffd296";
Wcnvs.fillRect(0, 0, 800, 75)

// Background for Timer Canvas
Tcnvs.fillStyle = "#ffd296";
Tcnvs.fillRect(0, 0, 150, 75)

// Background for Leaderboard Canvas
Lcnvs.fillStyle = "#ffd296";
Lcnvs.fillRect(0, 0, 150, 450)

// White Background for Drawing Canvas
Dcnvs.fillStyle = "white";
Dcnvs.fillRect(0, 0, 800, 500);

// Background for Chat Canvas
CHcnvs.fillStyle = "#ffd296";
CHcnvs.fillRect(0, 0, 150, 450)

// Background for Guessing Canvas
Gcnvs.fillStyle = "#ffd296";
Gcnvs.fillRect(0, 0, 800, 75)

// Back Button Text
addText(Bcnvs, "40", "center", "Back", 75, 50);

// Timer Text 
addText(Tcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 75, 50);

// Display the word at the top
displayWord(word, false);

// Set initial size when the sreen first loads
window.onload = adjustTextArea;

// Start Timer
timer = setInterval(runTimer, 1000)

var socket = io();

socket.on('redirect', (url) => {
    window.location.href = url;
});