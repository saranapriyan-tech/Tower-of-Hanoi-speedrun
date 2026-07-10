const BACKEND_URL = "https://tower-of-hanoi-ss9n.onrender.com";

function ringCategory(diskval) {
    let category;
    if (diskval <= 4) category = "Novice";
    else if (diskval <= 6) category = "Apprentice";
    else if (diskval <= 8) category = "Skilled";
    else if (diskval <= 10) category = "Expert";
    else category = "Master";
    return category;
}

function minimumMoves(diskval) {
    return (2 ** diskval) - 1;
}

function formatTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    let centiseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

const USERNAME_ALLOWED = /[^A-Za-z0-9 _-]/g;
const USERNAME_MAX_LENGTH = 20;
const USERNAME_MIN_LENGTH = 3;

function sanitizeUsername(raw) {
    return raw.replace(USERNAME_ALLOWED, "").slice(0, USERNAME_MAX_LENGTH);
}

const LS_KEYS = {
    username: "hanoi_username",
    diskCount: "hanoi_diskCount",
    ringCategory: "hanoi_ringCategory"
};