let playerUsername = localStorage.getItem(LS_KEYS.username);
let diskCount = Number(localStorage.getItem(LS_KEYS.diskCount));
let playerCategory = localStorage.getItem(LS_KEYS.ringCategory);

if (!playerUsername || !diskCount) {
    window.location.href = "index.html";
}

let tower1 = document.getElementById("tower1");
let disksContainer = tower1.querySelector(".disks");
let towers = [[], [], []];
let selectedTower = null;
let heldDisk = null;
let moveCount = 0;
let moveHistory = [];

let timerInterval = null;
let timerRunning = false;
let timerStart = 0;
let elapsedTime = 0;

const MAX_DISK_WIDTH_RATIO = 0.88;
const MIN_DISK_WIDTH_RATIO = 0.14;
const STACK_HEIGHT_RATIO = 0.7;
const MAX_DISK_HEIGHT = 25;
const MIN_DISK_HEIGHT = 15;

function initGame() {
    let firstTower = [];
    for (let i = diskCount; i >= 1; i--) {
        firstTower.push(i);
    }

    towers = [firstTower, [], []];
    selectedTower = null;
    heldDisk = null;
    moveCount = 0;
    moveHistory = [];
    resetTimer();

    minimumCounter(diskCount);
    render();
}

let undoBtn = document.getElementById("undo");
undoBtn.addEventListener("click", undoMove);

document.getElementById("restart").addEventListener("click", function () {
    initGame();
});

function render() {
    let count = Math.max(diskCount, 5);

    let towerWidth = tower1.clientWidth;
    let maxDiskWidth = towerWidth * MAX_DISK_WIDTH_RATIO;
    let minDiskWidth = towerWidth * MIN_DISK_WIDTH_RATIO;

    let totalStackHeight = tower1.clientHeight * STACK_HEIGHT_RATIO;
    let segment = totalStackHeight / count;
    let diskMargin = Math.max(1, segment * 0.15);

    for (let A = 0; A < 3; A++) {
        document.getElementById(`heldDiskArea${A + 1}`).innerHTML = "";
    }

    for (let t = 0; t < 3; t++) {
        let towerEl = document.getElementById(`tower${t + 1}`);
        let container = towerEl.querySelector(".disks");
        let heldDiskContainer = document.getElementById(`heldDiskArea${t + 1}`);
        container.innerHTML = "";

        for (let size of towers[t]) {
            let disk = document.createElement("div");
            disk.classList.add("disk");
            disk.style.width = Math.max(minDiskWidth, (size / (count - count * 0.05)) * maxDiskWidth) + "px";
            disk.style.height = Math.min(MAX_DISK_HEIGHT, Math.max(MIN_DISK_HEIGHT, segment - diskMargin)) + "px";
            disk.style.marginBottom = diskMargin + "px";
            disk.style.background = getDiskColor(size, diskCount);

            if (size === heldDisk && t === selectedTower) {
                disk.classList.add("selected");
                heldDiskContainer.appendChild(disk);
            } else {
                container.appendChild(disk);
            }
        }
    }

    let moveCountEl = document.getElementById("moveCount");
    if (moveCountEl) {
        moveCountEl.textContent = moveCount;
    }
}

function getDiskColor(size, totalDisks) {
    let hue = 40 + ((size - 1) / Math.max(1, totalDisks - 1)) * 230;
    return `hsl(${hue}, 85%, 55%)`;
}

function startTimer() {
    if (timerRunning) return;
    timerRunning = true;
    timerStart = Date.now() - elapsedTime;
    timerInterval = setInterval(updateTimerDisplay, 10);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning = false;
}

function resetTimer() {
    stopTimer();
    elapsedTime = 0;
    updateTimerDisplay();
}

function updateTimerDisplay() {
    if (timerRunning) {
        elapsedTime = Date.now() - timerStart;
    }

    let hours = Math.floor(elapsedTime / 3600000);
    let minutes = Math.floor((elapsedTime % 3600000) / 60000);
    let seconds = Math.floor((elapsedTime % 60000) / 1000);
    let centiseconds = Math.floor((elapsedTime % 1000) / 10);

    let timerEl = document.getElementById("timer");
    if (!timerEl) return;

    timerEl.textContent =
        String(hours).padStart(2, "0") + ":" +
        String(minutes).padStart(2, "0") + ":" +
        String(seconds).padStart(2, "0") + ":" +
        String(centiseconds).padStart(2, "0");
}

function updateDateTime() {
    let dateTimeEl = document.getElementById("dateTime");
    if (!dateTimeEl) return;

    let now = new Date();

    let datePart = now.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
    let timePart = now.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    });

    dateTimeEl.textContent = datePart + " " + timePart;
}

function minimumCounter(diskval) {
    let minimumCountEL = document.getElementById("minimumCount");
    minimumCountEL.textContent = minimumMoves(diskval);
}

function handleTowerClick(index) {
    if (selectedTower === null) {
        if (towers[index].length === 0) return;
        selectedTower = index;
        heldDisk = towers[index][towers[index].length - 1];
        startTimer();
        render();
        updateInstructionBar();
        return;
    }
    if (selectedTower === index) {
        selectedTower = null;
        heldDisk = null;
        render();
        updateInstructionBar();
        return;
    }

    let moved = moveDisk(selectedTower, index);

    if (!moved) {
        triggerInvalidMoveShake(selectedTower);
        return;
    }

    selectedTower = null;
    heldDisk = null;
    render();
    updateInstructionBar();
    checkWin();
}

