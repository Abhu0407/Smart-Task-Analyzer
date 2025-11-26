document.addEventListener("DOMContentLoaded", function () {
    // --- State Simulation ---
    const authStore = {
        isLoggedIn: true, // Assume user is logged in to fetch tasks
        logout: () => {
            authStore.isLoggedIn = false;
            console.log("User logged out.");
            updateNavbar();
            alert("You have been logged out.");
            // On logout, we should clear the task list
            document.getElementById("task-list").innerHTML =
                "<p>Please log in to see your tasks.</p>";
        },
    };

    // --- DOM Elements ---
    const authLinksContainer = document.getElementById("auth-links");
    const logoutButton = document.getElementById("logout-btn");
    const taskListContainer = document.getElementById("task-list");

    // --- Functions ---
    const updateNavbar = () => {
        if (authStore.isLoggedIn) {
            authLinksContainer.style.display = "flex";
        } else {
            authLinksContainer.style.display = "none";
        }
    };

    const fetchCompletedTasks = async () => {
        // In a real app, you'd get the base URL from a config
        const API_URL = "http://127.0.0.1:8000/api/tasks/completed/";

        // Show a loading message
        taskListContainer.innerHTML = "<p>Loading tasks...</p>";

        try {
            // The backend view requires an authenticated user.
            // In a real app, you would send an auth token in the headers.
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const tasks = await response.json();

            // Clear loading message
            taskListContainer.innerHTML = "";

            if (tasks.length === 0) {
                taskListContainer.innerHTML = "<p>No completed tasks found.</p>";
                return;
            }

            tasks.forEach((task) => {
                const taskElement = document.createElement("div");
                taskElement.className = "task-item";
                taskElement.innerHTML = `
          <div class="task-info">
            <span class="task-number">#${task.number}</span>
            <h3 class="task-title">${task.title}</h3>
          </div>
          <span class="task-due-date">Due: ${task.due_date}</span>
        `;
                taskListContainer.appendChild(taskElement);
            });
        } catch (error) {
            console.error("Failed to fetch tasks:", error);
            taskListContainer.innerHTML =
                "<p>Could not load tasks. Please try again later.</p>";
        }
    };

    // --- Initial Setup ---
    lucide.createIcons();
    updateNavbar();
    logoutButton.addEventListener("click", authStore.logout);

    // Fetch tasks only if logged in
    if (authStore.isLoggedIn) {
        fetchCompletedTasks();
    } else {
        taskListContainer.innerHTML = "<p>Please log in to see your tasks.</p>";
    }
});