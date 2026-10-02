const tracks = [
    "data/Jefe - Run! (side quest).mp3",
    "data/no mix no master.mp3"
];

const STORAGE_KEY = "santaCruzCupMusic";

const audio = new Audio();
audio.preload = "auto";

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

let musicEnabled =
    savedState.enabled === true;

let wasPlaying =
    savedState.playing === true;

if (currentTrack < 0 || currentTrack >= tracks.length) {
    currentTrack = 0;
}

volume = Math.max(0, Math.min(1, volume));

audio.volume = volume;
audio.src = tracks[currentTrack];


// ======================================
// PANNELLO MUSICA
// ======================================

const panel = document.createElement("div");

panel.style.position = "fixed";
panel.style.bottom = "12px";
panel.style.right = "12px";
panel.style.zIndex = "99999";

panel.style.display = "flex";
panel.style.alignItems = "center";
panel.style.gap = "8px";

panel.style.padding = "7px 10px";

panel.style.background = "rgba(17,17,17,0.92)";
panel.style.borderRadius = "22px";

panel.style.boxShadow =
    "0 3px 12px rgba(0,0,0,0.25)";

panel.style.fontFamily = "Arial, sans-serif";


// ======================================
// PULSANTE ON/OFF
// ======================================

const button = document.createElement("button");

button.type = "button";

button.style.border = "none";
button.style.background = "transparent";
button.style.color = "white";

button.style.fontSize = "13px";
button.style.fontWeight = "600";

button.style.cursor = "pointer";

button.textContent = "🔇 OFF";

panel.appendChild(button);


// ======================================
// CONTENITORE VOLUME
// ======================================

const volumeContainer = document.createElement("div");

volumeContainer.style.display = "flex";
volumeContainer.style.flexDirection = "column";
volumeContainer.style.alignItems = "center";
volumeContainer.style.gap = "2px";


// ======================================
// RIGA VOLUME
// ======================================

const volumeRow = document.createElement("div");

volumeRow.style.display = "flex";
volumeRow.style.alignItems = "center";
volumeRow.style.gap = "5px";


// Icona volume
const icon = document.createElement("span");

icon.textContent = "🔊";
icon.style.fontSize = "14px";

volumeRow.appendChild(icon);


// Slider
const slider = document.createElement("input");

slider.type = "range";
slider.min = "0";
slider.max = "100";
slider.step = "1";

slider.value = Math.round(volume * 100);

slider.style.width = "75px";
slider.style.cursor = "pointer";

volumeRow.appendChild(slider);

volumeContainer.appendChild(volumeRow);


// ======================================
// MUSIC BY JEFE
// ======================================

const credit = document.createElement("div");

credit.textContent = "Music by Jefe";

credit.style.color = "rgba(255,255,255,0.65)";
credit.style.fontSize = "8px";
credit.style.lineHeight = "9px";
credit.style.letterSpacing = "0.3px";

credit.style.textAlign = "center";

volumeContainer.appendChild(credit);


// Aggiunge il contenitore al pannello
panel.appendChild(volumeContainer);


// Aggiunge il pannello alla pagina
document.body.appendChild(panel);


// ======================================
// AGGIORNA PULSANTE
// ======================================

function updateButton() {

    if (musicEnabled && !audio.paused) {

        button.textContent = "🎵 ON";

    } else {

        button.textContent = "🔇 OFF";
    }
}


// ======================================
// SALVA STATO
// ======================================

function saveState() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
            track: currentTrack,
            time: audio.currentTime || 0,
            volume: audio.volume,
            playing: !audio.paused,
            enabled: musicEnabled
        })
    );
}


// ======================================
// PULSANTE ON/OFF
// ======================================

button.addEventListener("click", function(e) {

    e.stopPropagation();

    if (musicEnabled) {

        musicEnabled = false;

        audio.pause();

    } else {

        musicEnabled = true;

        audio.play().catch(() => {});
    }

    updateButton();
    saveState();
});


// ======================================
// VOLUME
// ======================================

slider.addEventListener("input", function(e) {

    e.stopPropagation();

    audio.volume =
        Number(slider.value) / 100;

    if (audio.volume > 0) {

        musicEnabled = true;

        audio.play().catch(() => {});

    } else {

        musicEnabled = false;

        audio.pause();
    }

    updateButton();
    saveState();
});


// ======================================
// PRIMO CLICK SUL SITO
// ======================================

function firstUserInteraction() {

    if (!musicEnabled) {

        musicEnabled = true;

        audio.play().catch(() => {});

        updateButton();

        saveState();
    }

    document.removeEventListener(
        "pointerdown",
        firstUserInteraction
    );
}

document.addEventListener(
    "pointerdown",
    firstUserInteraction,
    { once: true }
);


// ======================================
// RIPRISTINA POSIZIONE
// ======================================

audio.addEventListener(
    "loadedmetadata",
    function() {

        if (
            savedTime > 0 &&
            savedTime < audio.duration
        ) {
            audio.currentTime = savedTime;
        }

        savedTime = 0;

        if (musicEnabled && wasPlaying) {

            audio.play().catch(() => {});
        }

        updateButton();
    }
);


// ======================================
// CAMBIO BRANO
// ======================================

audio.addEventListener(
    "ended",
    function() {

        currentTrack =
            (currentTrack + 1) % tracks.length;

        audio.src = tracks[currentTrack];

        if (musicEnabled) {

            audio.play().catch(() => {});
        }

        saveState();
    }
);


// ======================================
// SALVATAGGIO AUTOMATICO
// ======================================

setInterval(saveState, 1000);

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

        musicEnabled = true;

        audio.play().catch(() => {});

        updateButton();
        saveState();
    },

    pause() {

        musicEnabled = false;

        audio.pause();

        updateButton();
        saveState();
    },

    toggle() {

        if (musicEnabled) {

            musicEnabled = false;

            audio.pause();

        } else {

            musicEnabled = true;

            audio.play().catch(() => {});
        }

        updateButton();
        saveState();
    },

    setVolume(value) {

        audio.volume =
            Math.max(
                0,
                Math.min(1, value)
            );

        slider.value =
            Math.round(audio.volume * 100);

        saveState();
    }
};

updateButton();
