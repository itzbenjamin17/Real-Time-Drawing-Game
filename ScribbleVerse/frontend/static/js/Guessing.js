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

// Create Guessing Canvas
var guessingCanvas = document.getElementById("GuessingCanvas");
var Gcnvs = guessingCanvas.getContext("2d");

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

//Get coords of canvas topleft corner
function getCanvasCorners(canvas) {
    let rect = canvas.getBoundingClientRect();
    return [rect.left, rect.top]
}

// Display word at Guessing Canvas
function displayWord(word) {
    // Get underscores for each letter in word
    length = word.length;
    let displayedWord = "";
    for (let i = 0; i < length; i++) {
        displayedWord += "_ ";
    }
    displayedWord = displayedWord.slice(0, -1);
    
    addText(Gcnvs, "50", "center", displayedWord, 400, 45)
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
    console.log("Back Button")
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

// Detect when the mouse is moved
document.addEventListener("mousemove", function(event) {
    mouseX = event.clientX; // Update global X coordinate
    mouseY = event.clientY; // Update global Y coordinate
});

// Detect when mouse is held down or released
backCanvas.addEventListener("mouseup", back);

// Background for Back Canvas
Bcnvs.fillStyle = "#f93cff";
Bcnvs.fillRect(0, 0, 150, 75);

// Background for Guessing Canvas
Gcnvs.fillStyle = "#ffd296";
Gcnvs.fillRect(0, 0, 800, 75)

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

// Back Button Text
addText(Bcnvs, "40", "center", "Back", 75, 50);

// Timer Text 
addText(Tcnvs, "40", "center", minutes + ":" + tenSeconds + seconds, 75, 50);

// Display the word at the top
displayWord(word);

// Start Timer
timer = setInterval(runTimer, 1000)