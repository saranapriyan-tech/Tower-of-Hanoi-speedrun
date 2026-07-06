let tower1 = document.getElementById("tower1");
let disksContainer = tower1.querySelector(".disks");
let add = document.getElementById("add");
let diskCount = 0;
let towers = [[], [], []];
let slider = document.getElementById("diskCount");
let value = document.getElementById("diskValue");
let selectedTower = null;
let heldDisk = null;
let moveCount = 0;
let moveHistory = []

let timerInterval = null;
let timerRunning = false;
let timerStart = 0;
let elapsedTime = 0;

const MAX_DISK_WIDTH = 250; 
const MIN_DISK_WIDTH = 35;  
const TOTAL_STACK_HEIGHT = 250; 
const MAX_DISK_HEIGHT = 25 ;
const MIN_DISK_HEIGHT = 15; 


slider.addEventListener("input", function () {
    value.textContent = slider.value;
    minimumCounter(slider.value);
    diskCount = Number(document.getElementById("diskCount").value);

    towers = [[], [], []];
    selectedTower = null;
    heldDisk = null;
    moveCount = 0;
    moveHistory = [];
    resetTimer();

    minimumCounter(diskCount);
    ringCategory(diskCount);
    render();
});

add.addEventListener('click', function () {
    diskCount = Number(document.getElementById("diskCount").value);

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
    ringCategory(diskCount);
    render();
});

let undoBtn = document.getElementById("undo");
undoBtn.addEventListener("click",undoMove);

let usernameInput = document.getElementById("username");
const USERNAME_ALLOWED = /[^A-Za-z0-9 _-]/g;
const USERNAME_MAX_LENGTH = 20;

function sanitizeUsername(raw) {
    return raw.replace(USERNAME_ALLOWED, "").slice(0, USERNAME_MAX_LENGTH);
}

usernameInput.addEventListener("input", function () {
    let clean = sanitizeUsername(this.value);
    if (this.value !== clean) {
        let cursor = this.selectionStart;
        this.value = clean;
        this.setSelectionRange(cursor, cursor);
    }
});



function render() {
    let count = Math.max(diskCount, 5);

    let segment = TOTAL_STACK_HEIGHT / count;
    let diskMargin = Math.max(1, segment * 0.15);

    for (let A = 0; A <3; A++) {
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
            disk.style.width = Math.max(MIN_DISK_WIDTH,(size / (count - count*0.05)) * MAX_DISK_WIDTH) + "px";
            disk.style.height = Math.min(MAX_DISK_HEIGHT, Math.max(MIN_DISK_HEIGHT, segment - diskMargin)) + "px";
            disk.style.marginBottom = diskMargin + "px";
            

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
    let minimumCount = (2 ** diskval) -1;
    minimumCountEL.textContent = minimumCount;
}   

function ringCategory(diskval) {
    let ringCategoryEl = document.getElementById("ringCategory");
    if (!ringCategoryEl) return;

    let category;
    if (diskval <= 4) category = "Novice";
    else if (diskval <= 6) category = "Apprentice";
    else if (diskval <= 8) category = "Skilled";
    else if (diskval <= 10) category = "Expert";
    else category = "Master";

    ringCategoryEl.textContent = category;
}

function handleTowerClick(index) {
    if (selectedTower === null) {
        if (towers[index].length === 0) return;
        selectedTower = index;
        heldDisk = towers[index][towers[index].length - 1];
        startTimer(); 
        render();
        return;
    }
    if (selectedTower === index) {
        selectedTower = null;
        heldDisk = null;
        render();
        return;
    }
    moveDisk(selectedTower, index);
    selectedTower = null;
    heldDisk = null;
    render();
   
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
    }
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

function checkWin() {
    if (towers[2].length === diskCount) {
        stopTimer();

        let username = usernameInput.value.trim();
        let finalTime = elapsedTime;
        let finalMoves = moveCount;

        showWinOverlay(finalTime, finalMoves);

        if (username.length >= 3) {
            submitScore(username, diskCount, finalTime, finalMoves);
        } else {
            console.log("No valid username entered, score not submitted.");
        }
    }
}

function showWinOverlay(finalTime, finalMoves) {
    let overlay = document.getElementById("winOverlay");
    let statsEl = document.getElementById("winStats");

    statsEl.textContent = `Time: ${formatTime(finalTime)}  |  Moves: ${finalMoves}`;
    overlay.classList.add("show");
}

document.getElementById("closeWin").addEventListener("click", function () {
    document.getElementById("winOverlay").classList.remove("show");
});

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
            return;
        }

        const data = await response.json();
        console.log("Score saved:", data);

        fetchLeaderboard(getActiveCategory());
    } catch (err) {
        console.log("Network error saving score:", err);
    }
}

const BACKEND_URL = "https://tower-of-hanoi-ss9n.onrender.com";

async function fetchLeaderboard(category) {
    let tbody = document.getElementById("leaderboardBody");
    tbody.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;

    try {
        const response = await fetch(`${BACKEND_URL}/api/scores?category=${category}`);

        if (!response.ok) {
            tbody.innerHTML = `<tr><td colspan="5">Failed to load leaderboard</td></tr>`;
            return;
        }

        const scores = await response.json();
        renderLeaderboard(scores);
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="5">Network error</td></tr>`;
        console.log("Leaderboard fetch error:", err);
    }
}

function formatTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    let centiseconds = Math.floor((ms % 1000) / 10);
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}.${String(centiseconds).padStart(2, "0")}`;
}

function renderLeaderboard(scores) {
    let tbody = document.getElementById("leaderboardBody");
    tbody.innerHTML = "";

    if (scores.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No scores yet — be the first!</td></tr>`;
        return;
    }

    scores.forEach((score, index) => {
        let row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${score.username}</td>
            <td>${score.diskCount}</td>
            <td>${formatTime(score.timeTaken)}</td>
            <td>${score.moveCount}</td>
        `;
        tbody.appendChild(row);
    });
}

let catTabs = document.querySelectorAll(".catTab");
catTabs.forEach(tab => {
    tab.addEventListener("click", function () {
        catTabs.forEach(t => t.classList.remove("active"));
        this.classList.add("active");
        fetchLeaderboard(this.dataset.category);
    });
});

function getActiveCategory() {
    let activeTab = document.querySelector(".catTab.active");
    return activeTab ? activeTab.dataset.category : "novice";
}

for (let i = 0; i < 3; i++) {
    document.getElementById(`tower${i + 1}`).addEventListener("click", function () {
        handleTowerClick(i);
    });
}

updateDateTime(); 
setInterval(updateDateTime, 1000);
minimumCounter(Number(slider.value));
ringCategory(Number(slider.value));
fetchLeaderboard("novice");