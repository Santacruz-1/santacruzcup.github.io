// ============================================================
// SANTA CRUZ CUP - MUSIC PLAYER
// VERSIONE STABILE
// ============================================================

(() => {

    "use strict";


    // ========================================================
    // CONFIGURAZIONE
    // ========================================================

    const tracks = [
        "data/Jefe - Run! (side quest).mp3",
        "data/no mix no master.mp3"
    ];

    const STORAGE_KEY = "santaCruzCupMusic_v2";

    const DEFAULT_VOLUME = 0.12;

    // Ogni quanto aggiorniamo il tempo salvato
    const SAVE_INTERVAL = 250;


    // ========================================================
    // AUDIO
    // ========================================================

    const audio = new Audio();

    audio.preload = "auto";

    audio.volume = DEFAULT_VOLUME;


    // ========================================================
    // STATO
    // ========================================================

    let state = loadState();

    let currentTrack = state.track;

    let musicEnabled = state.enabled;

    let wasPlaying = state.playing;

    let savedTime = state.time;

    let restoring = true;

    let playPromise = null;


    // ========================================================
    // CONFIGURA AUDIO
    // ========================================================

    audio.volume = state.volume;

    audio.src = tracks[currentTrack];


    // ========================================================
    // PANNELLO
    // ========================================================

    const musicPanel =
        document.createElement("div");


    Object.assign(
        musicPanel.style,
        {

            position: "fixed",

            bottom: "12px",

            right: "12px",

            zIndex: "99999",

            display: "flex",

            alignItems: "center",

            gap: "8px",

            padding: "6px 9px",

            background:
                "rgba(17,17,17,0.18)",

            border:
                "1px solid rgba(255,255,255,0.08)",

            borderRadius: "20px",

            boxShadow: "none",

            backdropFilter: "blur(2px)",

            WebkitBackdropFilter:
                "blur(2px)",

            opacity: "0.28",

            transition:
                "opacity .25s ease, background .25s ease, box-shadow .25s ease",

            fontFamily:
                "Arial, sans-serif"

        }
    );


    // ========================================================
    // BOTTONE
    // ========================================================

    const musicButton =
        document.createElement("button");


    musicButton.type = "button";


    Object.assign(
        musicButton.style,
        {

            border: "none",

            background: "transparent",

            color: "white",

            fontSize: "12px",

            fontWeight: "600",

            cursor: "pointer",

            padding: "2px 3px"

        }
    );


    // ========================================================
    // VOLUME
    // ========================================================

    const volumeContainer =
        document.createElement("div");


    Object.assign(
        volumeContainer.style,
        {

            display: "flex",

            flexDirection: "column",

            alignItems: "center",

            gap: "2px"

        }
    );


    const volumeRow =
        document.createElement("div");


    Object.assign(
        volumeRow.style,
        {

            display: "flex",

            alignItems: "center",

            gap: "4px"

        }
    );


    const volumeIcon =
        document.createElement("span");


    volumeIcon.textContent = "🔊";

    volumeIcon.style.fontSize = "13px";


    const volumeSlider =
        document.createElement("input");


    volumeSlider.type = "range";

    volumeSlider.min = "0";

    volumeSlider.max = "100";

    volumeSlider.step = "1";

    volumeSlider.value =
        Math.round(
            audio.volume * 100
        );


    Object.assign(
        volumeSlider.style,
        {

            width: "70px",

            height: "3px",

            cursor: "pointer"

        }
    );


    // ========================================================
    // CREDIT
    // ========================================================

    const musicCredit =
        document.createElement("div");


    musicCredit.textContent =
        "Music by Jefe";


    Object.assign(
        musicCredit.style,
        {

            color:
                "rgba(255,255,255,.65)",

            fontSize: "7px",

            lineHeight: "8px",

            letterSpacing: ".2px",

            textAlign: "center"

        }
    );


    // ========================================================
    // COSTRUISCI PANNELLO
    // ========================================================

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


    document.body.appendChild(
        musicPanel
    );


    // ========================================================
    // HOVER
    // ========================================================

    musicPanel.addEventListener(
        "mouseenter",
        () => {

            musicPanel.style.opacity = "1";

            musicPanel.style.background =
                "rgba(17,17,17,.92)";

            musicPanel.style.boxShadow =
                "0 3px 12px rgba(0,0,0,.25)";

            musicPanel.style.backdropFilter =
                "blur(6px)";

            musicPanel.style.WebkitBackdropFilter =
                "blur(6px)";

        }
    );


    musicPanel.addEventListener(
        "mouseleave",
        () => {

            musicPanel.style.opacity = ".28";

            musicPanel.style.background =
                "rgba(17,17,17,.18)";

            musicPanel.style.boxShadow =
                "none";

            musicPanel.style.backdropFilter =
                "blur(2px)";

            musicPanel.style.WebkitBackdropFilter =
                "blur(2px)";

        }
    );


    // ========================================================
    // CARICA STATO
    // ========================================================

    function loadState() {

        try {

            const saved =
                JSON.parse(
                    localStorage.getItem(
                        STORAGE_KEY
                    ) || "{}"
                );


            return {

                track:
                    Number.isInteger(
                        saved.track
                    ) &&
                    saved.track >= 0 &&
                    saved.track < tracks.length
                        ? saved.track
                        : 0,


                time:
                    Number.isFinite(
                        saved.time
                    )
                        ? Math.max(
                            0,
                            saved.time
                        )
                        : 0,


                volume:
                    Number.isFinite(
                        saved.volume
                    )
                        ? Math.max(
                            0,
                            Math.min(
                                1,
                                saved.volume
                            )
                        )
                        : DEFAULT_VOLUME,


                enabled:
                    saved.enabled !== false,


                playing:
                    saved.playing === true

            };

        }

        catch {

            return {

                track: 0,

                time: 0,

                volume: DEFAULT_VOLUME,

                enabled: true,

                playing: false

            };

        }

    }


    // ========================================================
    // SALVA STATO
    // ========================================================

    function saveState() {

        try {

            localStorage.setItem(

                STORAGE_KEY,

                JSON.stringify({

                    track:
                        currentTrack,

                    time:
                        Number.isFinite(
                            audio.currentTime
                        )
                            ? audio.currentTime
                            : savedTime,

                    volume:
                        audio.volume,

                    enabled:
                        musicEnabled,

                    playing:
                        musicEnabled &&
                        !audio.paused

                })

            );

        }

        catch {}

    }


    // ========================================================
    // SALVA POSIZIONE
    // ========================================================

    function savePosition() {

        if (
            !Number.isFinite(
                audio.currentTime
            )
        ) {

            return;

        }


        savedTime =
            audio.currentTime;


        saveState();

    }


    // ========================================================
    // AGGIORNA BOTTONE
    // ========================================================

    function updateMusicButton() {

        if (
            musicEnabled &&
            !audio.paused
        ) {

            musicButton.textContent =
                "🎵 ON";

        }

        else {

            musicButton.textContent =
                "🔇 OFF";

        }

    }


    // ========================================================
    // RIPRISTINA POSIZIONE
    // ========================================================

    function restorePosition() {

        if (!restoring) {

            return;

        }


        if (
            !Number.isFinite(
                audio.duration
            ) ||
            audio.duration <= 0
        ) {

            return;

        }


        if (
            savedTime > 0 &&
            savedTime < audio.duration - 0.5
        ) {

            try {

                audio.currentTime =
                    savedTime;

            }

            catch {}

        }


        restoring = false;

    }


    // ========================================================
    // PLAY
    // ========================================================

    function startMusic() {

        if (
            !musicEnabled ||
            audio.volume <= 0
        ) {

            return;
        }


        if (
            !audio.paused
        ) {

            return;
        }


        if (playPromise) {

            return playPromise;

        }


        playPromise =
            audio.play()

            .then(
                () => {

                    updateMusicButton();

                    saveState();

                }
            )

            .catch(
                () => {

                    updateMusicButton();

                }
            )

            .finally(
                () => {

                    playPromise = null;

                }
            );

    }


    // ========================================================
    // PLAY DOPO CARICAMENTO
    // ========================================================

    audio.addEventListener(
        "loadedmetadata",
        () => {

            restorePosition();

            updateMusicButton();


            if (
                musicEnabled &&
                wasPlaying
            ) {

                startMusic();

            }

        }
    );


    // ========================================================
    // CANZONE PRONTA
    // ========================================================

    audio.addEventListener(
        "canplay",
        () => {

            restorePosition();

        }
    );


    // ========================================================
    // TIMEUPDATE
    // ========================================================

    let lastSave = 0;


    audio.addEventListener(
        "timeupdate",
        () => {

            const now =
                Date.now();


            if (
                now - lastSave <
                SAVE_INTERVAL
            ) {

                return;

            }


            lastSave = now;

            savePosition();

        }
    );


    // ========================================================
    // FINE CANZONE
    // ========================================================

    audio.addEventListener(
        "ended",
        () => {

            currentTrack =
                (
                    currentTrack + 1
                ) % tracks.length;


            savedTime = 0;

            restoring = true;


            audio.src =
                tracks[currentTrack];


            audio.load();


            saveState();


            if (
                musicEnabled
            ) {

                startMusic();

            }

        }
    );


    // ========================================================
    // ON / OFF
    // ========================================================

    function toggleMusic() {

        if (
            musicEnabled &&
            !audio.paused
        ) {

            musicEnabled = false;

            audio.pause();

            savePosition();

        }

        else {

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


    // ========================================================
    // VOLUME
    // ========================================================

    volumeSlider.addEventListener(
        "input",
        event => {

            event.stopPropagation();


            audio.volume =
                Number(
                    volumeSlider.value
                ) / 100;


            if (
                audio.volume <= 0
            ) {

                musicEnabled = false;

                audio.pause();

                savePosition();

            }

            else {

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


    // ========================================================
    // IOS / SAFARI
    // ========================================================

    function unlockAudio() {

        if (
            !musicEnabled
        ) {

            return;

        }


        if (
            !audio.paused
        ) {

            return;

        }


        startMusic();

    }


    document.addEventListener(
        "pointerdown",
        unlockAudio,
        {
            passive: true
        }
    );


    document.addEventListener(
        "touchstart",
        unlockAudio,
        {
            passive: true
        }
    );


    document.addEventListener(
        "click",
        unlockAudio,
        {
            passive: true
        }
    );


    // ========================================================
    // SALVATAGGIO PRIMA DI CAMBIARE PAGINA
    // ========================================================

    document.addEventListener(
        "click",
        event => {

            const link =
                event.target.closest(
                    "a"
                );


            if (!link) {

                return;

            }


            /*
             * Se il link apre la stessa pagina
             * con un altro URL o porta a una
             * pagina del torneo, salviamo subito.
             */

            if (
                link.href &&
                link.target !== "_blank"
            ) {

                savePosition();

                saveState();

            }

        },
        true
    );


    // ========================================================
    // BEFORE UNLOAD
    // ========================================================

    window.addEventListener(
        "beforeunload",
        () => {

            savePosition();

            saveState();

        }
    );


    // ========================================================
    // PAGE HIDE
    // ========================================================

    window.addEventListener(
        "pagehide",
        () => {

            savePosition();

            saveState();

        }
    );


    // ========================================================
    // VISIBILITY
    // ========================================================

    document.addEventListener(
        "visibilitychange",
        () => {

            if (
                document.visibilityState ===
                "hidden"
            ) {

                savePosition();

                saveState();

            }

        }
    );


    // ========================================================
    // SALVATAGGIO PERIODICO
    // ========================================================

    setInterval(
        () => {

            if (
                !audio.paused
            ) {

                savePosition();

            }

        },
        500
    );


    // ========================================================
    // API
    // ========================================================

    window.SantaCruzMusic = {

        play() {

            musicEnabled = true;

            startMusic();

            updateMusicButton();

        },


        pause() {

            savePosition();

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
                    Math.min(
                        1,
                        Number(value)
                    )
                );


            volumeSlider.value =
                Math.round(
                    audio.volume * 100
                );


            if (
                audio.volume <= 0
            ) {

                musicEnabled = false;

                audio.pause();

            }

            else {

                musicEnabled = true;

                startMusic();

            }


            updateMusicButton();

            saveState();

        },


        getVolume() {

            return audio.volume;

        },


        getCurrentTrack() {

            return currentTrack;

        },


        getCurrentTime() {

            return audio.currentTime;

        }

    };


    // ========================================================
    // AVVIO
    // ========================================================

    updateMusicButton();


    /*
     * NON forziamo il play se il browser
     * ha bisogno di un'interazione.
     *
     * Se il browser consente autoplay,
     * partirà.
     *
     * Altrimenti partirà al primo tocco.
     */

    if (
        musicEnabled &&
        wasPlaying
    ) {

        startMusic();

    }

})();
