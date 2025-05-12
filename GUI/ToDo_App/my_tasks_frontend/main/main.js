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
let logoutTime = parseInt(localStorage.getItem("logoutTime")) || 60 * 60;

const logoutTimerDisplay = document.getElementById("logout-timer");

if (logoutTimerDisplay) {
    // Countdown starten
    const timerIntervall = setInterval(() => {
        const minutes = Math.floor(logoutTime / 60);
        const seconds = logoutTime % 60;

        logoutTimerDisplay.textContent = `Noch ${minutes}:${seconds.toString().padStart(2, "0")} Minuten`;

        logoutTime--;
        localStorage.setItem("logoutTime", logoutTime);

        if (logoutTime <0) {
            clearInterval(timerIntervall);
            localStorage.removeItem("ACCESSKEY");
            localStorage.removeItem("logoutTime");
            window.location.href = "/index.html";
        }
    }, 1000);
}
    
// Manuelles Logout
function logOut() {
    localStorage.removeItem("ACCESSKEY");
    localStorage.removeItem("logoutTime");
    window.location.href = '../index.html';
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