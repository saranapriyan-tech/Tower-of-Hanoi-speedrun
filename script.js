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
        alert("🎉 You Win!");

        let username = usernameInput.value.trim();
        if (username.length >= 3) {
            submitScore(username, diskCount, elapsedTime, moveCount);
        } else {
            console.log("No valid username entered, score not submitted.");
        }
    }
}

async function submitScore(username, diskCount, timeTaken, moveCount) {
    try {
        const response = await fetch("http://localhost:5000/api/scores", {
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
    } catch (err) {
        console.log("Network error saving score:", err);
    }
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