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
    // may need to delte 
    const savedSettings = localStorage.getItem('gameSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      maxPlayersInput.value = settings.maxPlayerCount || ''; //if some fields are empty
      roundsInput.value = settings.rounds || '';
      roundDurationInput.value = settings.roundDuration || '';
      if (Array.isArray(settings.customWords)) {
        customWords = settings.customWords
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

    // Save settings to localStorage when the Save button is clicked
    saveSettingsBtn.onclick = () => {
      const settings = {
        maxPlayerCount: Number(maxPlayersInput.value),
        rounds: Number(roundsInput.value),
        roundDuration: Number(roundDurationInput.value),
        customWords: customWords
      };

      return fetch('/api/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      localStorage.setItem('gameSettings', JSON.stringify(settings));
      alert('Settings saved!');
    };
});