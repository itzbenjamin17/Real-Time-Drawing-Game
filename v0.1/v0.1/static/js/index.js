function playGame() {
    let username = document.getElementById('username').value;
    if (username) {
        alert('Playing as ' + username);
        // start of the game logic 
    } else {
        alert('Please enter a username!');
    }
}

function createRoom() {
    alert('Create Room button clicked!');
    // room creation logic
    window.location.href = 'create-room';
}