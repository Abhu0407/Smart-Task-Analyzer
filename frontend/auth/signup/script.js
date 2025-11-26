document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  lucide.createIcons();

  const signupForm = document.getElementById("signup-form");
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

  // --- Form Validation ---
  function validateForm(formData) {
    const fullName = formData.get("fullName").trim();
    const email = formData.get("email").trim();
    const password = formData.get("password");

    if (!fullName) {
      alert("Full name is required");
      return false;
    }
    if (!email) {
      alert("Email is required");
      return false;
    }
    // Simple regex for email validation
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("Invalid email format");
      return false;
    }
    if (!password) {
      alert("Password is required");
      return false;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return false;
    }
    return true;
  }

  // --- Form Submission ---
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(signupForm);
    if (!validateForm(formData)) {
      return; // Stop submission if validation fails
    }

    setLoading(true);

    // Simulate API call
    console.log("Submitting:", Object.fromEntries(formData.entries()));
    setTimeout(() => {
      console.log("Signup successful (simulated)");
      setLoading(false);
      alert("Account created successfully!");
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
