

function renderLeaderboard() {
    const playersData = JSON.parse(localStorage.getItem('playersData'));

    if (!playersData) {
        console.error("No player data found!");
        return;
    }
    
    const playersList = document.getElementById("players-list");
    playersList.innerHTML = "";

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
