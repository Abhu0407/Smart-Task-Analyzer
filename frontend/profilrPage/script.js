document.addEventListener("DOMContentLoaded", () => {
  // --- MOCK DATA & STATE ---
  const mockAuthUser = {
    fullName: "John Doe",
    email: "john.doe@example.com",
    profilePic: "https://avatar.iran.liara.run/public/boy",
    createdAt: new Date().toISOString(),
  };

  let isUpdatingProfile = false;

  const PREDEFINED_AVATARS = [
    "https://avatar.iran.liara.run/public/boy",
    "https://avatar.iran.liara.run/public/girl",
    "https://avatar.iran.liara.run/public/45",
    "https://avatar.iran.liara.run/public/46",
    "https://avatar.iran.liara.run/public/23",
    "https://avatar.iran.liara.run/public/24",
    "https://avatar.iran.liara.run/public/11",
    "https://avatar.iran.liara.run/public/12",
  ];

  // --- DOM ELEMENTS ---
  const profilePic = document.getElementById("profile-pic");
  const uploadLabel = document.getElementById("upload-label");
  const avatarUploadInput = document.getElementById("avatar-upload");
  const avatarSelectorBtn = document.getElementById("avatar-selector-btn");
  const uploadStatus = document.getElementById("upload-status");
  const avatarModal = document.getElementById("avatar-modal");
  const avatarGrid = document.getElementById("avatar-grid");

  // --- UI UPDATE FUNCTIONS ---
  const populateUserData = (user) => {
    document.getElementById("user-fullname").textContent = user.fullName;
    document.getElementById("user-email").textContent = user.email;
    document.getElementById("user-created-at").textContent = user.createdAt.split("T")[0];
    profilePic.src = user.profilePic || "/avatar.png";
  };

  const setUpdatingState = (isUpdating) => {
    isUpdatingProfile = isUpdating;
    if (isUpdating) {
      uploadStatus.textContent = "Uploading...";
      uploadLabel.classList.add("animate-pulse", "pointer-events-none", "opacity-50");
      avatarSelectorBtn.classList.add("animate-pulse", "pointer-events-none", "opacity-50");
      avatarUploadInput.disabled = true;
    } else {
      uploadStatus.textContent = "Click the camera icon to upload a photo or the sparkle icon to choose an avatar";
      uploadLabel.classList.remove("animate-pulse", "pointer-events-none", "opacity-50");
      avatarSelectorBtn.classList.remove("animate-pulse", "pointer-events-none", "opacity-50");
      avatarUploadInput.disabled = false;
    }
  };

  // --- MOCK API CALL ---
  const updateProfile = async (newProfileData) => {
    setUpdatingState(true);
    console.log("Updating profile with:", newProfileData);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (newProfileData.profilePic) {
      mockAuthUser.profilePic = newProfileData.profilePic;
      profilePic.src = newProfileData.profilePic;
    }

    console.log("Profile updated successfully!");
    setUpdatingState(false);
  };

  // --- EVENT LISTENERS ---

  // Handle file input change for image upload
  avatarUploadInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      profilePic.src = base64Image; // Preview image
      await updateProfile({ profilePic: base64Image });
    };
  });

  // Open avatar selector modal
  avatarSelectorBtn.addEventListener("click", () => {
    if (!isUpdatingProfile) {
      avatarModal.showModal();
    }
  });

  // Handle avatar selection from the modal
  const handleAvatarSelect = async (avatarUrl) => {
    avatarModal.close();
    profilePic.src = avatarUrl; // Preview image
    await updateProfile({ profilePic: avatarUrl });
  };

  // --- INITIALIZATION ---

  // Populate the avatar grid in the modal
  const createAvatarGrid = () => {
    avatarGrid.innerHTML = ""; // Clear existing avatars
    PREDEFINED_AVATARS.forEach((url) => {
      const button = document.createElement("button");
      button.className = "rounded-full overflow-hidden border-2 border-transparent hover:border-primary transition-all duration-200";
      button.onclick = () => handleAvatarSelect(url);

      const img = document.createElement("img");
      img.src = url;
      img.alt = "Avatar";
      img.className = "w-full h-full object-cover";

      button.appendChild(img);
      avatarGrid.appendChild(button);
    });
  };

  // Initial setup
  const init = () => {
    lucide.createIcons();
    populateUserData(mockAuthUser);
    createAvatarGrid();
  };

  init();
});
