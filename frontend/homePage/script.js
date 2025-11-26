document.addEventListener("DOMContentLoaded", function () {
    // --- State ---
    let allTasks = [];
    let currentSort = "smartPriorityScore";
    const authStore = {
        isLoggedIn: true,
        logout: () => {
            authStore.isLoggedIn = false;
            console.log("User logged out.");
            updateNavbar();
            alert("You have been logged out.");
            renderAllTasks([]); // Clear tasks on logout
            renderCircularTasks([]);
        },
    };

    // --- DOM Elements ---
    const authLinksContainer = document.getElementById("auth-links");
    const logoutButton = document.getElementById("logout-btn");
    const allTasksList = document.getElementById("all-tasks-list");
    const circularTasksList = document.getElementById("circular-tasks-list");
    const sortSelect = document.getElementById("sort-select");

    // --- Render Functions ---
    const renderAllTasks = (tasks) => {
        allTasksList.innerHTML = "";
        if (tasks.length === 0) {
            allTasksList.innerHTML = "<p>No pending tasks found. Great job!</p>";
            return;
        }

        // Sort tasks based on current selection
        tasks.sort((a, b) => {
            if (currentSort === "due_date") {
                return new Date(a.due_date) - new Date(b.due_date);
            }
            return b[currentSort] - a[currentSort]; // Descending for scores/importance
        });

        tasks.forEach((task) => {
            const scoreLabel = {
                priorityScore: "Priority",
                smartPriorityScore: "Smart Score",
                due_date: "Due Date",
                importance: "Importance",
            };

            const scoreValue =
                currentSort === "due_date" ? task.due_date : task[currentSort];

            const taskElement = document.createElement("div");
            taskElement.className = "task-item";
            taskElement.id = `task-${task.id}`;
            taskElement.innerHTML = `
        <div class="task-main">
          <div class="task-header">
            <span class="task-number">#${task.number}</span>
            <h3 class="task-title">${task.title}</h3>
          </div>
          <div class="task-details">
            <p>Hours: <span>${task.estimated_hours}</span></p>
            <p>Importance: <span>${task.importance}</span></p>
            <p>Dependencies: <span>${task.dependencies.length > 0 ? task.dependencies.join(", ") : "None"
                }</span></p>
          </div>
        </div>
        <div class="task-score">
          <div class="score-value">${scoreValue}</div>
          <div class="score-label">${scoreLabel[currentSort]}</div>
        </div>
        <div class="task-actions">
          <input type="checkbox" class="complete-checkbox" data-task-id="${task.id}" title="Mark as complete">
          <button class="action-btn delete-btn" data-task-id="${task.id}" title="Delete task">
            <i data-lucide="trash-2" class="icon-sm"></i>
          </button>
        </div>
      `;
            allTasksList.appendChild(taskElement);
        });
        lucide.createIcons(); // Re-render icons
    };

    const renderCircularTasks = (tasks) => {
        circularTasksList.innerHTML = "";
        if (tasks.length === 0) {
            circularTasksList.innerHTML = "<p>No circular dependencies found.</p>";
            return;
        }
        tasks.forEach((task) => {
            const taskElement = document.createElement("div");
            taskElement.className = "task-item circular";
            taskElement.innerHTML = `
        <div class="task-main">
          <div class="task-header">
            <span class="task-number">#${task.number}</span>
            <h3 class="task-title">${task.title}</h3>
          </div>
          <div class="task-details">
            <p>Dependencies: <span>${task.dependencies.join(", ")}</span></p>
          </div>
        </div>
      `;
            circularTasksList.appendChild(taskElement);
        });
    };

    // --- API Functions ---
    const fetchData = async () => {
        if (!authStore.isLoggedIn) return;
        try {
            // Fetch all tasks
            const tasksResponse = await fetch("http://127.0.0.1:8000/api/tasks/");
            const tasks = await tasksResponse.json();
            allTasks = tasks.filter((task) => !task.completed);
            renderAllTasks(allTasks);

            // Fetch circular tasks
            const circularResponse = await fetch("http://127.0.0.1:8000/api/tasks/circular/");
            const circularTasks = await circularResponse.json();
            renderCircularTasks(circularTasks);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            allTasksList.innerHTML = "<p>Error loading tasks.</p>";
        }
    };

    const deleteTask = async (taskId) => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/api/tasks/delete/${taskId}/`, {
                method: "DELETE",
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to delete task");
            }
            document.getElementById(`task-${taskId}`).remove();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    const completeTask = async (taskId) => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/tasks/toggle/${taskId}/`, {
                method: "POST",
            });
            if (!response.ok) throw new Error("Failed to mark task as complete");

            document.getElementById(`task-${taskId}`).remove();
        } catch (error) {
            alert(`Error: ${error.message}`);
        }
    };

    // --- Event Handlers ---
    const handleSortChange = (event) => {
        currentSort = event.target.value;
        renderAllTasks(allTasks);
    };

    const handleListClick = (event) => {
        const target = event.target;
        if (target.matches(".delete-btn, .delete-btn *")) {
            const button = target.closest(".delete-btn");
            deleteTask(button.dataset.taskId);
        }
        if (target.matches(".complete-checkbox")) {
            completeTask(target.dataset.taskId);
        }
    };

    // --- Initial Setup ---
    const init = () => {
        lucide.createIcons();
        updateNavbar();
        logoutButton.addEventListener("click", authStore.logout);
        sortSelect.addEventListener("change", handleSortChange);
        allTasksList.addEventListener("click", handleListClick);

        fetchData();
    };

    const updateNavbar = () => {
        if (authStore.isLoggedIn) {
            authLinksContainer.style.display = "flex";
        } else {
            authLinksContainer.style.display = "none";
        }
    };

    init();
});