document.addEventListener("DOMContentLoaded", function () {

const ACCESSKEY = localStorage.getItem("access");

let tablebody = document.getElementById("table-body");
let selectedTask = null;

if (!ACCESSKEY || ACCESSKEY === undefined) {
    window.location.href = "/index.html";
}


// Alle Checkboxen auswählen
document.getElementById("select-all").addEventListener("change", function() {
    let checkboxes = document.querySelectorAll(".row-checkbox");
    checkboxes.forEach(checkbox => {
        checkbox.checked = this.checked;
    });
});


// Abbrechen-Funktion
document.getElementById("cancel-edit-btn").addEventListener("click", close_popup);


// Update bestehender Aufgaben speichern
document.getElementById("save-edit-btn").addEventListener("click", function () {
    if (!selectedTask) return;

    const updatedDescription = document.getElementById("edit-description").value;
    const updatedDueOn = document.getElementById("edit-dueOn").value;

    const updatedTask = {
        id: selectedTask.id,
        description: updatedDescription,
        dueOn: updatedDueOn,
        state: selectedTask.state
    };

    fetch(`http://127.0.0.1:8000/api/task/${selectedTask.id}/`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify(updatedTask)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                console.error("Server-Antwort:", err);
                throw new Error("Fehler beim Speichern!");
            });
        }
        return response.json();
    })
    .then((updatedData) => {
        const rowToUpdate = [...document.querySelectorAll("tr")].find(row => {
            const checkbox = row.querySelector(".row-checkbox");
            return checkbox && parseInt(checkbox.value) === selectedTask.id;
        });

        if (rowToUpdate) {
            rowToUpdate.children[1].innerText = updatedData.description;
            rowToUpdate.children[2].innerText = updatedData.state === "done" ? "erledigt" : "offen";

            if (updatedData.dueOn) {
                const date = new Date(updatedData.dueOn);
                const formattedDate = date.toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour:"2-digit",
                    minute: "2-digit"
                });
                rowToUpdate.children[3].innerText = formattedDate;
            } else {
                rowToUpdate.children[3].innerText = "nicht ausgewählt";
            }
        }

        close_popup();
    })
    .catch(error => {
        console.error("Fehler beim Speichern!", error);
        alert("Es ist ein Fehler aufgetreten");
    });
});


// Speichern neuer Aufgaben
document.getElementById("save-new-btn").addEventListener("click", function () {
    const description = document.getElementById("new-description").value;
    const dueOn = document.getElementById("new-dueOn").value;

    if (!description) {
        alert("Beschreibung darf nicht leer sein!");
        return;
    }

    const newTask = {
        description: description,
        dueOn: dueOn,
        state: "open"
    };

    fetch("http://127.0.0.1:8000/api/task/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("access")}`,
        },
        body: JSON.stringify(newTask)
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => {
                console.error("Server-Antwort:", err);
                throw new Error("Fehler beim Speichern!");
            });
        }
        return response.json();
    })
    .then(data => {
        document.getElementById("add-popup").classList.add("hidden");
        addTaskToTable(data);
    })
    .catch(error => {
        console.error("Fehler beim Speichern!", error);
        alert("Aufgabe konnte nicht gespeichert werden!");
    });
});


// Aufgaben bearbeiten
function edit_task(task) {
    selectedTask = task

    console.log("Popup:", document.getElementById("edit-popup"));
    console.log("Input Beschreibung:", document.getElementById("edit-description"));
    console.log("Input Fällig am:", document.getElementById("edit-dueOn"));

    // fülle das Formular vorab
    document.getElementById("edit-description").value = task.description;
    document.getElementById("edit-dueOn").value = task.dueOn ? task.dueOn.slice(0, 16) : "";

    // Pop-up anzeigen
    document.getElementById("edit-popup").classList.remove("hidden");
}

// Pop-up schließen
    function close_popup() {
        document.getElementById("edit-popup").classList.add("hidden");
        selectedTask = null;
    }


// Neue Aufgabe erstellen - Popup öffnen
document.getElementById("add-task-btn").addEventListener("click", function () {
    document.getElementById("new-description").value = "";
    document.getElementById("new-dueOn").value = "";
    document.getElementById("add-popup").classList.remove("hidden");
});

// Abbrechen-Button im Add-Formular
document.getElementById("cancel-new-btn").addEventListener("click", function () {
    document.getElementById("add-popup").classList.add("hidden");
});


