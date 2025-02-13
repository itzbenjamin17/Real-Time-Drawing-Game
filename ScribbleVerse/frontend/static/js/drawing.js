let mouseX = 0;
let mouseY = 0;
let canvasX = 0;
let canvasY = 0;

// Create Canvas
var canvas = document.getElementById("DrawingCanvas");
var cnvs = canvas.getContext("2d");

// Keep drawing pixels at the cursor
function mouseHold() {
    drawLoop = setInterval(drawPixel, 10, 5, 5, "red");
}

// Stop drawing
function mouseRelease() {
    console.log(mouseX, mouseY)
    clearInterval(drawLoop);
}

//Update coords of canvas topleft corner
function getCanvasCorners() {
    let rect = canvas.getBoundingClientRect();
    canvasX = rect.left;
    canvasY = rect.top;
}

// Draw pixel at mouse coords
function drawPixel(width, height, colour) {
    getCanvasCorners();
    cnvs.fillStyle = colour;
    cnvs.fillRect(mouseX - canvasX - 5, mouseY - canvasY - 5, width, height);
    cnvs.stroke();
}

// Detect when the mouse is moved
document.addEventListener("mousemove", function(event) {
    mouseX = event.clientX; // Update global X coordinate
    mouseY = event.clientY; // Update global Y coordinate
});

// Detect when mouse is held down or released
canvas.addEventListener("mousedown", mouseHold);
document.addEventListener("mouseup", mouseRelease);

// White Background
cnvs.fillStyle = "white";
cnvs.fillRect(0, 0, 800, 500);

// Choosing Colours Circle (Incomplete)
/* cnvs.beginPath();
cnvs.arc(130, 480, 20, 0, 2 * Math.PI);
cnvs.fillStyle = "red";
cnvs.fill();
cnvs.lineWidth = 4;
cnvs.stroke(); */