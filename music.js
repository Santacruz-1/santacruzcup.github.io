const tracks = [
    "data/Jefe - Run! (side quest).mp3",
    "data/no mix no master.mp3"
];

const STORAGE_KEY = "santaCruzCupMusic";
const DEFAULT_VOLUME = 0.10;

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


// ======================================
// PANNELLO MUSICA
// ======================================

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


// ======================================
// PULSANTE
// ======================================

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


// ======================================
// VOLUME
// ======================================

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


// ======================================
// AVVISO AUTOPLAY
// ======================================

const autoplayNotice = document.createElement("button");

autoplayNotice.type = "button";
autoplayNotice.textContent = "▶ Attiva musica";

Object.assign(autoplayNotice.style, {
    position: "fixed",
    bottom: "65px",
    right: "12px",
    zIndex: "100000",
    display: "none",
    padding: "8px 13px",
    border: "none",
    borderRadius: "18px",
    background: "rgba(17,17,17,0.92)",
    color: "white",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "0 3px 12px rgba(0,0,0,0.25)"
});

document.body.appendChild(autoplayNotice);


// ======================================
// HOVER
// ======================================

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

    musicPanel.style.boxShadow = "none";

    musicPanel.style.backdropFilter =
        "blur(2px)";

    musicPanel.style.WebkitBackdropFilter =
        "blur(2px)";
});


// ======================================
// STATO
// ======================================

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
                    ? Math.max(
                        0,
                        Math.min(1, saved.volume)
                    )
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


function saveState() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            track: currentTrack,
            time: audio.currentTime || 0,
            volume: audio.volume,
            enabled: musicEnabled,
            playing: !audio.paused
        })
    );
}


// ======================================
// UI
// ======================================

function updateMusicButton() {

    musicButton.textContent =
        musicEnabled && !audio.paused
            ? "🎵 ON"
            : "🔇 OFF";
}


function showAutoplayNotice() {

    if (!musicEnabled) {
        return;
    }

    if (audio.paused) {
        autoplayNotice.style.display = "block";
    }
}


function hideAutoplayNotice() {

    autoplayNotice.style.display = "none";
}


// ======================================
// AVVIO MUSICA
// ======================================

function startMusic() {

    musicEnabled = true;

    return audio.play()
        .then(() => {

            hideAutoplayNotice();
            updateMusicButton();
            saveState();

        })
        .catch(() => {

            showAutoplayNotice();
            updateMusicButton();
        });
}


// ======================================
// ON / OFF
// ======================================

function toggleMusic() {

    if (musicEnabled && !audio.paused) {

        musicEnabled = false;

        audio.pause();

        hideAutoplayNotice();

    } else {

        startMusic();
    }

    updateMusicButton();
    saveState();
}


// ======================================
// EVENTI PULSANTE
// ======================================

musicButton.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        toggleMusic();
    }
);


// ======================================
// AVVISO AUTOPLAY
// ======================================

autoplayNotice.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        startMusic();
    }
);


// ======================================
// VOLUME
// ======================================

volumeSlider.addEventListener(
    "input",
    event => {

        event.stopPropagation();

        audio.volume =
            Number(volumeSlider.value) / 100;

        if (audio.volume === 0) {

            musicEnabled = false;

            audio.pause();

            hideAutoplayNotice();

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


// ======================================
// PRIMO CLICK / TOCCO
// ======================================

function handleFirstInteraction() {

    if (
        musicEnabled &&
        audio.paused
    ) {
        startMusic();
    }
}

document.addEventListener(
    "pointerdown",
    handleFirstInteraction,
    { once: true }
);


// ======================================
// CARICAMENTO BRANO
// ======================================

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


// ======================================
// CAMBIO BRANO
// ======================================

audio.addEventListener(
    "ended",
    () => {

        currentTrack =
            (currentTrack + 1) % tracks.length;

        audio.src = tracks[currentTrack];

        if (musicEnabled) {
            startMusic();
        }

        saveState();
    }
);


// ======================================
// PROVA AUTOPLAY
// ======================================

window.addEventListener(
    "load",
    () => {

        updateMusicButton();

        if (musicEnabled) {
            startMusic();
        }
    }
);


// ======================================
// SALVATAGGIO
// ======================================

setInterval(
    saveState,
    1000
);

window.addEventListener(
    "beforeunload",
    saveState
);

document.addEventListener(
    "visibilitychange",
    saveState
);


// ======================================
// API
// ======================================

window.SantaCruzMusic = {

    play() {
        startMusic();
    },

    pause() {

        musicEnabled = false;

        audio.pause();

        hideAutoplayNotice();
        updateMusicButton();
        saveState();
    },

    toggle() {
        toggleMusic();
    },

    setVolume(value) {

        audio.volume = Math.max(
            0,
            Math.min(1, value)
        );

        volumeSlider.value =
            Math.round(
                audio.volume * 100
            );

        saveState();
    },

    getVolume() {
        return audio.volume;
    },

    getCurrentTrack() {
        return currentTrack;
    }
};

updateMusicButton();

if (musicEnabled) {
    startMusic();
}
