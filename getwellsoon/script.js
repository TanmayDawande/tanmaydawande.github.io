const followButton = document.getElementById("follow-button");
const pageTitle = document.getElementById("page-title");
const lede = document.getElementById("lede");
const message = document.getElementById("message");

const state = {
    mouseX: 0,
    mouseY: 0,
    locked: false,
};

function positionButton(x, y) {
    const buttonRect = followButton.getBoundingClientRect();

    const width = window.innerWidth;
    const height = window.innerHeight;
    const safeX = Math.max(16, Math.min(width - buttonRect.width - 16, x - buttonRect.width / 2));
    const safeY = Math.max(16, Math.min(height - buttonRect.height - 16, y - buttonRect.height / 2));

    followButton.style.setProperty("--x", `${safeX}px`);
    followButton.style.setProperty("--y", `${safeY}px`);
}

window.addEventListener("pointermove", (event) => {
    if (state.locked) return;

    state.mouseX = event.clientX;
    state.mouseY = event.clientY;
    positionButton(state.mouseX, state.mouseY);
});

followButton.addEventListener("click", () => {
    state.locked = true;
    pageTitle.hidden = true;
    lede.hidden = true;
    followButton.hidden = true;
    message.hidden = false;
    message.style.opacity = "1";
    message.style.visibility = "visible";
    message.style.pointerEvents = "auto";
    positionButton(state.mouseX, state.mouseY);
});

window.addEventListener("resize", () => {
    if (state.locked) return;

    state.mouseX = window.innerWidth * 0.42;
    state.mouseY = window.innerHeight * 0.54;
    positionButton(state.mouseX, state.mouseY);
});

state.mouseX = window.innerWidth * 0.42;
state.mouseY = window.innerHeight * 0.54;
positionButton(state.mouseX, state.mouseY);

// --- Raining hearts feature ---
const heartsContainer = document.querySelector('.hearts');
if (heartsContainer) {
    const maxHearts = 80;
    const spawnInterval = 250; // ms
    const hearts = [];

    function createHeart() {
        const el = document.createElement('span');
        el.className = 'heart';
        // Use a simple heart glyph for broad compatibility
        el.textContent = '❤';

        const left = Math.random() * 100; // percent
        const size = Math.floor(14 + Math.random() * 56); // px
        const duration = (4 + Math.random() * 6).toFixed(2); // seconds

        el.style.left = `${left}%`;
        el.style.fontSize = `${size}px`;
        el.style.animationDuration = `${duration}s`;

        heartsContainer.appendChild(el);
        hearts.push(el);

        // trigger animation
        requestAnimationFrame(() => el.classList.add('animate'));

        el.addEventListener('animationend', () => {
            el.remove();
            const idx = hearts.indexOf(el);
            if (idx > -1) hearts.splice(idx, 1);
        });

        // keep cap
        if (hearts.length > maxHearts) {
            const removeCount = hearts.length - maxHearts;
            for (let i = 0; i < removeCount; i++) {
                const h = hearts.shift();
                if (h && h.remove) h.remove();
            }
        }
    }

    // spawn loop
    setInterval(() => {
        // spawn 1-3 hearts each tick for a nicer rain
        const toSpawn = 1 + Math.floor(Math.random() * 3);
        for (let i = 0; i < toSpawn; i++) createHeart();
    }, spawnInterval);
}