let usernameInput = document.getElementById("username");
let usernameGuidelines = document.getElementById("usernameGuidelines");
let usernameStatus = document.getElementById("usernameStatus");
let startBtn = document.getElementById("startGame");
let slider = document.getElementById("diskCount");
let value = document.getElementById("diskValue");
let ringCategoryEl = document.getElementById("ringCategory");

usernameInput.addEventListener("input", function () {
    let clean = sanitizeUsername(this.value);
    if (this.value !== clean) {
        let cursor = this.selectionStart;
        this.value = clean;
        this.setSelectionRange(cursor, cursor);
    }
    validateUsername();
});

function validateUsername() {
    let val = usernameInput.value.trim();
    let valid = val.length >= USERNAME_MIN_LENGTH && val.length <= USERNAME_MAX_LENGTH;

    if (val.length === 0) {
        usernameInput.classList.remove("invalid");
        usernameGuidelines.classList.remove("error");
        usernameStatus.textContent = "Choose a username to get started.";
    } else if (!valid) {
        usernameInput.classList.add("invalid");
        usernameGuidelines.classList.add("error");
        usernameStatus.textContent = "Username must be 3–20 characters.";
    } else {
        usernameInput.classList.remove("invalid");
        usernameGuidelines.classList.remove("error");
        usernameStatus.textContent = "Looks good!";
    }

    startBtn.disabled = !valid;
    return valid;
}

document.getElementById("enterUsername").addEventListener("click", function () {
    validateUsername();
    usernameInput.focus();
});

slider.addEventListener("input", function () {
    value.textContent = slider.value;
    ringCategoryEl.textContent = ringCategory(Number(slider.value));
});

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

startBtn.addEventListener("click", function () {
    if (!validateUsername()) return;

    let diskCount = Number(slider.value);
    let category = ringCategory(diskCount);

    localStorage.setItem(LS_KEYS.username, usernameInput.value.trim());
    localStorage.setItem(LS_KEYS.diskCount, diskCount);
    localStorage.setItem(LS_KEYS.ringCategory, category);

    window.location.href = "game.html";
});

value.textContent = slider.value;
ringCategoryEl.textContent = ringCategory(Number(slider.value));
validateUsername();
fetchLeaderboard("novice");
