import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Loader } from "lucide-react";
import { createTask, getAllTasks } from "../api/tasks";
import toast from "react-hot-toast";

const AddTaskPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
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
    loadAvailableTasks();
  }, []);

  const loadAvailableTasks = async () => {
    try {
      const tasks = await getAllTasks();
      setAvailableTasks(tasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.number.trim()) {
      newErrors.number = "Task number is required";
    } else if (isNaN(formData.number) || parseInt(formData.number) <= 0) {
      newErrors.number = "Task number must be a positive integer";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.due_date) {
      newErrors.due_date = "Due date is required";
    } else {
      const dueDate = new Date(formData.due_date);
      if (dueDate < new Date().setHours(0, 0, 0, 0)) {
        newErrors.due_date = "Due date cannot be in the past";
      }
    }

    if (!formData.estimated_hours) {
      newErrors.estimated_hours = "Estimated hours is required";
    } else if (
      isNaN(formData.estimated_hours) ||
      parseFloat(formData.estimated_hours) <= 0
    ) {
      newErrors.estimated_hours = "Estimated hours must be a positive number";
    }

    if (!formData.importance) {
      newErrors.importance = "Importance is required";
    } else {
      const importance = parseInt(formData.importance);
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
    const { value, checked } = e.target;
    const depId = parseInt(value);

    setFormData((prev) => {
      const currentDeps = prev.dependencies;
      if (checked) {
        return { ...prev, dependencies: [...currentDeps, depId] };
      } else {
        return { ...prev, dependencies: currentDeps.filter((id) => id !== depId) };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsLoading(true);
    try {
      await createTask({
        number: parseInt(formData.number),
        title: formData.title.trim(),
        due_date: formData.due_date,
        estimated_hours: parseInt(formData.estimated_hours),
        importance: parseInt(formData.importance),
        dependencies: formData.dependencies,
      });
      toast.success("Task created successfully");
      navigate("/");
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to create task"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAvailableTasks = availableTasks.filter(
    (task) => task.number !== parseInt(formData.number)
  );

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
            <h1 className="text-2xl font-bold">Add New Task</h1>
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
                className={`input input-bordered w-full ${errors.number ? "input-error" : ""
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
                className={`input input-bordered w-full ${errors.title ? "input-error" : ""
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
                className={`input input-bordered w-full ${errors.due_date ? "input-error" : ""
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
                className={`input input-bordered w-full ${errors.estimated_hours ? "input-error" : ""
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
                className={`input input-bordered w-full ${errors.importance ? "input-error" : ""
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
              <div
                className="border border-base-300 rounded-lg p-2 h-40 overflow-y-auto space-y-2"
                disabled={isLoading || filteredAvailableTasks.length === 0}
              >
                {filteredAvailableTasks.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-base-content/60">
                    No tasks available
                  </div>
                ) : (
                  filteredAvailableTasks.map((task) => (
                    <label key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200 cursor-pointer">
                      <input
                        type="checkbox"
                        value={task.id}
                        checked={formData.dependencies.includes(task.id)}
                        onChange={handleDependencyChange}
                        className="checkbox checkbox-primary"
                      />
                      <span>Task #{task.number}: {task.title}</span>
                    </label>
                  ))
                )}
              </div>

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
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Create Task
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

export default AddTaskPage;
