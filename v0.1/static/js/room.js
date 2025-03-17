var socketio = io();

const messages = document.getElementById("messages");
const playersList = document.getElementById("players");

socketio.on("connect", () => {
    console.log("Socket Connected!");
});

socketio.on("error", (error) => {
    console.log("SocketIO Error:", error);
});

let players = [];

const updatePlayerList = () => {
    console.log("Updating player list...")
    playersList.innerHTML = "";
    players.forEach(player => {
        const li = document.createElement("li");
        li.textContent = player;
        playersList.appendChild(li);
    });
};

socketio.on("username", (updatedPlayers) => {
    console.log("Players:", updatedPlayers)
    players = updatedPlayers;
    updatePlayerList();
});

const addPlayer = (player) => {
    players.push(player);
    updatePlayerList();
};

const deletePlayer = (player) => {
    players = players.filter(p => p !== player);
    updatePlayerList();
};

const createMessage = (name, msg) => {
    const content = `
    <div class="text">
        <span>
            <strong>${name}</strong>: ${msg}
        </span>
        <span class="muted">
            ${new Date().toLocaleString()}
        </span>
    </div>
    `;
    messages.innerHTML += content;
    messages.scrollTop = messages.scrollHeight;
};

const sendMessage = () => {
    const message = document.getElementById("message");
    if (message.value == "") return;
    socketio.emit("message", {data: message.value});
    message.value = "";
};

socketio.on("message", (data) => {
    console.log("Received Message:", data);
    createMessage(data.name, data.message);
    console.log("Still connected...")
});

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("send-btn").addEventListener("click", sendMessage);
    document.getElementById("message").addEventListener("keypress", function(event) {
        if (event.key === "Enter") sendMessage();
    });
});

// Function to handle rendering of initial messages from the server
function renderInitialMessages(messages) {
    if (messages && messages.length) {
        messages.forEach(msg => {
            createMessage(msg.name, msg.message);
        });
    }
}

// Expose the createMessage function globally so it can be used from the HTML
window.createMessage = createMessage;
window.renderInitialMessages = renderInitialMessages;
