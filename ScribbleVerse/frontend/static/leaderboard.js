

function renderLeaderboard() {
    fetch(`/api/rooms/${roomCode}/players`)  
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch the player data!");
        }
        return response.json();
    })
    .then(playersData => {
        const playerData = document.getElementById("players-list");
        playersDatat.innerHTML = ""});

    // const playersData = JSON.parse(localStorage.getItem('playersData'));

    if (!playersData) {
        console.error("No player data found!");
        return;
    }


    // Sort players by score (highest first)
    const sortedPlayers = Object.entries(playersData).sort((a, b) => b[1] - a[1]);

    sortedPlayers.forEach(([name, score]) => {
        const row = document.createElement("tr");
        row.innerHTML = `<td>${name}</td><td>${score}</td>`;
        playersList.appendChild(row);
    });
}



// Call renderLeaderboard when the page is loaded
document.addEventListener("DOMContentLoaded", renderLeaderboard);
