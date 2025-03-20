document.addEventListener('DOMContentLoaded', () => {

    // Get form elements
    const maxPlayersInput = document.getElementById('maxPlayers');
    const roundsInput = document.getElementById('rounds');
    const roundDurationInput = document.getElementById('roundDuration');
    const customWordInput = document.getElementById('customWordInput');
    const addWordBtn = document.getElementById('addWordBtn');
    const customWordsList = document.getElementById('customWordsList');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');

    // Array to store custom words
    let customWords = [];

    // Load settings from local storage if available
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      maxPlayersInput.value = settings.maxPlayerCount || ''; // Use empty string if value not found
      roundsInput.value = settings.rounds || '';
      roundDurationInput.value = settings.roundDuration || '';
      
      // Load saved custom words if available
      if (Array.isArray(settings.customWords)) {
        customWords = settings.customWords;
        renderCustomWords();
      }
    }

    // Add custom word to the list
    addWordBtn.onclick = () => {
      const word = customWordInput.value.trim();
      
      // Only add the word if it's not empty and not already in the list
      if (word && !customWords.includes(word)) {
        customWords.push(word);
        renderCustomWords();
        customWordInput.value = '';
      }
    };
    
    // Render the list of custom words with remove buttons
    function renderCustomWords() {
      customWordsList.innerHTML = '';
      customWords.forEach((word, index) => {
        const li = document.createElement('li');
        li.textContent = word;
        
        // Create remove button for each word
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => {
          customWords.splice(index, 1); // Remove word at current index
          renderCustomWords(); // Re-render the list
        };
        
        li.appendChild(removeBtn);
        customWordsList.appendChild(li);
      });
    }

    // Handle room creation button click
    document.getElementById("roomBtn").addEventListener("click", function () {
      // Get form values
      const maxPlayers = maxPlayersInput.value;
      const rounds = roundsInput.value;
      const roundDuration = roundDurationInput.value;
      
      // Send AJAX request to create room
      $.ajax({
        url: '/create-room',
        type: 'POST',
        data: {
          maxPlayers: maxPlayers,
          rounds: rounds,
          roundDuration: roundDuration,
          customWords: JSON.stringify(customWords)
        },
        success: function(response) {
          // Redirect to the room page with the created room code
          const roomCode = response.room;
          window.location.href = `/room?code=${roomCode}`;
        }
      });
    });
});