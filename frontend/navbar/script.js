document.addEventListener("DOMContentLoaded", function () {
    // --- State Simulation ---
    // This simulates the `useAuthStore`.
    // Set `isLoggedIn` to `false` to see the logged-out state.
    const authStore = {
        isLoggedIn: true, // Change to `false` to test the logged-out view
        logout: () => {
            authStore.isLoggedIn = false;
            console.log("User logged out.");
            updateNavbar();
            // In a real app, you would redirect or clear tokens here.
            alert("You have been logged out.");
        },
    };

    // --- DOM Elements ---
    const authLinksContainer = document.getElementById("auth-links");
    const mainNavContainer = document.getElementById("main-nav");
    const logoutButton = document.getElementById("logout-btn");

    // --- Functions ---
    const updateNavbar = () => {
        if (authStore.isLoggedIn) {
            authLinksContainer.style.display = "flex";
            if (mainNavContainer) mainNavContainer.style.display = "flex";
        } else {
            authLinksContainer.style.display = "none";
            if (mainNavContainer) mainNavContainer.style.display = "none";
        }
    };

    const setActiveLink = () => {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll(".nav-link");
        navLinks.forEach(link => {
            if (link.getAttribute('href') === currentPath) {
                link.classList.add("active");
            }
        });
    };

    // --- Initial Setup ---
    // 1. Render Lucide Icons
    lucide.createIcons();

    // 2. Set initial visibility of auth-dependent links
    updateNavbar();

    // 3. Set the active link based on the current URL
    setActiveLink();

    // 4. Add event listener for logout
    logoutButton.addEventListener("click", authStore.logout);
});