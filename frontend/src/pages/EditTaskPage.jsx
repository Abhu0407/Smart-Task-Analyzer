import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, Loader } from "lucide-react";
import { updateTask, getAllTasks, getTaskById } from "../api/tasks";
import toast from "react-hot-toast";

const EditTaskPage = () => {
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTask, setIsLoadingTask] = useState(true);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [formData, setFormData] = useState({
    number: "",
    title: "",
    due_date: "",
    estimated_hours: "",
    importance: "",
    dependencies: [],
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadTaskData();
    loadAvailableTasks();
  }, [taskId]);

  const loadTaskData = async () => {
    try {
      setIsLoadingTask(true);
      const task = await getTaskById(parseInt(taskId));
      
      // Format date for input field (YYYY-MM-DD)
      const dueDate = task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : "";
      
      setFormData({
        number: task.number ? String(task.number) : "",
        title: task.title || "",
        due_date: dueDate,
        estimated_hours: task.estimated_hours ? String(task.estimated_hours) : "",
        importance: task.importance ? String(task.importance) : "",
        dependencies: task.dependencies || [],
      });
    } catch (error) {
      toast.error("Failed to load task data");
      console.error("Error loading task:", error);
      navigate("/");
    } finally {
      setIsLoadingTask(false);
    }
  };

  const loadAvailableTasks = async () => {
    try {
      const tasks = await getAllTasks();
      // Exclude the current task from dependencies list
      const filteredTasks = tasks.filter(t => t.id !== parseInt(taskId));
      setAvailableTasks(filteredTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Convert to string for validation if it's a number
    const numberStr = String(formData.number || "").trim();
    if (!numberStr) {
      newErrors.number = "Task number is required";
    } else if (isNaN(numberStr) || parseInt(numberStr) <= 0) {
      newErrors.number = "Task number must be a positive integer";
    }

    if (!formData.title || !String(formData.title).trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    }

    const estimatedHoursStr = String(formData.estimated_hours || "").trim();
    if (!estimatedHoursStr) {
      newErrors.estimated_hours = "Estimated hours is required";
    } else if (
      isNaN(estimatedHoursStr) ||
      parseFloat(estimatedHoursStr) <= 0
    ) {
      newErrors.estimated_hours = "Estimated hours must be a positive number";
    }

    const importanceStr = String(formData.importance || "").trim();
    if (!importanceStr) {
      newErrors.importance = "Importance is required";
    } else {
      const importance = parseInt(importanceStr);
      if (isNaN(importance) || importance < 1 || importance > 10) {
        newErrors.importance = "Importance must be between 1 and 10";
      }
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
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleDependencyChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      parseInt(option.value)
    );
    setFormData((prev) => ({
      ...prev,
      dependencies: selectedOptions,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);
    try {
      await updateTask(parseInt(taskId), {
        number: parseInt(String(formData.number)),
        title: String(formData.title || "").trim(),
        due_date: formData.due_date,
        estimated_hours: parseInt(String(formData.estimated_hours)),
        importance: parseInt(String(formData.importance)),
        dependencies: formData.dependencies,
      });
      toast.success("Task updated successfully");
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to update task"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingTask) {
    return (
      <div className="min-h-screen pt-20 pb-8 bg-base-200 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8 bg-base-200">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/")}
              className="btn btn-ghost btn-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-2xl font-bold">Edit Task</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Task Number */}
            <div className="space-y-2">
              <label className="label">
                <span className="label-text font-medium">Task Number *</span>
              </label>
              <input
                type="number"
                name="number"
                value={formData.number}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.number ? "input-error" : ""
                }`}
                placeholder="Enter task number (must be unique)"
                disabled={isLoading}
                min="1"
              />
              {errors.number && (
                <p className="text-error text-sm">{errors.number}</p>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <label className="label">
                <span className="label-text font-medium">Title *</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.title ? "input-error" : ""
                }`}
                placeholder="Enter task title"
                disabled={isLoading}
              />
              {errors.title && (
                <p className="text-error text-sm">{errors.title}</p>
              )}
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <label className="label">
                <span className="label-text font-medium">Due Date *</span>
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.due_date ? "input-error" : ""
                }`}
                disabled={isLoading}
              />
              {errors.due_date && (
                <p className="text-error text-sm">{errors.due_date}</p>
              )}
            </div>

            {/* Estimated Hours */}
            <div className="space-y-2">
              <label className="label">
                <span className="label-text font-medium">Estimated Hours *</span>
              </label>
              <input
                type="number"
                name="estimated_hours"
                value={formData.estimated_hours}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.estimated_hours ? "input-error" : ""
                }`}
                placeholder="Enter estimated hours"
                disabled={isLoading}
                min="1"
                step="0.5"
              />
              {errors.estimated_hours && (
                <p className="text-error text-sm">{errors.estimated_hours}</p>
              )}
            </div>

            {/* Importance */}
            <div className="space-y-2">
              <label className="label">
                <span className="label-text font-medium">Importance (1-10) *</span>
              </label>
              <input
                type="number"
                name="importance"
                value={formData.importance}
                onChange={handleChange}
                className={`input input-bordered w-full ${
                  errors.importance ? "input-error" : ""
                }`}
                placeholder="Enter importance (1-10)"
                disabled={isLoading}
                min="1"
                max="10"
              />
              {errors.importance && (
                <p className="text-error text-sm">{errors.importance}</p>
              )}
            </div>

            {/* Dependencies */}
            <div className="space-y-2">
              <label className="label">
                <span className="label-text font-medium">Dependencies</span>
              </label>
              <select
                multiple
                value={formData.dependencies.map(String)}
                onChange={handleDependencyChange}
                className="select select-bordered w-full h-32"
                disabled={isLoading || availableTasks.length === 0}
              >
                {availableTasks.length === 0 ? (
                  <option disabled>No other tasks available</option>
                ) : (
                  availableTasks.map((task) => (
                    <option key={task.id} value={task.id}>
                      Task #{task.number}: {task.title} (ID: {task.id})
                    </option>
                  ))
                )}
              </select>
              <p className="text-xs text-base-content/60">
                Hold Ctrl (or Cmd on Mac) to select multiple dependencies. Current task is excluded.
              </p>
              {formData.dependencies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.dependencies.map((depId) => {
                    const task = availableTasks.find((t) => t.id === depId);
                    return task ? (
                      <span
                        key={depId}
                        className="badge badge-primary badge-lg"
                      >
                        Task #{task.number}
                      </span>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="btn btn-ghost"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Update Task
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

export default EditTaskPage;

