// ============================================
// SANTA CRUZ CUP - MUSIC PLAYER (Stabile)
// ============================================

const tracks = [
    "data/Jefe - Run! (side quest).mp3",
    "data/no mix no master.mp3"
];

const STORAGE_KEY = "santaCruzCupMusic";
const DEFAULT_VOLUME = 0.12;

// --- AUDIO E STATO ---
const audio = new Audio();
audio.preload = "auto";

let musicState = loadState();
let currentTrack = musicState.track;
let savedTime = musicState.time;
let volume = musicState.volume;
let musicEnabled = musicState.enabled;
let wasPlaying = musicState.playing;

audio.volume = volume;
audio.src = tracks[currentTrack];

// --- CREAZIONE WIDGET GRAFICO ---
const musicPanel = document.createElement("div");
Object.assign(musicPanel.style, {
    position: "fixed",
    bottom: "12px",
    right: "12px",
    zIndex: "99999",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 9px",
    background: "rgba(17,17,17,0.18)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    backdropFilter: "blur(2px)",
    WebkitBackdropFilter: "blur(2px)",
    opacity: "0.28",
    transition: "opacity 0.25s ease, background 0.25s ease",
    fontFamily: "Arial, sans-serif"
});

const musicButton = document.createElement("button");
musicButton.type = "button";
Object.assign(musicButton.style, {
    border: "none",
    background: "transparent",
    color: "white",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "2px 3px"
});

const volumeContainer = document.createElement("div");
Object.assign(volumeContainer.style, {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px"
});

const volumeRow = document.createElement("div");
Object.assign(volumeRow.style, {
    display: "flex",
    alignItems: "center",
    gap: "4px"
});

const volumeIcon = document.createElement("span");
volumeIcon.textContent = "🔊";
volumeIcon.style.fontSize = "13px";

const volumeSlider = document.createElement("input");
volumeSlider.type = "range";
volumeSlider.min = "0";
volumeSlider.max = "100";
volumeSlider.step = "1";
volumeSlider.value = Math.round(volume * 100);

Object.assign(volumeSlider.style, {
    width: "70px",
    height: "3px",
    cursor: "pointer"
});

const musicCredit = document.createElement("div");
musicCredit.textContent = "Music by Jefe";
Object.assign(musicCredit.style, {
    color: "rgba(255,255,255,0.65)",
    fontSize: "7px",
    lineHeight: "8px",
    letterSpacing: "0.2px",
    textAlign: "center"
});

volumeRow.append(volumeIcon, volumeSlider);
volumeContainer.append(volumeRow, musicCredit);
musicPanel.append(musicButton, volumeContainer);

// Inietta il widget nel dom
const injectWidget = () => {
    if (!document.body.contains(musicPanel)) {
        document.body.appendChild(musicPanel);
    }
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectWidget);
} else {
    injectWidget();
}

// Hover
musicPanel.addEventListener("mouseenter", () => {
    musicPanel.style.opacity = "1";
    musicPanel.style.background = "rgba(17,17,17,0.92)";
});
musicPanel.addEventListener("mouseleave", () => {
    musicPanel.style.opacity = "0.28";
    musicPanel.style.background = "rgba(17,17,17,0.18)";
});

// --- LOCAL STORAGE ---
function loadState() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        return {
            track: Number.isInteger(saved.track) && saved.track >= 0 && saved.track < tracks.length ? saved.track : 0,
            time: typeof saved.time === "number" ? saved.time : 0,
            volume: typeof saved.volume === "number" ? Math.max(0, Math.min(1, saved.volume)) : DEFAULT_VOLUME,
            enabled: saved.enabled !== false,
            playing: saved.playing === true
        };
    } catch {
        return { track: 0, time: 0, volume: DEFAULT_VOLUME, enabled: true, playing: false };
    }
}

function saveState() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            track: currentTrack,
            time: audio.currentTime || 0,
            volume: audio.volume,
            enabled: musicEnabled,
            playing: !audio.paused
        }));
    } catch {}
}

function updateMusicButton() {
    musicButton.textContent = (musicEnabled && !audio.paused) ? "🎵 ON" : "🔇 OFF";
}

function startMusic() {
    if (audio.volume === 0 || !musicEnabled) return Promise.resolve();
    return audio.play()
        .then(() => {
            updateMusicButton();
            saveState();
        })
        .catch(() => {
            updateMusicButton();
        });
}

function toggleMusic() {
    if (musicEnabled && !audio.paused) {
        musicEnabled = false;
        audio.pause();
    } else {
        musicEnabled = true;
        startMusic();
    }
    updateMusicButton();
    saveState();
}

musicButton.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMusic();
});

volumeSlider.addEventListener("input", (e) => {
    e.stopPropagation();
    audio.volume = Number(volumeSlider.value) / 100;
    if (audio.volume === 0) {
        musicEnabled = false;
        audio.pause();
    } else {
        musicEnabled = true;
        startMusic();
    }
    updateMusicButton();
    saveState();
});

volumeSlider.addEventListener("click", (e) => e.stopPropagation());

audio.addEventListener("loadedmetadata", () => {
    if (savedTime > 0 && savedTime < audio.duration) {
        try { audio.currentTime = savedTime; } catch (e) {}
    }
    savedTime = 0;
    if (musicEnabled && wasPlaying) {
        startMusic();
    }
    updateMusicButton();
});

audio.addEventListener("ended", () => {
    currentTrack = (currentTrack + 1) % tracks.length;
    audio.src = tracks[currentTrack];
    savedTime = 0;
    if (musicEnabled) {
        startMusic();
    }
    saveState();
});

// Sblocco per autoplay al primo tocco dell'utente (per iOS/Safari e Android)
const handleFirstTouch = () => {
    if (musicEnabled && audio.paused) {
        startMusic();
    }
};

document.addEventListener("touchstart", handleFirstTouch, { passive: true, once: true });
document.addEventListener("pointerdown", handleFirstTouch, { passive: true, once: true });

setInterval(saveState, 1000);
window.addEventListener("beforeunload", saveState);
document.addEventListener("visibilitychange", saveState);

// --- API PUBLICA ---
window.SantaCruzMusic = {
    play: () => { musicEnabled = true; startMusic(); },
    pause: () => { musicEnabled = false; audio.pause(); updateMusicButton(); saveState(); },
    toggle: toggleMusic,
    setVolume: (val) => {
        audio.volume = Math.max(0, Math.min(1, val));
        volumeSlider.value = Math.round(audio.volume * 100);
        if (audio.volume === 0) { musicEnabled = false; audio.pause(); }
        else { musicEnabled = true; startMusic(); }
        updateMusicButton();
        saveState();
    },
    getVolume: () => audio.volume,
    getCurrentTrack: () => currentTrack
};

// Avvio
updateMusicButton();
if (musicEnabled && wasPlaying) {
    startMusic();
              }
