document.addEventListener("DOMContentLoaded", () => {
    const title = document.querySelector(".neon-text");
    let glowColors = ["#ff00ff", "#00ffff", "#ffcc00", "#ff0000"];
    let i = 0;
    
    setInterval(() => {
        title.style.textShadow = `0 0 10px ${glowColors[i]}, 0 0 20px ${glowColors[i + 1]}, 0 0 30px ${glowColors[i + 2]}`;
        i = (i + 1) % (glowColors.length - 1);
    }, 500);
});
