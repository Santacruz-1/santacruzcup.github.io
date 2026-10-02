const tracks = [
    "audio/jefe-run.mp3",
    "audio/no mix no master.mp3"
];

let currentTrack = 0;

const audio = new Audio();
audio.volume = 0.12;
audio.preload = "auto";

function playNextTrack() {
    audio.src = tracks[currentTrack];

    audio.play().catch(() => {
        // Il browser può bloccare l'autoplay
    });
}

audio.addEventListener("ended", () => {
    currentTrack = (currentTrack + 1) % tracks.length;
    playNextTrack();
});

// Prova autoplay
window.addEventListener("load", () => {
    playNextTrack();
});

// Se l'autoplay viene bloccato,
// parte al primo click/tocco
document.addEventListener("click", () => {
    if (audio.paused) {
        audio.play().catch(() => {});
    }
}, { once: true });

document.addEventListener("touchstart", () => {
    if (audio.paused) {
        audio.play().catch(() => {});
    }
}, { once: true });
