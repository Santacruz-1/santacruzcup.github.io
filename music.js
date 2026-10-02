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

// ================================
// RECUPERA STATO
// ================================

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
    savedState.enabled !== false;

let wasPlaying =
    savedState.playing === true;

if (currentTrack < 0 || currentTrack >= tracks.length) {
    currentTrack = 0;
}

volume = Math.max(0, Math.min(1, volume));

audio.volume = volume;
audio.src = tracks[currentTrack];


// ================================
// PANNELLO MUSICA
// ================================

const musicPanel = document.createElement("div");

musicPanel.id = "santaCruzMusicPanel";

musicPanel.style.position = "fixed";
musicPanel.style.bottom = "12px";
musicPanel.style.right = "12px";
musicPanel.style.zIndex = "99999";

musicPanel.style.display = "flex";
musicPanel.style.alignItems = "center";
musicPanel.style.gap = "8px";

musicPanel.style.padding = "7px 10px";

musicPanel.style.background = "rgba(17,17,17,0.92)";
musicPanel.style.borderRadius = "22px";

musicPanel.style.boxShadow =
    "0 3px 12px rgba(0,0,0,0.25)";

musicPanel.style.fontFamily =
    "Arial, sans-serif";


// ================================
// PULSANTE ON/OFF
// ================================

const musicButton = document.createElement("button");

musicButton.type = "button";

musicButton.style.border = "none";
musicButton.style.background = "transparent";
musicButton.style.color = "white";

musicButton.style.fontSize = "13px";
musicButton.style.fontWeight = "600";

musicButton.style.cursor = "pointer";

musicButton.style.padding = "3px 4px";

musicPanel.appendChild(musicButton);


// ================================
// ICONA VOLUME
// ================================

const volumeIcon = document.createElement("span");

volumeIcon.textContent = "🔊";

volumeIcon.style.fontSize = "14px";

musicPanel.appendChild(volumeIcon);


// ================================
// BARRA VOLUME
// ================================

const volumeSlider = document.createElement("input");

volumeSlider.type = "range";

volumeSlider.min = "0";
volumeSlider.max = "100";
volumeSlider.step = "1";

volumeSlider.value = Math.round(volume * 100);

volumeSlider.style.width = "75px";
volumeSlider.style.height = "4px";

volumeSlider.style.cursor = "pointer";

musicPanel.appendChild(volumeSlider);


// ================================
// AGGIUNGE IL PANNELLO ALLA PAGINA
// ================================

document.body.appendChild(musicPanel);


// ================================
// AGGIORNA PULSANTE
// ================================

function updateMusicButton() {

    if (musicEnabled && !audio.paused) {

        musicButton.textContent = "🎵 ON";

        musicButton.style.opacity = "1";

    } else {

        musicButton.textContent = "🔇 OFF";

        musicButton.style.opacity = "0.75";
    }
}


// ================================
// SALVA STATO
// ================================

function saveMusicState() {

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


// ================================
// SALVATAGGIO AUTOMATICO
// ================================

setInterval(saveMusicState, 1000);

window.addEventListener(
    "beforeunload",
    saveMusicState
);

document.addEventListener(
    "visibilitychange",
    saveMusicState
);


// ================================
// ON / OFF
// ================================

musicButton.addEventListener("click", function(event) {

    event.stopPropagation();

    if (musicEnabled) {

        musicEnabled = false;

        audio.pause();

    } else {

        musicEnabled = true;

        audio.play().catch(() => {});
    }

    updateMusicButton();
    saveMusicState();
});


// ================================
// VOLUME
// ================================

volumeSlider.addEventListener("input", function(event) {

    event.stopPropagation();

    const value =
        Number(volumeSlider.value) / 100;

    audio.volume = value;

    // Se alzo il volume da 0,
    // riattiva automaticamente la musica
    if (value > 0 && !musicEnabled) {

        musicEnabled = true;

        audio.play().catch(() => {});
    }

    // Se porto il volume a 0,
    // mettiamo la musica in OFF
    if (value === 0) {

        musicEnabled = false;

        audio.pause();
    }

    updateMusicButton();
    saveMusicState();
});


// Evita che il click sulla barra
// venga interpretato come click generale
volumeSlider.addEventListener(
    "click",
    function(event) {
        event.stopPropagation();
    }
);


// ================================
// RIPRISTINO POSIZIONE
// ================================

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

        if (
            musicEnabled &&
            wasPlaying
        ) {
            audio.play().catch(() => {});
        }

        updateMusicButton();
    }
);


// ================================
// CAMBIO BRANO
// ================================

audio.addEventListener(
    "ended",
    function() {

        currentTrack =
            (currentTrack + 1) % tracks.length;

        savedTime = 0;

        audio.src = tracks[currentTrack];

        if (musicEnabled) {
            audio.play().catch(() => {});
        }

        updateMusicButton();
        saveMusicState();
    }
);


// ================================
// AVVIO
// ================================

window.addEventListener(
    "load",
    function() {

        updateMusicButton();

        if (
            musicEnabled &&
            !wasPlaying
        ) {
            audio.play().catch(() => {});
        }
    }
);


// ================================
// PRIMO CLICK / TOUCH
// ================================

function resumeMusic() {

    if (
        musicEnabled &&
        audio.paused
    ) {
        audio.play().catch(() => {});
    }

    updateMusicButton();

    document.removeEventListener(
        "click",
        resumeMusic
    );

    document.removeEventListener(
        "touchstart",
        resumeMusic
    );
}

document.addEventListener(
    "click",
    resumeMusic
);

document.addEventListener(
    "touchstart",
    resumeMusic
);


// ================================
// API
// ================================

window.SantaCruzMusic = {

    play() {

        musicEnabled = true;

        audio.play().catch(() => {});

        updateMusicButton();
        saveMusicState();
    },

    pause() {

        musicEnabled = false;

        audio.pause();

        updateMusicButton();
        saveMusicState();
    },

    toggle() {

        if (musicEnabled) {

            musicEnabled = false;

            audio.pause();

        } else {

            musicEnabled = true;

            audio.play().catch(() => {});
        }

        updateMusicButton();
        saveMusicState();
    },

    setVolume(value) {

        audio.volume =
            Math.max(
                0,
                Math.min(1, value)
            );

        volumeSlider.value =
            Math.round(audio.volume * 100);

        saveMusicState();
    },

    getVolume() {
        return audio.volume;
    },

    getCurrentTrack() {
        return currentTrack;
    }
};

updateMusicButton();
