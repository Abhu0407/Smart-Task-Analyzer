import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Loader } from "lucide-react";
import { getCompletedTasks } from "../api/tasks";
import toast from "react-hot-toast";

const CompletedTaskPage = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCompletedTasks();
  }, []);

  const loadCompletedTasks = async () => {
    try {
      setIsLoading(true);
      const data = await getCompletedTasks();
      setTasks(data);
    } catch (error) {
      toast.error("Failed to load completed tasks");
      console.error("Error loading completed tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-8 bg-base-200">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-base-100 rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => navigate("/")}
              className="btn btn-ghost btn-sm"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="text-2xl font-bold">Completed Tasks</h1>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12 text-base-content/60">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-base-content/30" />
              <p className="text-lg">No completed tasks yet.</p>
              <p className="text-sm mt-2">
                Complete some tasks to see them here!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-base-200 rounded-lg p-4 border border-base-300 hover:border-success/50 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        <span className="text-sm font-semibold text-primary">
                          Task #{task.number}
                        </span>
                        <span className="text-xs px-2 py-1 bg-base-300 rounded">
                          ID: {task.id}
                        </span>
                      </div>
                      <h3 className="text-lg font-medium mb-2">{task.title}</h3>
                      {task.due_date && (
                        <p className="text-sm text-base-content/60">
                          Due Date: {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompletedTaskPage;

