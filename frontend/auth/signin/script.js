document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  lucide.createIcons();

  const loginForm = document.getElementById("login-form");
  const passwordInput = document.getElementById("password");
  const togglePasswordButton = document.getElementById("toggle-password");
  const submitButton = document.getElementById("submit-button");
  const buttonText = document.getElementById("button-text");
  const loader = document.getElementById("loader");

  // --- Password Visibility Toggle ---
  togglePasswordButton.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";

    // Change icon
    const icon = togglePasswordButton.querySelector("i");
    icon.setAttribute("data-lucide", isPassword ? "eye-off" : "eye");
    lucide.createIcons(); // Re-render the icon
  });

  // --- Form Submission ---
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form data
    const formData = new FormData(loginForm);
    const email = formData.get("email");
    const password = formData.get("password");

    // --- UI state: Start loading ---
    setLoading(true);

    // --- Simulate API call ---
    // In a real application, you would make a fetch request here.
    // e.g., await fetch('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    console.log("Submitting:", { email, password });

    // Simulate a network delay of 2 seconds
    setTimeout(() => {
      console.log("Login successful (simulated)");

      // --- UI state: Stop loading ---
      setLoading(false);

      // Here you would typically handle the response,
      // like redirecting the user or showing an error message.
      alert(`Logged in with email: ${email}`);

    }, 2000);
  });

  function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    if (isLoading) {
      buttonText.classList.add("hidden");
      loader.classList.remove("hidden");
      loader.classList.add("loading");
    } else {
      buttonText.classList.remove("hidden");
      loader.classList.add("hidden");
      loader.classList.remove("loading");
    }
    lucide.createIcons(); // Re-render loader icon if needed
  }
});
