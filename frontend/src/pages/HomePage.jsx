import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Loader } from "lucide-react";
import { getIncompleteTasks, getCircularTasks, deleteTask, toggleTaskCompleted } from "../api/tasks";
import TaskCard from "../components/TaskCard";
import CircularGroup from "../components/CircularGroup";
import toast from "react-hot-toast";

const HomePage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [circularTasks, setCircularTasks] = useState([]);
  const [sortBy, setSortBy] = useState("smartPriorityScore");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingCircular, setIsLoadingCircular] = useState(true);

  useEffect(() => {
    loadTasks();
    loadCircularTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setIsLoading(true);
      const data = await getIncompleteTasks();
      setTasks(data);
    } catch (error) {
      toast.error("Failed to load tasks");
      console.error("Error loading tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCircularTasks = async () => {
    try {
      setIsLoadingCircular(true);
      const data = await getCircularTasks();
      // Group circular tasks by dependency chains
      const grouped = groupCircularTasks(data);
      setCircularTasks(grouped);
    } catch (error) {
      toast.error("Failed to load circular tasks");
      console.error("Error loading circular tasks:", error);
    } finally {
      setIsLoadingCircular(false);
    }
  };

  // Group circular tasks into dependency chains
  const groupCircularTasks = (tasks) => {
    if (!tasks || tasks.length === 0) return [];

    const taskMap = new Map(tasks.map((t) => [t.id, t]));
    const groups = [];
    const processed = new Set();

    // Simple grouping: find tasks that form cycles
    tasks.forEach((task) => {
      if (processed.has(task.id)) return;

      const group = [task];
      processed.add(task.id);

      // Find tasks that depend on this task and vice versa
      const findConnected = (currentTask) => {
        // Check if any other circular task depends on this one
        tasks.forEach((otherTask) => {
          if (
            !processed.has(otherTask.id) &&
            (otherTask.dependencies.includes(currentTask.id) ||
              currentTask.dependencies.includes(otherTask.id))
          ) {
            group.push(otherTask);
            processed.add(otherTask.id);
            findConnected(otherTask);
          }
        });
      };

      findConnected(task);

      if (group.length > 0) {
        groups.push(group);
      }
    });

    return groups;
  };

  const handleDelete = async (taskId) => {
    await deleteTask(taskId);
    await loadTasks();
    await loadCircularTasks();
  };

  const handleComplete = async (taskId) => {
    await toggleTaskCompleted(taskId);
    await loadTasks();
    await loadCircularTasks();
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Sort tasks based on selected option
  const sortedTasks = [...tasks].sort((a, b) => {
    switch (sortBy) {
      case "priorityScore":
        return b.priorityScore - a.priorityScore;
      case "smartPriorityScore":
        return b.smartPriorityScore - a.smartPriorityScore;
      case "due_date":
        return new Date(a.due_date) - new Date(b.due_date);
      case "importance":
        return b.importance - a.importance;
      default:
        return 0;
    }
  });

  return (
    <div className="min-h-screen pt-20 pb-8 bg-base-200">
      <div className="container mx-auto px-4">
        {/* Header with Add Task Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Task Dashboard</h1>
          <button
            onClick={() => navigate("/add-task")}
            className="btn btn-primary gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </button>
        </div>

        {/* Section 1: Incomplete Tasks */}
        <div className="bg-base-100 rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Incomplete Tasks</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Sort by:</label>
              <select
                value={sortBy}
                onChange={handleSortChange}
                className="select select-bordered select-sm"
              >
                <option value="smartPriorityScore">Smart Priority Score</option>
                <option value="priorityScore">Priority Score</option>
                <option value="due_date">Due Date</option>
                <option value="importance">Importance</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : sortedTasks.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <p>No incomplete tasks found.</p>
              <button
                onClick={() => navigate("/add-task")}
                className="btn btn-primary btn-sm mt-4"
              >
                Create Your First Task
              </button>
            </div>
          ) : (
            <div className="grid gap-4">
              {sortedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onDelete={handleDelete}
                  onComplete={handleComplete}
                  sortBy={sortBy}
                />
              ))}
            </div>
          )}
        </div>

        {/* Section 2: Circular Tasks */}
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Circular Dependencies</h2>

          {isLoadingCircular ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : circularTasks.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <p>No circular dependencies detected. Great job!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {circularTasks.map((group, index) => (
                <CircularGroup key={index} group={group} groupIndex={index} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
