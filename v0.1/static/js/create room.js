document.addEventListener('DOMContentLoaded', () => {

    const maxPlayersInput = document.getElementById('maxPlayers');
    const roundsInput = document.getElementById('rounds');
    const roundDurationInput = document.getElementById('roundDuration');
    const customWordInput = document.getElementById('customWordInput');
    const addWordBtn = document.getElementById('addWordBtn');
    const customWordsList = document.getElementById('customWordsList');
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');

    let customWords = [];

    // If settings exist in localStorage, load them
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      maxPlayersInput.value = settings.maxPlayerCount || ''; //if some fields are empty
      roundsInput.value = settings.rounds || '';
      roundDurationInput.value = settings.roundDuration || '';
      if (Array.isArray(settings.customWords)) {
        customWords = settings.customWords;
        renderCustomWords();
      }
    }

    addWordBtn.onclick = () => {
      const word = customWordInput.value.trim();
      if (word && !customWords.includes(word)) {
        customWords.push(word);
        renderCustomWords();
        customWordInput.value = '';
      }
    };
    
    function renderCustomWords() {
      customWordsList.innerHTML = '';
      customWords.forEach((word, index) => {
        const li = document.createElement('li');
        li.textContent = word;
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => {
          customWords.splice(index, 1);
          renderCustomWords();
        };
        li.appendChild(removeBtn);
        customWordsList.appendChild(li);
      });
    }

    document.getElementById("roomBtn").addEventListener("click", function () {
      const maxPlayers = maxPlayersInput.value;
      const rounds = roundsInput.value;
      const roundDuration = roundDurationInput.value;
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
          const roomCode = response.room;
          window.location.href = `/room?code=${roomCode}`;
        }
      });
    });
});