document.addEventListener("DOMContentLoaded", () => {
    const ACCESSKEY = localStorage.getItem("access");

    if (!ACCESSKEY) {
        window.location.href = "../index.html";
        return;
    }

    // Prüfen, ob wir auf list.html sind
    if (document.getElementById("list-title")) {
        const params = new URLSearchParams(window.location.search);
        const listName = params.get("name");

        if (listName) {
            document.getElementById("list-title").innerText = listName;
        } else {
            document.getElementById("list-title").innerText = "Unbekannte Liste"
        }
    }

    const newListBtn = document.getElementById("new-list");
    const listPopup = document.getElementById("list-popup");
    const cancelListBtn = document.getElementById("cancel-list-btn");
    const saveListBtn = document.getElementById("save-list-btn");
    const toggleListsBtn = document.getElementById("toggle-lists-btn");
    const tasklistContainer = document.getElementById("tasklist-container");
    const arrowIcon = document.getElementById("arrow-icon");


    // Menü ein-/ausklappen
    toggleListsBtn.addEventListener("click", function(event) {
        event.stopPropagation();
        tasklistContainer.classList.toggle("hidden");
        arrowIcon.classList.toggle("rotated");
    });


    // Liste erstellen Popup öffnen
    newListBtn.addEventListener("click", () => {
        listPopup.classList.remove("hidden");
    });


    // Liste erstellen Popup schließen
    cancelListBtn.addEventListener("click", () => {
        listPopup.classList.add("hidden");
    });


    // Neue Liste speichern
    saveListBtn.addEventListener("click", () => {
        const listNameInput = document.getElementById("list-name");
        const listName = listNameInput.value.trim();

        if (!listName) {
            alert("Bitte gib einen Namen für die Liste ein!");
            return;
        }

        fetch("http://127.0.0.1:8000/api/tasklist/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access")}`,
            },
            body: JSON.stringify({listName: listName}),
        })
        .then(res => {
            if (!res.ok) {
                throw new Error("Fehler beim Erstellen der Liste!");
            }
            return res.json();
        })
        .then(data => {
            listPopup.classList.add("hidden");
            listNameInput.value = "";

            const container = document.getElementById("tasklist-container");
            const li = document.createElement("li");
            li.classList.add("sidebar-list-element-child");
            li.innerText = data.listName;
            container.appendChild(li);
        })
    })

    // Listen vom Server abrufen
    fetch("http://127.0.0.1:8000/api/tasklist/", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access")}`,
        }
    })
    .then(response => {
        if (!response.ok) {
            console.error("Fehler beim Laden der Listen!", response.status);
            return [];
        }
        return response.json();
    })
    .then(lists => {
        if (!Array.isArray(lists)) {
            console.error("Antwort ist keine Liste!", lists);
            return;
        }

        const container = document.getElementById("tasklist-container");
        container.innerHTML = "";

        lists.forEach(list => {
            const li = document.createElement("li");
            li.classList.add("sidebar-list-element-child");
            li.innerText = list.listName;
            li.addEventListener("click", () => {
                window.location.href = `tasklist.html?name=${encodeURIComponent(list.listName)}`;
            });

            container.appendChild(li);
        });
    })
    .catch(err => console.error("Fehler beim Abrufen der Liste!", err));
    }
)

function showLists() {
    window.location.href = './tasklist.html';
}