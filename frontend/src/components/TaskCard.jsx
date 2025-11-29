import { Trash2, CheckCircle2, Edit, Clock, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { isPast, isToday, differenceInDays } from "date-fns";

const TaskCard = ({ task, onDelete, onComplete, sortBy }) => {
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete task #${task.number}?`)) {
      try {
        await onDelete(task.id);
        toast.success("Task deleted successfully");
      } catch (error) {
        toast.error(error.response?.data?.error || "Failed to delete task");
      }
    }
  };

  const handleComplete = async () => {
    try {
      await onComplete(task.id);
      toast.success("Task marked as completed");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to complete task");
    }
  };

  const displayScore = sortBy === "smartPriorityScore"
    ? task.smartPriorityScore
    : task.priorityScore;

  // --- Date Checks ---
  const dueDate = task.due_date ? new Date(task.due_date) : null;
  const isTaskDueToday = dueDate ? isToday(dueDate) : false;
  // A task is overdue if the due date is in the past, it's not completed,
  // and it wasn't due today.
  const isDueTomorrow = dueDate ? differenceInDays(dueDate, new Date()) === 1 : false;

  const isOverdue = dueDate ? !task.completed && isPast(dueDate) && !isTaskDueToday : false;
  // --- End Date Checks ---

  return (
    <div className={`bg-base-200 rounded-lg p-4 border-l-4 transition-all hover:shadow-lg ${isOverdue ? "border-error" : "border-transparent"
      }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary">Task #{task.number}</span>
            <span className="text-xs px-2 py-1 bg-base-300 rounded">
              ID: {task.id}
            </span>
            {isTaskDueToday && !task.completed && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 rounded-full">
                <Clock className="w-3 h-3" />
                Due Today
              </span>
            )}
            {isDueTomorrow && !task.completed && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 rounded-full">
                <Clock className="w-3 h-3" />
                Due Tomorrow
              </span>
            )}
            {isOverdue && (
              <span className="flex items-center gap-1 text-xs px-2 py-1 bg-error/20 text-error-content rounded-full">
                <AlertTriangle className="w-3 h-3" />
                Overdue
              </span>
            )}
          </div>

          <h3 className="text-lg font-medium">{task.title}</h3>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-base-content/60">Estimated Hours:</span>
              <span className="ml-2 font-medium">{task.estimated_hours}</span>
            </div>
            <div>
              <span className="text-base-content/60">Importance:</span>
              <span className="ml-2 font-medium">{task.importance}/10</span>
            </div>
          </div>

          {task.dependencies && task.dependencies.length > 0 && (
            <div className="text-sm">
              <span className="text-base-content/60">Dependencies:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {task.dependencies.map((depId) => (
                  <span
                    key={depId}
                    className="px-2 py-0.5 bg-warning/20 text-warning rounded text-xs"
                  >
                    #{depId}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm">
            <div>
              <span className="text-base-content/60">
                {sortBy === "smartPriorityScore" ? "Smart Priority:" : "Priority:"}
              </span>
              <span className="ml-2 font-bold text-primary">{displayScore.toFixed(2)}</span>
            </div>
            {task.due_date && (
              <div>
                <span className="text-base-content/60">Due:</span>
                <span className="ml-2">{dueDate.toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate(`/edit-task/${task.id}`)}
            className="btn btn-sm btn-primary gap-2"
            title="Edit task"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleComplete}
            className="btn btn-sm btn-success gap-2"
            title="Mark as completed"
          >
            <CheckCircle2 className="w-4 h-4" />
            Complete
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-sm btn-error gap-2"
            title="Delete task"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
