document.addEventListener("DOMContentLoaded", () => {
    // Floating effect on cards
    document.querySelectorAll('.floating').forEach(card => {
        let x = 0, y = 0;
        setInterval(() => {
            x += (Math.random() - 0.5) * 2;
            y += (Math.random() - 0.5) * 2;
            card.style.transform = `translate(${x}px, ${y}px) rotateX(10deg) rotateY(10deg)`;
        }, 100);
    });

    // Button hover effect with scale
    document.querySelector(".report-btn").addEventListener("mouseover", (e) => {
        e.target.style.transform = "scale(1.1)";
        e.target.style.transition = "0.3s";
    });
    document.querySelector(".report-btn").addEventListener("mouseleave", (e) => {
        e.target.style.transform = "scale(1)";
    });

    // Dark Mode Toggle Fix
    const modeSwitch = document.getElementById("modeSwitch");
    const body = document.body;
    
    // Check local storage for saved theme
    if (localStorage.getItem("theme") === "light") {
        body.classList.add("light-mode");
        modeSwitch.checked = true;
    }

    modeSwitch.addEventListener("change", function() {
        if (this.checked) {
            body.classList.add("light-mode");
            localStorage.setItem("theme", "light");
        } else {
            body.classList.remove("light-mode");
            localStorage.setItem("theme", "dark");
        }
    });
});
