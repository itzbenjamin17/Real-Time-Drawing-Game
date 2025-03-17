window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = true;

const voiceButton = document.getElementById("voiceBtn");
voiceButton.addEventListener("click", () => {
    recognition.start();
    voiceButton.innerText = "🎤 Listening...";
});

recognition.addEventListener("result", (event) => {
    const transcript = event.results[0][0].transcript.toLowerCase();
    console.log("Voice Command: ", transcript);
    
    if (transcript.includes("report")) {
        window.location.href = "lrp.html";
    } else if (transcript.includes("home")) {
        window.location.href = "frp.html";
    }
});

recognition.addEventListener("end", () => {
    voiceButton.innerText = "🎤 Voice Control";
});
