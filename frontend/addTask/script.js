document.addEventListener("DOMContentLoaded", function () {
    // --- State Simulation ---
    const authStore = {
        isLoggedIn: true, // Assume user is logged in
        logout: () => {
            authStore.isLoggedIn = false;
            console.log("User logged out.");
            updateNavbar();
            alert("You have been logged out.");
            // Optionally, disable the form if logged out
            document.getElementById("add-task-form").style.opacity = "0.5";
            document.getElementById("add-task-form").style.pointerEvents = "none";
        },
    };

    // --- DOM Elements ---
    const authLinksContainer = document.getElementById("auth-links");
    const logoutButton = document.getElementById("logout-btn");
    const taskForm = document.getElementById("add-task-form");
    const messageContainer = document.getElementById("form-message");

    // --- Functions ---
    const updateNavbar = () => {
        if (authStore.isLoggedIn) {
            authLinksContainer.style.display = "flex";
        } else {
            authLinksContainer.style.display = "none";
        }
    };

    const handleFormSubmit = async (event) => {
        event.preventDefault();
        messageContainer.style.display = "none"; // Hide previous messages

        const formData = new FormData(taskForm);
        const data = Object.fromEntries(formData.entries());

        // Convert dependencies from string to array of numbers
        const dependencies = data.dependencies
            .split(",")
            .map((id) => parseInt(id.trim(), 10))
            .filter((id) => !isNaN(id)); // Filter out invalid numbers

        const payload = {
            number: parseInt(data.number, 10),
            title: data.title,
            due_date: data.due_date,
            estimated_hours: parseInt(data.estimated_hours, 10),
            importance: parseInt(data.importance, 10),
            dependencies: dependencies,
        };

        try {
            const response = await fetch("http://127.0.0.1:8000/api/tasks/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // In a real app, you would include an Authorization header
                    // 'Authorization': `Bearer ${your_auth_token}`
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "An unknown error occurred.");
            }

            messageContainer.textContent = `Success: ${result.message}`;
            messageContainer.className = "form-message success";
            messageContainer.style.display = "block";
            taskForm.reset(); // Clear the form on success
        } catch (error) {
            messageContainer.textContent = `Error: ${error.message}`;
            messageContainer.className = "form-message error";
            messageContainer.style.display = "block";
            console.error("Failed to add task:", error);
        }
    };

    // --- Initial Setup ---
    lucide.createIcons();
    updateNavbar();
    logoutButton.addEventListener("click", authStore.logout);
    taskForm.addEventListener("submit", handleFormSubmit);

    if (!authStore.isLoggedIn) {
        taskForm.style.opacity = "0.5";
        taskForm.style.pointerEvents = "none";
    }
});