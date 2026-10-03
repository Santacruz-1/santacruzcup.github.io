// ============================================
// SANTA CRUZ CUP - MUSIC PLAYER
// ============================================

const tracks = [
    "data/Jefe - Run! (side quest).mp3",
    "data/no mix no master.mp3"
];

const STORAGE_KEY = "santaCruzCupMusic";
const DEFAULT_VOLUME = 0.12;

// ============================================
// AUDIO
// ============================================

const audio = new Audio();
audio.preload = "auto";

let musicState = loadState();

let currentTrack = musicState.track;
let savedTime = musicState.time;
let volume = musicState.volume;
let musicEnabled = musicState.enabled;
let wasPlaying = musicState.playing;

// Impostazioni iniziali
audio.volume = volume;
audio.src = tracks[currentTrack];


// ============================================
// PANNELLO MUSICA
// ============================================

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

    boxShadow: "none",

    backdropFilter: "blur(2px)",
    WebkitBackdropFilter: "blur(2px)",

    opacity: "0.28",

    transition:
        "opacity 0.25s ease, background 0.25s ease, box-shadow 0.25s ease",

    fontFamily: "Arial, sans-serif"
});


// ============================================
// PULSANTE ON / OFF
// ============================================

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


// ============================================
// VOLUME
// ============================================

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


// ============================================
// CREDIT
// ============================================

const musicCredit = document.createElement("div");

musicCredit.textContent = "Music by Jefe";

Object.assign(musicCredit.style, {
    color: "rgba(255,255,255,0.65)",
    fontSize: "7px",
    lineHeight: "8px",
    letterSpacing: "0.2px",
    textAlign: "center"
});


// ============================================
// COSTRUZIONE INTERFACCIA
// ============================================

volumeRow.append(
    volumeIcon,
    volumeSlider
);

volumeContainer.append(
    volumeRow,
    musicCredit
);

musicPanel.append(
    musicButton,
    volumeContainer
);

document.body.appendChild(musicPanel);


// ============================================
// HOVER
// ============================================

musicPanel.addEventListener("mouseenter", () => {

    musicPanel.style.opacity = "1";

    musicPanel.style.background =
        "rgba(17,17,17,0.92)";

    musicPanel.style.boxShadow =
        "0 3px 12px rgba(0,0,0,0.25)";

    musicPanel.style.backdropFilter =
        "blur(6px)";

    musicPanel.style.WebkitBackdropFilter =
        "blur(6px)";
});


musicPanel.addEventListener("mouseleave", () => {

    musicPanel.style.opacity = "0.28";

    musicPanel.style.background =
        "rgba(17,17,17,0.18)";

    musicPanel.style.boxShadow =
        "none";

    musicPanel.style.backdropFilter =
        "blur(2px)";

    musicPanel.style.WebkitBackdropFilter =
        "blur(2px)";
});


// ============================================
// LOCAL STORAGE
// ============================================

function loadState() {

    try {

        const saved = JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "{}"
        );

        return {

            track:
                Number.isInteger(saved.track) &&
                saved.track >= 0 &&
                saved.track < tracks.length
                    ? saved.track
                    : 0,

            time:
                typeof saved.time === "number"
                    ? saved.time
                    : 0,

            volume:
                typeof saved.volume === "number"
                    ? Math.max(0, Math.min(1, saved.volume))
                    : DEFAULT_VOLUME,

            enabled:
                saved.enabled !== false,

            playing:
                saved.playing === true
        };

    } catch {

        return {

            track: 0,

            time: 0,

            volume: DEFAULT_VOLUME,

            enabled: true,

            playing: false
        };
    }
}


// ============================================
// SALVATAGGIO STATO
// ============================================

function saveState() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({

                track: currentTrack,

                time:
                    audio.currentTime || 0,

                volume:
                    audio.volume,

                enabled:
                    musicEnabled,

                playing:
                    !audio.paused
            })
        );

    } catch {
        // Ignora eventuali errori localStorage
    }
}


// ============================================
// AGGIORNA PULSANTE
// ============================================

function updateMusicButton() {

    if (musicEnabled && !audio.paused) {

        musicButton.textContent = "🎵 ON";

    } else {

        musicButton.textContent = "🔇 OFF";
    }
}


// ============================================
// AVVIO MUSICA
// ============================================