// Ausgelagerte Funktion zum Hinzufügen neuer Tabellen-Zeilen
function addTaskToTable(task) {
    let tableRow = document.createElement("tr");

    let tableDataCheckbox = document.createElement("td");
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.classList.add("row-checkbox");
    checkbox.value = task.id;
    tableDataCheckbox.appendChild(checkbox);

    let tableDataDescription = document.createElement("td");
    let tableDataState = document.createElement("td");
    let tableDataDueOn = document.createElement("td");
    let tableDataAktion = document.createElement("td");
    let editButton = document.createElement("button");
    let editIcon = document.createElement("img");
    let deleteButton = document.createElement("button");
    let deleteIcon = document.createElement("img");

    tableDataDescription.innerHTML = `${task.description}`;
    tableDataState.classList.add("status-cell");

    if (task.state === "done") {
        tableRow.classList.add("done");
        checkbox.checked = true;
        tableDataState.innerText = "erledigt";
    } else {
        tableDataState.innerText = "offen";
    }

    if (task.dueOn) {
        const date = new Date(task.dueOn);
        const formattedDate = date.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
        tableDataDueOn.innerText = formattedDate;
    } else {
        tableDataDueOn.innerText = "nicht ausgewählt";
    }

    editButton.classList.add("edit-btn");
    editIcon.src = "../assets/images/edit.png";
    editIcon.alt = "Bearbeiten";
    editIcon.classList.add("edit-icon");

    deleteButton.classList.add("delete-btn");
    deleteIcon.src = "../assets/images/delete.png";
    deleteIcon.alt = "Löschen";
    deleteIcon.classList.add("delete-icon");


    editIcon.addEventListener("click", () => {
        edit_task(task);
    });

    deleteIcon.addEventListener("click", () => {
        delete_task(task.id, tableRow);
    });

    tableRow.appendChild(tableDataCheckbox);
    tableRow.appendChild(tableDataDescription);
    tableRow.appendChild(tableDataState);
    tableRow.appendChild(tableDataDueOn);
    editButton.appendChild(editIcon);
    deleteButton.appendChild(deleteIcon);
    tableDataAktion.appendChild(editButton);
    tableDataAktion.appendChild(deleteButton);
    tableRow.appendChild(tableDataAktion);

    if (task.state === "done") {
        tablebody.appendChild(tableRow);
    } else {
        tablebody.insertBefore(tableRow, tablebody.firstChild);
    }

    checkbox.addEventListener("change", function () {
        const row = this.closest("tr");
        const statusCell = row. querySelector(".status-cell");
        const taskId = parseInt(this.value);
        const newState = this.checked ? "done" : "open";

        if (this.checked) {
            row.classList.add("done");
            tablebody.appendChild(row);
            statusCell.innerText = "erledigt";
        } else {
            row.classList.remove("done");
            statusCell.innerText = "offen";
            tablebody.insertBefore(row, tablebody.firstChild);
        }

        const description = row.children[1].innerText;
        const dueOnText = row.children[3].innerText;
        let dueOn = null;

        if (dueOnText !== "nicht ausgewählt") {
            const [datePart, timePart] = dueOnText.split(", ");
            const [day, month, year] = datePart.split(".");
            dueOn = `${year}-${month}-${day}T${timePart}`;
        }

        const updatedTask = {
            id: taskId,
            description: description,
            dueOn: dueOn,
            state: newState
        };

        fetch(`http://127.0.0.1:8000/api/task/${taskId}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("access")}`,
            },
            body: JSON.stringify(updatedTask)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Fehler beim Aktualisieren des Status!");
            }
            return response.json();
        })
        .then(data => {
            console.log("Status aktualisiert:", data);
        })
        .catch(error => {
            console.error("Fehler:", error);
            alert("Status konnte nicht gespeichert werden!");
        });
    });
};


// Daten abrufen & Tabelle aufbauen
fetch("http://127.0.0.1:8000/api/task/", {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("access")}`
    }
})
.then((response) => response.json())
.then((data) => {
    // Sortierung nach offenen und erledigten Aufgaben
    const openTasks = data.filter(task => task.state !== "done");
    const doneTasks = data.filter(task => task.state === "done");
    const sortedTasks = [...openTasks, ...doneTasks];
    sortedTasks.forEach(addTaskToTable);
});


// Lösch-Funktion
function delete_task(taskId, tableRow) {
    if (!confirm("Willst du diese Aufgabe wirklich löschen?")) return;

        fetch(`http://127.0.0.1:8000/api/task/${taskId}/`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem("access")}`,
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error("Löschen fehlgeschlagen!");
            }

            tableRow.remove();
        })
        .catch((error) => {
            console.error("Fehler beim Löschen:", error);
            alert("Aufgabe konnte nicht gelöscht werden!");
    });
}
});