// Shared Authentication Utility
const API_BASE_URL = "http://127.0.0.1:8000/api";

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isLoggedIn = false;
        this.loadAuthState();
    }

    async loadAuthState() {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/me/`, {
                method: "GET",
                credentials: "include",
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data.user;
                this.isLoggedIn = true;
            } else {
                this.currentUser = null;
                this.isLoggedIn = false;
            }
        } catch (error) {
            console.error("Failed to load auth state:", error);
            this.currentUser = null;
            this.isLoggedIn = false;
        }
    }

    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                this.currentUser = data.user;
                this.isLoggedIn = true;
                return { success: true, user: data.user, message: data.message };
            } else {
                return { success: false, error: data.error || "Login failed" };
            }
        } catch (error) {
            return { success: false, error: "Network error: " + error.message };
        }
    }

    async register(email, password, name, phone) {
        try {
            // Prepare data - only include phone if it's provided
            const requestData = {
                email: email.trim(),
                password: password,
                name: name.trim(),
            };
            
            // Only add phone if it's provided and not empty
            if (phone && phone.trim()) {
                requestData.phone = phone.trim();
            }

            console.log("Registering user with data:", { ...requestData, password: "***" });

            const response = await fetch(`${API_BASE_URL}/auth/register/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify(requestData),
            });

            const data = await response.json();
            console.log("Registration response:", response.status, data);

            if (response.ok) {
                this.currentUser = data.user;
                this.isLoggedIn = true;
                return { success: true, user: data.user, message: data.message };
            } else {
                return { success: false, error: data.error || "Registration failed" };
            }
        } catch (error) {
            console.error("Registration error:", error);
            return { success: false, error: "Network error: " + error.message };
        }
    }

    async logout() {
        try {
            await fetch(`${API_BASE_URL}/auth/logout/`, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            this.currentUser = null;
            this.isLoggedIn = false;
        }
    }

    async getCurrentUser() {
        if (this.isLoggedIn && this.currentUser) {
            return this.currentUser;
        }
        await this.loadAuthState();
        return this.currentUser;
    }

    redirectToLogin() {
        // Simple and reliable redirect - works from any location
        const currentPath = window.location.pathname;
        console.log('Redirecting to login from:', currentPath);
        
        // If we're already in frontend directory, use relative path
        if (currentPath.includes('/frontend/')) {
            // Find where we are and navigate to signin
            if (currentPath.includes('/auth/')) {
                // We're in auth folder, go to signin
                const target = 'signin/index.html';
                console.log('Redirecting to:', target);
                window.location.href = target;
            } else {
                // We're in another frontend folder, go up and into auth
                const target = '../auth/signin/index.html';
                console.log('Redirecting to:', target);
                window.location.href = target;
            }
        } else {
            // Fallback: absolute path
            const target = '/frontend/auth/signin/index.html';
            console.log('Redirecting to:', target);
            window.location.href = target;
        }
    }

    redirectToHome() {
        // Simple and reliable redirect - works from any location
        const currentPath = window.location.pathname;
        console.log('Redirecting to home from:', currentPath);
        
        // If we're already in frontend directory, use relative path
        if (currentPath.includes('/frontend/')) {
            // Find where we are and navigate to homePage
            if (currentPath.includes('/auth/')) {
                // We're in auth folder, go up two levels then to homePage
                const target = '../../homePage/Index.html';
                console.log('Redirecting to:', target);
                window.location.href = target;
            } else if (currentPath.includes('/homePage/')) {
                // We're already on home page, just reload
                console.log('Already on home page, reloading');
                window.location.reload();
            } else {
                // We're in another frontend folder, go to homePage
                const target = '../homePage/Index.html';
                console.log('Redirecting to:', target);
                window.location.href = target;
            }
        } else {
            // Fallback: absolute path
            const target = '/frontend/homePage/Index.html';
            console.log('Redirecting to:', target);
            window.location.href = target;
        }
    }
}

// Create global instance
const authManager = new AuthManager();

