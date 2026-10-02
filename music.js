```javascript
// ================================
// SANTA CRUZ CUP - MUSIC PLAYER
// ================================

const tracks = [
    "data/Jefe - Run! (side quest).mp3",
    "data/no mix no master.mp3"
];

const STORAGE_KEY = "santaCruzCupMusic";

const audio = new Audio();
audio.preload = "auto";

// -------------------------------
// Recupera stato precedente
// -------------------------------

let savedState = {};

try {
    savedState = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "{}"
    );
} catch (e) {
    savedState = {};
}

let currentTrack =
    Number.isInteger(savedState.track)
        ? savedState.track
        : 0;

let savedTime =
    typeof savedState.time === "number"
        ? savedState.time
        : 0;

let volume =
    typeof savedState.volume === "number"
        ? savedState.volume
        : 0.12;

let wasPlaying =
    savedState.playing === true;

// Controlli di sicurezza
if (currentTrack < 0 || currentTrack >= tracks.length) {
    currentTrack = 0;
}

volume = Math.max(0, Math.min(1, volume));

audio.volume = volume;
audio.src = tracks[currentTrack];

// -------------------------------
// Salva lo stato
// -------------------------------

function saveMusicState() {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            track: currentTrack,
            time: audio.currentTime || 0,
            volume: audio.volume,
            playing: !audio.paused
        })
    );
}

// Salva periodicamente la posizione
setInterval(saveMusicState, 1000);

// Salva quando si cambia pagina
window.addEventListener("beforeunload", saveMusicState);

document.addEventListener("visibilitychange", () => {
    saveMusicState();
});

// -------------------------------
// Ripristina posizione
// -------------------------------

audio.addEventListener("loadedmetadata", () => {

    if (savedTime > 0 && savedTime < audio.duration) {
        audio.currentTime = savedTime;
    }

    savedTime = 0;

    if (wasPlaying) {
        audio.play().catch(() => {
            // Il browser potrebbe bloccare l'autoplay
        });
    }
});

// -------------------------------
// Passa al brano successivo
// -------------------------------

audio.addEventListener("ended", () => {

    currentTrack =
        (currentTrack + 1) % tracks.length;

    savedTime = 0;

    audio.src = tracks[currentTrack];

    audio.play().catch(() => {});

    saveMusicState();
});

// -------------------------------
// Primo avvio
// -------------------------------

window.addEventListener("load", () => {

    if (!wasPlaying) {
        // Primo accesso al sito:
        // prova ad avviare la musica
        audio.play().catch(() => {});
    }
});

// -------------------------------
// Se l'autoplay viene bloccato
// parte al primo click/tocco
// -------------------------------

function resumeMusic() {

    if (audio.paused) {
        audio.play().catch(() => {});
    }

    document.removeEventListener("click", resumeMusic);
    document.removeEventListener("touchstart", resumeMusic);
}

document.addEventListener("click", resumeMusic);
document.addEventListener("touchstart", resumeMusic);

// -------------------------------
// API semplice per i controlli
// -------------------------------

window.SantaCruzMusic = {

    play() {
        audio.play().catch(() => {});
    },

    pause() {
        audio.pause();
        saveMusicState();
    },

    toggle() {
        if (audio.paused) {
            audio.play().catch(() => {});
        } else {
            audio.pause();
            saveMusicState();
        }
    },

    setVolume(value) {
        audio.volume = Math.max(
            0,
            Math.min(1, value)
        );

        saveMusicState();
    },

    getVolume() {
        return audio.volume;
    },

    getCurrentTrack() {
        return currentTrack;
    }
};
```