function startMusic() {

    if (audio.volume === 0) {
        return Promise.resolve();
    }

    musicEnabled = true;

    return audio.play()
        .then(() => {

            updateMusicButton();

            saveState();

        })
        .catch(() => {

            // Il browser ha bloccato l'autoplay.
            // La musica partirà al primo click/tocco.
            updateMusicButton();
        });
}


// ============================================
// CLICK / TOCCO QUALSIASI PUNTO
// ============================================

function handleFirstInteraction() {

    // Se l'utente ha spento manualmente la musica,
    // non la riaccendiamo automaticamente.
    if (!musicEnabled) {
        return;
    }

    // Se è già in riproduzione, non facciamo nulla.
    if (!audio.paused) {
        return;
    }

    startMusic();
}


// Ascolta il primo click/tocco sulla pagina.
// Dopo il primo utilizzo viene rimosso.
document.addEventListener(
    "pointerdown",
    handleFirstInteraction,
    {
        once: true,
        passive: true
    }
);


// ============================================
// ON / OFF MANUALE
// ============================================

function toggleMusic() {

    if (musicEnabled && !audio.paused) {

        // OFF
        musicEnabled = false;

        audio.pause();

    } else {

        // ON
        musicEnabled = true;

        startMusic();
    }

    updateMusicButton();

    saveState();
}


musicButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        toggleMusic();
    }
);


// ============================================
// VOLUME
// ============================================

volumeSlider.addEventListener(
    "input",
    event => {

        event.stopPropagation();

        audio.volume =
            Number(volumeSlider.value) / 100;

        if (audio.volume === 0) {

            musicEnabled = false;

            audio.pause();

        } else {

            musicEnabled = true;

            startMusic();
        }

        updateMusicButton();

        saveState();
    }
);


volumeSlider.addEventListener(
    "click",
    event => {

        event.stopPropagation();
    }
);


// ============================================
// CARICAMENTO TRACCIA
// ============================================

audio.addEventListener(
    "loadedmetadata",
    () => {

        if (
            savedTime > 0 &&
            savedTime < audio.duration
        ) {

            audio.currentTime = savedTime;
        }

        savedTime = 0;

        if (
            musicEnabled &&
            wasPlaying
        ) {

            startMusic();
        }

        updateMusicButton();
    }
);


// ============================================
// FINE CANZONE → CANZONE SUCCESSIVA
// ============================================

audio.addEventListener(
    "ended",
    () => {

        currentTrack =
            (currentTrack + 1) % tracks.length;

        audio.src =
            tracks[currentTrack];

        savedTime = 0;

        if (musicEnabled) {

            startMusic();
        }

        saveState();
    }
);


// ============================================
// CARICAMENTO PAGINA
// ============================================

window.addEventListener(
    "load",
    () => {

        updateMusicButton();

        // Prova subito l'autoplay.
        // Se il browser lo blocca,
        // partirà al primo click/tocco.
        if (musicEnabled) {

            startMusic();
        }
    }
);


// ============================================
// SALVATAGGIO PERIODICO
// ============================================

setInterval(
    saveState,
    1000
);


// ============================================
// SALVATAGGIO PRIMA DI CAMBIARE PAGINA
// ============================================

window.addEventListener(
    "beforeunload",
    saveState
);


document.addEventListener(
    "visibilitychange",
    saveState
);


// ============================================
// API FACOLTATIVA
// ============================================

window.SantaCruzMusic = {

    play() {

        musicEnabled = true;

        startMusic();
    },

    pause() {

        musicEnabled = false;

        audio.pause();

        updateMusicButton();

        saveState();
    },

    toggle() {

        toggleMusic();
    },

    setVolume(value) {

        audio.volume =
            Math.max(
                0,
                Math.min(1, value)
            );

        volumeSlider.value =
            Math.round(
                audio.volume * 100
            );

        if (audio.volume === 0) {

            musicEnabled = false;

            audio.pause();

        } else {

            musicEnabled = true;
        }

        updateMusicButton();

        saveState();
    },

    getVolume() {

        return audio.volume;
    },

    getCurrentTrack() {

        return currentTrack;
    }
};


// ============================================
// AVVIO INIZIALE
// ============================================

updateMusicButton();

if (musicEnabled) {

    startMusic();
}
