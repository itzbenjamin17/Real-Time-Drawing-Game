function goToLeaderboard() {
    const playersData = {
        "a": 120,
        "b": 200,
        "c": 150
    };

    // Save the dictionary in localStorage
    localStorage.setItem('playersData', JSON.stringify(playersData));

    window.location.href = "leaderboard.html";
}

function goToGameSettings(){
    window.location.href = "gameSettings.html";
}
