document.addEventListener("DOMContentLoaded", function () {
    const ACCESSKEY = localStorage.getItem("access");
    if (!ACCESSKEY) {
        window.location.href = "../index.html";
    }

    const params = new URLSearchParams(window.location.search);
    const listId = params.get("list_id");
    const listName = params.get("name");

    const titleElem = document.getElementById("list-title");
    if (titleElem) titleElem.innerText = listName || "Unbekannte Liste";

    const tableBody = document.getElementById("table-body");
    let selectedTask = null;
    let selectedList = null;

    // Listen vom Server laden
    function loadTaskLists() {
        const tasklistContainer = document.getElementById("tasklist-container");

        fetch("http://127.0.0.1:8000/api/tasklist/", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ACCESSKEY}`,
            },
        })
            .then(res => res.json())
            .then(data => {
                tasklistContainer.innerHTML = "";

                data.forEach(list => {
                    const li = document.createElement("li");
                    li.classList.add("sidebar-list-element-child");
                    li.textContent = list.listName;
                    li.addEventListener("click", () => {
                        window.location.href = `tasklist.html?list_id=${list.id}&name=${encodeURIComponent(list.listName)}`;
                    });
                    tasklistContainer.appendChild(li);
                });
            })
            .catch(err => {
                console.error("Fehler beim Laden der Listen:", err);
            });
    }

    // Listen ausklappen
    const toggleListsBtn = document.getElementById("toggle-lists-btn");
    const tasklistContainer = document.getElementById("tasklist-container");
    const arrowIcon = document.getElementById("arrow-icon");

    toggleListsBtn?.addEventListener("click", () => {
        tasklistContainer.classList.toggle("hidden");
        arrowIcon.classList.toggle("rotated");

        if (!tasklistContainer.classList.contains("hidden")) {
            loadTaskLists();
        }
    });

    // "Neue Liste" - Popup öffnen
    document.getElementById("new-list")?.addEventListener("click", () => {
        document.getElementById("list-name").value = "";
        document.getElementById("list-popup").classList.remove("hidden");
    });

    // Liste bearbeiten - Popup öffnen
    document.getElementById("edit-list-btn")?.addEventListener("click", () => {
        const currentListName = document.getElementById("list-title")?.textContent || "unbekannte Liste";
        document.getElementById("updated-list-name").value = currentListName
        document.getElementById("edit-list-popup").classList.remove("hidden");
    })

    // Abbrechen-Funktionen
    document.getElementById("cancel-edit-btn")?.addEventListener("click", close_popup);
    document.getElementById("cancel-new-btn")?.addEventListener("click", () => {
        document.getElementById("add-popup").classList.add("hidden");
    });
    document.getElementById("cancel-new-list-btn")?.addEventListener("click", () => {
        document.getElementById("list-popup").classList.add("hidden");
    });
    document.getElementById("cancel-list-btn")?.addEventListener("click", () => {
        document.getElementById("edit-list-popup").classList.add("hidden");
    });

    // "Neue Aufgabe"- Popup öffnen
    document.getElementById("add-task-btn")?.addEventListener("click", () => {
        document.getElementById("new-description").value = "";
        document.getElementById("new-dueOn").value = "";
        document.getElementById("add-popup").classList.remove("hidden");
    });

    // Neue Liste speichern
    document.getElementById("save-list-btn")?.addEventListener("click", () => {
        const newListName = document.getElementById("list-name").value;

        if (!newListName) {
            alert("Name der Liste darf nicht leer sein!");
            return;
        }

        const newList = { listName: newListName };

        fetch("http://127.0.0.1:8000/api/tasklist/", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ACCESSKEY}`,
            },
            body: JSON.stringify(newList),
        })
            .then(res => res.json())
            .then(list => {
                document.getElementById("list-popup").classList.add("hidden");
                const li = document.createElement("li");
                li.classList.add("sidebar-list-element-child");
                li.textContent = list.listName;
                li.addEventListener("click", () => {
                    window.location.href = `tasklist.html?list_id=${list.id}&name=${encodeURIComponent(list.listName)}`;
                });
                tasklistContainer.appendChild(li);
            })
            .catch(err => {
                console.error("Fehler beim Speichern der Liste:", err);
                alert("Liste konnte nicht gespeichert werden!");
            });
    });

    // Bestehende Liste bearbeiten
        document.getElementById("save-edit-list-btn")?.addEventListener("click", () => {
        const updatedListName = document.getElementById("updated-list-name").value;
        

        if (!updatedListName) {
            alert("Name der Liste darf nicht leer sein!");
            return;
        }

        const updatedList = { listName: updatedListName };

        const listId = getListIdFromURL();

        if (!listId) return;
        
        fetch(`http://127.0.0.1:8000/api/tasklist/${listId}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ACCESSKEY}`,
            },
            body: JSON.stringify(updatedList),
        })
            .then(res => res.json())
            .then(list => {
                document.getElementById("edit-list-popup").classList.add("hidden");

                const titleElem = document.getElementById("list-title");
                if (titleElem) {
                    titleElem.textContent = list.listName;
                }

                const newURL = `${window.location.pathname}?list_id=${list.id}&name=${encodeURIComponent(list.listName)}`;
                window.history.replaceState({}, '', newURL);

                const li = document.createElement("li");
                li.classList.add("sidebar-list-element-child");
                li.textContent = list.listName;
                li.addEventListener("click", () => {
                    window.location.href = `tasklist.html?list_id=${list.id}&name=${encodeURIComponent(list.listName)}`;
                });
                tasklistContainer.appendChild(li);
            })
            .catch(err => {
                console.error("Fehler beim Bearbeiten der Liste:", err);
                alert("Liste konnte nicht bearbeitet werden!");
            });
    });

    // Liste löschen
    document.getElementById("delete-list-btn")?.addEventListener("click", () => {
        const listTitle = document.getElementById("list-title");
        const listId = getListIdFromURL();
        if (!listId) {
            alert("Bitte wähle zuerst eine Liste aus!");
            return;
        }

        const confirmed = window.confirm("Möchtest du diese Liste wirklich löschen?");
        if (!confirmed) return;

        fetch(`http://127.0.0.1:8000/api/tasklist/${listId}/`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ACCESSKEY}`
            }
        })
        .then(response => {
            if (response.ok) {
                alert(`Liste wurde gelöscht`);
                listTitle.textContent = "Unbekannte Liste";
            } else {
                alert("Fehler beim Löschen der Liste!");
            }
        })
        .catch(error => {
            console.error("Löschfehler:", error);
            alert("Ein unerwarteter Fehler ist aufgetreten");
        });
    });


    // Neue Aufgabe speichern
    document.getElementById("save-new-btn")?.addEventListener("click", () => {
        const description = document.getElementById("new-description").value;
        const dueOn = document.getElementById("new-dueOn").value;

        if(!description) return alert("Beschreibung darf nicht leer sein!");

        const listId = getListIdFromURL();
        const newTask = {
            description, 
            state: "offen",
            list: listId,
        };

        if (dueOn) {
            newTask.dueOn = dueOn;
        }

        fetch(`http://127.0.0.1:8000/api/tasklist/${listId}/tasks/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ACCESSKEY}`,
            },
            body: JSON.stringify(newTask),
        })
            .then(res => res.json())
            .then(task => {
                document.getElementById("add-popup").classList.add("hidden");
                addTaskToTable(task);
                loadTasks();
            })
            .catch(err => {
                console.error("Fehler beim Speichern!", err);
                alert("Aufgabe konnte nicht gespeichert werden!");
            });
        loadTasks();
    });

    // Bestehende Aufgabe bearbeiten
    document.getElementById("save-edit-btn")?.addEventListener("click", () => {
        if (!selectedTask) return;

        const updatedDescription = document.getElementById("edit-description").value;
        const updatedDueOn = document.getElementById("edit-dueOn").value;

        const updatedTask = {
            id: selectedTask.id,
            description: updatedDescription,
            state: selectedTask.state,
        };

        if (updatedDueOn) {
            updatedTask.dueOn = updatedDueOn; 
        }

        fetch(`http://127.0.0.1:8000/api/task/${selectedTask.id}/`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ACCESSKEY}`,
            },
            body: JSON.stringify(updatedTask),
        })
            .then(res => res.json())
            .then(updatedData => {
                loadTasks();
                close_popup();
            })
            .catch(err => {
                console.error("Fehler beim Speichern!", err);
                alert("Fehler beim Speichern!");
            });
    });

    // Alle Aufgaben einer Liste laden
    function loadTasks() {
        const tableBody = document.getElementById("table-body");
        const listId = getListIdFromURL();

        if (!listId) return;
        
        fetch(`http://127.0.0.1:8000/api/tasklist/${listId}/tasks/`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ACCESSKEY}`,
            },
        })
            .then(res => res.json())
            .then(data => {
                tableBody.innerHTML = "";

                const openTasks = data.filter(task => task.state !== "done");
                const doneTasks = data.filter(task => task.state === "done");

                const allTasks = [...openTasks, ...doneTasks];

                if (allTasks.length === 0) {
                    const tr = document.createElement("tr");
                    const td = document.createElement("td");
                    td.colSpan = 5;
                    td.textContent = "Noch keine Aufgaben vorhanden";
                    td.style.textAlign = "center";
                    td.style.fontStyle = "ubuntu-regular";
                    td.style.padding = "1rem";
                    tr.appendChild(td);
                    tableBody.appendChild(tr);
                } else {
                    allTasks.forEach(addTaskToTable);
                }
                
            })
            .catch(err => console.error("Fehler beim Laden der Aufgaben:", err));
    }

    function getListIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get("list_id");
    }

    function close_popup() {
        document.getElementById("edit-popup").classList.add("hidden");
        document.getElementById("edit-list-popup").classList.add("hidden");
        selectedList = null;
        selectedTask = null;
    }

    function edit_task(task) {
        selectedTask = task;
        document.getElementById("edit-description").value = task.description;
        document.getElementById("edit-dueOn").value = task.dueOn ? task.dueOn.slice(0, 16) : "";
        document.getElementById("edit-popup").classList.remove("hidden");
    }

    function delete_task(taskId, tableRow) {
        if (!confirm("Willst du diese Aufgabe wirklich löschen?")) return;

        fetch(`http://127.0.0.1:8000/api/task/${taskId}/`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${ACCESSKEY}` },
        })
            .then(res => {
                if (res.ok) tableRow.remove();
                else throw new Error("Fehler beim Löschen!");
            })
            .catch(err => {
                console.error(err);
                alert("Löschen fehlgeschlagen!");
            });
    }

    // Ausgelagerte Funktion zum Hinzufügen neuer Tabellen-Zeilen
    function addTaskToTable(task) {
        const tableBody = document.getElementById("table-body");

        if (!tableBody) {
            console.error("Tbody ist null");
            return;
        }

        const tableRow = document.createElement("tr");

        const tableDataCheckbox = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.classList.add("row-checkbox");
        checkbox.value = task.id;
        tableDataCheckbox.appendChild(checkbox);

        const tableDataDescription = document.createElement("td");
        tableDataDescription.innerText = task.description;

        const tableDataState = document.createElement("td");
        tableDataState.classList.add("status-cell");

        const tableDataDueOn = document.createElement("td");
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

        const tableDataAktion = document.createElement("td");

        const editButton = document.createElement("button");
        const editIcon = document.createElement("img");
        editIcon.src = "../assets/images/edit.png";
        editIcon.alt = "Bearbeiten";
        editIcon.classList.add("edit-icon");
        editButton.classList.add("edit-btn");
        editButton.appendChild(editIcon);

        const deleteButton = document.createElement("button");
        const deleteIcon = document.createElement("img");
        deleteIcon.src = "../assets/images/delete.png";
        deleteIcon.alt = "Löschen";
        deleteIcon.classList.add("delete-icon");
        deleteButton.classList.add("delete-btn");
        deleteButton.appendChild(deleteIcon);

        editIcon.addEventListener("click", () => {
            edit_task(task);
        });
    
        deleteIcon.addEventListener("click", () => {
            delete_task(task.id, tableRow);
        });
    
        if (task.state === "done") {
            tableRow.classList.add("done");
            checkbox.checked = true;
            tableDataState.innerText = "erledigt";
        } else {
            tableDataState.innerText = "offen";
        }

        tableRow.appendChild(tableDataCheckbox);
        tableRow.appendChild(tableDataDescription);
        tableRow.appendChild(tableDataState);
        tableRow.appendChild(tableDataDueOn);
        tableDataAktion.appendChild(editButton);
        tableDataAktion.appendChild(deleteButton);
        tableRow.appendChild(tableDataAktion);
    
        if (task.state === "done") {
            tableBody.appendChild(tableRow);
        } else {
            tableBody.insertBefore(tableRow, tableBody.firstChild);
        }

        // Checkbox Status-Änderung
        checkbox.addEventListener("change", function () {
            const row = this.closest("tr");
            const statusCell = row. querySelector(".status-cell");
            const taskId = parseInt(this.value);
            const newState = this.checked ? "done" : "open";
    
            if (this.checked) {
                row.classList.add("done");
                tableBody.appendChild(row);
                statusCell.innerText = "erledigt";
            } else {
                row.classList.remove("done");
                statusCell.innerText = "offen";
                tableBody.insertBefore(row, tableBody.firstChild);
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
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${ACCESSKEY}`,
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
    }
    loadTasks();
    
});