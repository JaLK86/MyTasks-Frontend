function logIn() {
    const USERNAME = document.getElementById("username").value;
    const PASSWORD = document.getElementById("password").value;

    fetch("http://127.0.0.1:8000/api/token/", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ username: USERNAME, password:PASSWORD }),
    })
    .then((response) => response.json())
    .then((data) => {
        if (data.access) {
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);
            window.location.href = './dashboard/dashboard.html';
        }else{
            console.log("Login fehlgeschlagen!")
        }
    });
    return false;
}

// Automatischer LogOut
let logoutCountdown;
let countdownValue = 600;

function startLogoutCountdown() {
    logoutCountdown = setInterval(() => {
        countdownValue--;
        const timerElement = document.getElementById("logout-timer");
        if (timerElement) {
            timerElement.textContent = formatTime(countdownValue);
        }

        if (countdownValue <= 0) {
            clearInterval(logoutCountdown);
            performLogout();
        }
    }, 1000);
}

function resetLogoutTimer() {
    clearInterval(logoutCountdown);
    countdownValue = 600;

    const timerElement = document.getElementById("logout-timer");
    if (timerElement) {
        timerElement.textContent = formatTime(countdownValue);
        timerElement.style.display = "none";
    }
}

function performLogout() {
    resetLogoutTimer();
    localStorage.removeItem("access");
    localStorage.removeItem("logoutTime");
    window.location.href = "../index.html";
}

function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `Logout in ${m}:${s}`;
}

function registry() {
    window.location.href = './registry.html';
}

function show_lists() {
    window.location.href = "../toDo/tasklist.html";
};

function to_db() {
    window.location.href = './dashboard/dashboard.html';
}

document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logout-btn");
    const logoutTimer = document.getElementById("logout-timer");
    const logoutWrapper = document.getElementById("logout-wrapper");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            performLogout();
        });
    }

    if (logoutWrapper && logoutTimer) {
        logoutWrapper.addEventListener("mouseover", () => {
            logoutTimer.style.display ="inline";
        });

        logoutWrapper.addEventListener("mouseout", () => {
            logoutTimer.style.display = "none";
        });
    }

    startLogoutCountdown();
});