document.addEventListener("DOMContentLoaded", () => {
  const THEMES = [
    "light",
    "dark",
    "cupcake",
    "bumblebee",
    "emerald",
    "corporate",
    "synthwave",
    "retro",
    "cyberpunk",
    "valentine",
    "halloween",
    "garden",
    "forest",
    "aqua",
    "lofi",
    "pastel",
    "fantasy",
    "wireframe",
    "black",
    "luxury",
    "dracula",
    "cmyk",
    "autumn",
    "business",
    "acid",
    "lemonade",
    "night",
    "coffee",
    "winter",
  ];

  const themeGrid = document.getElementById("theme-grid");
  const htmlElement = document.documentElement;

  // Function to apply a theme
  const applyTheme = (themeName) => {
    htmlElement.setAttribute("data-theme", themeName);
    localStorage.setItem("chat-theme", themeName);

    // Update active class on buttons
    document.querySelectorAll("#theme-grid button").forEach((btn) => {
      if (btn.dataset.themeName === themeName) {
        btn.classList.add("bg-base-200");
      } else {
        btn.classList.remove("bg-base-200");
      }
    });
  };

  // Function to create and render theme buttons
  const renderThemeButtons = () => {
    themeGrid.innerHTML = ""; // Clear existing buttons
    THEMES.forEach((t) => {
      const button = document.createElement("button");
      button.className = `group flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors hover:bg-base-200/50`;
      button.dataset.themeName = t;
      button.onclick = () => applyTheme(t);

      button.innerHTML = `
        <div class="relative h-8 w-full rounded-md overflow-hidden" data-theme="${t}">
          <div class="absolute inset-0 grid grid-cols-4 gap-px p-1">
            <div class="rounded bg-primary"></div>
            <div class="rounded bg-secondary"></div>
            <div class="rounded bg-accent"></div>
            <div class="rounded bg-neutral"></div>
          </div>
        </div>
        <span class="text-[11px] font-medium truncate w-full text-center">
          ${t.charAt(0).toUpperCase() + t.slice(1)}
        </span>`;
      themeGrid.appendChild(button);
    });
  };

  // --- INITIALIZATION ---
  renderThemeButtons();
  const savedTheme = localStorage.getItem("chat-theme") || "light";
  applyTheme(savedTheme);
  lucide.createIcons();
});
