let mouseX = 0;
let mouseY = 0;
let canvasX = 0;
let canvasY = 0;
let colour = "black"

// Create Drawing Canvas
var drawingCanvas = document.getElementById("DrawingCanvas");
var Dcnvs = drawingCanvas.getContext("2d");

// Create Colour Choosing Canvas
var coloursCanvas = document.getElementById("ColoursCanvas");
var Ccnvs = coloursCanvas.getContext("2d");

// Keep drawing pixels at the cursor
function mouseHold() {
    drawLoop = setInterval(drawPixel, 10, 5, 5, colour);
}

// Stop drawing
function mouseRelease() {
    clearInterval(drawLoop);
}

//Update coords of canvas topleft corner
function getCanvasCorners() {
    let rect = drawingCanvas.getBoundingClientRect();
    canvasX = rect.left;
    canvasY = rect.top;
}

// Draw pixel at mouse coords
function drawPixel(width, height, colour) {
    getCanvasCorners();
    Dcnvs.fillStyle = colour;
    Dcnvs.fillRect(mouseX - canvasX - 5, mouseY - canvasY - 5, width, height);
    Dcnvs.stroke();
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
    // Run checkColour for each colour
    if (checkColour(mouseX - 240, mouseY - 580, 40)) {
        colour = "red"
    }
    else if (checkColour(mouseX - 240, mouseY - 580, 130)) {
        colour = "orange"
    }
    else if (checkColour(mouseX - 240, mouseY - 580, 220)) {
        colour = "yellow"
    }
    else if (checkColour(mouseX - 240, mouseY - 580, 310)) {
        colour = "green"
    }
    else if (checkColour(mouseX - 240, mouseY - 580, 400)) {
        colour = "blue"
    }
    else if (checkColour(mouseX - 240, mouseY - 580, 490)) {
        colour = "purple"
    }
    else if (checkColour(mouseX - 240, mouseY - 580, 580)) {
        colour = "pink"
    }
    else if (checkColour(mouseX - 240, mouseY - 580, 670)) {
        colour = "brown"
    }
    else if (checkColour(mouseX - 240, mouseY - 580, 760)) {
        colour = "black"
    }
}

// Check if the click is in circle
function checkColour(mouseX, mouseY, circleX) {
    const distance = Math.sqrt((mouseX - circleX) ** 2 + (mouseY - 40) ** 2); // Calculate distance to center of circle
    return (distance <= 30) // True if mouse is in circle
}

// Detect when the mouse clicks on coloursCanvas
coloursCanvas.addEventListener("click", function() { isInsideCircle(mouseX, mouseY); });

// Detect when the mouse is moved
document.addEventListener("mousemove", function(event) {
    mouseX = event.clientX; // Update global X coordinate
    mouseY = event.clientY; // Update global Y coordinate
});

// Detect when mouse is held down or released
drawingCanvas.addEventListener("mousedown", mouseHold);
document.addEventListener("mouseup", mouseRelease);

// White Background
Dcnvs.fillStyle = "white";
Dcnvs.fillRect(0, 0, 800, 500);

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