function moveDisk(from, to) {
    let movingDisk = towers[from][towers[from].length - 1];
    let destinationTop = towers[to][towers[to].length - 1];

    if (towers[to].length === 0 || movingDisk < destinationTop) {
        towers[from].pop();
        towers[to].push(movingDisk);
        moveCount++;
        moveHistory.push({ from, to });
        return true;
    }
    return false; 
}

function undoMove() {
    if (moveHistory.length === 0) return;

    let lastMove = moveHistory.pop();
    let disk = towers[lastMove.to].pop();
    towers[lastMove.from].push(disk);
    moveCount--;

    selectedTower = null;
    heldDisk = null;
    render();
}

function triggerInvalidMoveShake(fromIndex) {
    let heldContainer = document.getElementById(`heldDiskArea${fromIndex + 1}`);
    let heldEl = heldContainer.querySelector(".disk");
    if (!heldEl) return;

    heldEl.classList.remove("shake");
    void heldEl.offsetWidth; 
    heldEl.classList.add("shake");

    heldEl.addEventListener("animationend", function handler() {
        heldEl.classList.remove("shake");
        heldEl.removeEventListener("animationend", handler);
    });
}

function updateInstructionBar() {
    let bar = document.getElementById("instructionBar");
    if (!bar) return;
    bar.textContent = heldDisk !== null
        ? "click the tower to drop disk"
        : "click a tower to grab the disk";
}

function checkWin() {
    if (towers[2].length === diskCount) {
        stopTimer();

        let finalTime = elapsedTime;
        let finalMoves = moveCount;

        launchConfetti();
        document.getElementById("game").classList.add("blurred");

        let rankPromise = (playerUsername.length >= 3)
            ? submitScoreAndGetRank(playerUsername, diskCount, finalTime, finalMoves)
            : Promise.resolve(null);

        setTimeout(function () {
            showWinOverlay(finalTime, finalMoves, null);
            rankPromise.then(function (rank) {
                updateWinRank(rank);
            });
        }, 1200);
        
    }
}

function showWinOverlay(finalTime, finalMoves, rank) {
    let overlay = document.getElementById("winOverlay");

    document.getElementById("winTime").textContent = formatTime(finalTime);
    document.getElementById("winMoves").textContent = finalMoves;
    updateWinRank(rank);

    overlay.classList.add("show");
}

function updateWinRank(rank) {
    document.getElementById("winRank").textContent = (rank === null || rank === undefined) ? "--" : rank;
}

document.getElementById("playAgainBtn").addEventListener("click", function () {
    document.getElementById("winOverlay").classList.remove("show");
    document.getElementById("game").classList.remove("blurred");
    initGame();
});

document.getElementById("mainMenuBtn").addEventListener("click", function () {
    window.location.href = "index.html";
});

function launchConfetti() {
    if (typeof confetti !== "function") return;
    confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
    setTimeout(function () {
        confetti({ particleCount: 80, angle: 60, spread: 70, origin: { x: 0 } });
        confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1 } });
    }, 300);
}

async function submitScore(username, diskCount, timeTaken, moveCount) {
    try {
        const response = await fetch(`${BACKEND_URL}/api/scores`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, diskCount, timeTaken, moveCount })
        });

        if (!response.ok) {
            const errData = await response.json();
            console.log("Score not saved:", errData.error);
            return false; 
        }

        const data = await response.json();
        console.log("Score saved:", data);
        return true; 
    } catch (err) {
        console.log("Network error saving score:", err);
        return false;
    }
}

async function submitScoreAndGetRank(username, diskCount, timeTaken, moveCount) {
    let saved = await submitScore(username, diskCount, timeTaken, moveCount);
    if (!saved) return null;
    return await fetchRank(username, timeTaken, moveCount);
}

async function fetchRank(username, timeTaken, moveCount) {
    try {
        let category = ringCategory(diskCount).toLowerCase();
        const response = await fetch(`${BACKEND_URL}/api/scores?category=${category}`);
        if (!response.ok) return null;

        const scores = await response.json();
        let idx = scores.findIndex(s =>
            s.username === username && s.timeTaken === timeTaken && s.moveCount === moveCount
        );
        return idx === -1 ? null : idx + 1;
    } catch (err) {
        console.log("Rank fetch error:", err);
        return null;
    }
}

for (let i = 0; i < 3; i++) {
    document.getElementById(`tower${i + 1}`).addEventListener("click", function () {
        handleTowerClick(i);
    });
}

document.addEventListener("keydown",(event) => {
    switch (event.key) {
        case "1":
            handleTowerClick(0)
            break
        case "2":
            handleTowerClick(1)
            break
        case "3":
            handleTowerClick(2)
            break
        case "a":
            handleTowerClick(0)
            break
        case "s":
            handleTowerClick(1)
            break
        case "d":
            handleTowerClick(2)
            break
        case "A":
            handleTowerClick(0)
            break
        case "S":
            handleTowerClick(1)
            break
        case "D":
            handleTowerClick(2)
            break
    }
});

let resizeTimer;
window.addEventListener("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(render, 150);
});

updateDateTime();
setInterval(updateDateTime, 1000);

initGame();