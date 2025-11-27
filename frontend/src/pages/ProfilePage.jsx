import { useState, useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Mail, User, Phone, Save } from "lucide-react";
import { updateProfile, getCurrentUser } from "../api/profile";
import toast from "react-hot-toast";

const ProfilePage = () => {
  const { authUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (authUser) {
      setFormData({
        name: authUser.name || "",
        email: authUser.email || "",
        phone: authUser.phone || "",
      });
    } else {
      // Fetch user data if not in store
      loadUserData();
    }
  }, [authUser]);

  const loadUserData = async () => {
    try {
      const user = await getCurrentUser();
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    } catch (error) {
      toast.error("Failed to load user data");
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Invalid phone number format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);
    try {
      await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
      });
      toast.success("Profile updated successfully");
      // Reload user data to get updated info
      await loadUserData();
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-8">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-base-300 rounded-xl p-6 space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2 text-base-content/60">Update your profile information</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.name ? "input-error" : ""
                }`}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
              {errors.name && (
                <p className="text-error text-sm">{errors.name}</p>
              )}
            </div>

            {/* Email Field - Read Only */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                className="input input-bordered w-full bg-base-200"
                placeholder="Enter your email"
                disabled={true}
                readOnly
              />
              <p className="text-xs text-base-content/60">
                Email cannot be changed
              </p>
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.phone ? "input-error" : ""
                }`}
                placeholder="Enter your phone number (optional)"
                disabled={isLoading}
              />
              {errors.phone && (
                <p className="text-error text-sm">{errors.phone}</p>
              )}
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="btn btn-primary gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
