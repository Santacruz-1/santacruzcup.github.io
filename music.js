// ============================================
// AVVIO MUSICA - COMPATIBILE iOS / SAFARI
// ============================================

let userInteracted = false;

function startMusic() {

    if (!musicEnabled || audio.volume === 0) {
        return Promise.resolve();
    }

    const promise = audio.play();

    if (promise !== undefined) {

        return promise
            .then(() => {

                updateMusicButton();
                saveState();

            })
            .catch(error => {

                console.log(
                    "Autoplay bloccato dal browser:",
                    error
                );

                updateMusicButton();
            });
    }

    return Promise.resolve();
}


// ============================================
// PRIMA INTERAZIONE UTENTE
// ============================================

function handleFirstInteraction() {

    userInteracted = true;

    if (!musicEnabled) {
        return;
    }

    if (!audio.paused) {
        return;
    }

    // IMPORTANTE:
    // play() viene chiamato direttamente
    // durante il gesto dell'utente.
    startMusic();
}


// iOS Safari richiede un gesto reale dell'utente.
// Non usare { once: true }, così abbiamo più possibilità
// di far partire l'audio.
document.addEventListener(
    "touchstart",
    handleFirstInteraction,
    {
        passive: true
    }
);

document.addEventListener(
    "pointerdown",
    handleFirstInteraction,
    {
        passive: true
    }
);

document.addEventListener(
    "click",
    handleFirstInteraction,
    {
        passive: true
    }
);


// ============================================
// CARICAMENTO PAGINA
// ============================================

window.addEventListener(
    "load",
    () => {

        updateMusicButton();

        // Su desktop può funzionare.
        // Su iOS verrà normalmente bloccato,
        // e partiremo al primo gesto dell'utente.

        if (
            musicEnabled &&
            !/iPad|iPhone|iPod/.test(navigator.userAgent)
        ) {

            startMusic();
        }
    }
);
