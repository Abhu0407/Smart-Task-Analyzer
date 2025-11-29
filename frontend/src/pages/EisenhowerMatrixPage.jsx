import { useEffect, useState, useCallback, useMemo } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { getAllTasks as apiGetTasks, updateTask as apiUpdateTask } from "../api/tasks"; // Using direct API calls
import Quadrant from "../components/eisenhower/Quadrant";
import TaskCard from "../components/eisenhower/TaskCard";
import { Loader } from "lucide-react";
import toast from "react-hot-toast";

const EisenhowerMatrixPage = () => {
  const [taskItems, setTaskItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const getTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const tasks = await apiGetTasks();
      setTaskItems(tasks);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getTasks();
  }, [getTasks]);

  const classifiedTasks = useMemo(() => {
    const now = new Date();
    return taskItems.map((task) => {
      const dueDate = new Date(task.due_date);
      const hoursLeft = (dueDate - now) / (1000 * 60 * 60);

      const isUrgent = hoursLeft <= 24 || (hoursLeft > 0 && hoursLeft <= task.estimated_hours);
      const isImportant = task.importance >= 6;

      return { ...task, isUrgent, isImportant };
    });
  }, [taskItems]);

  const quadrants = {
    do: { title: "Q1: Do Now", tasks: [] },
    plan: { title: "Q2: Plan", tasks: [] },
    delegate: { title: "Q3: Delegate", tasks: [] },
    eliminate: { title: "Q4: Eliminate", tasks: [] },
  };

  classifiedTasks.forEach((task) => {
    if (task.isUrgent && task.isImportant) {
      quadrants.do.tasks.push(task);
    } else if (!task.isUrgent && task.isImportant) {
      quadrants.plan.tasks.push(task);
    } else if (task.isUrgent && !task.isImportant) {
      quadrants.delegate.tasks.push(task);
    } else {
      quadrants.eliminate.tasks.push(task);
    }
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const taskId = active.id;
      const newQuadrantId = over.id;

      const now = new Date();
      const oneDay = 24 * 60 * 60 * 1000;
      const threeDays = 3 * oneDay;

      const newProperties = {
        do: { importance: 8, due_date: new Date(now.getTime() + oneDay).toISOString() }, // Important, Due soon
        plan: { importance: 8, due_date: new Date(now.getTime() + threeDays).toISOString() }, // Important, Due later
        delegate: { importance: 4, due_date: new Date(now.getTime() + oneDay).toISOString() }, // Not Important, Due soon
        eliminate: { importance: 2, due_date: new Date(now.getTime() + threeDays).toISOString() }, // Not Important, Due later
      };

      const updateData = newProperties[newQuadrantId];
      if (!updateData) return;

      // Optimistic UI update
      setTaskItems((prevTasks) =>
        prevTasks.map((t) => (t._id === taskId ? { ...t, ...updateData } : t))
      );

      // Update task on the backend
      apiUpdateTask(taskId, updateData).catch((error) => {
        toast.error(`Failed to update task: ${error.message}`);
        // Revert UI on error by refetching
        getTasks();
      });
    }
  };

  if (isLoading) {
    return (
      <div className='min-h-screen pt-20 pb-8 bg-base-200 flex items-center justify-center'>
        <Loader className='size-10 animate-spin text-primary' />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8 bg-base-200">
      <div className="container mx-auto px-4">
        {/* Title */}
        <h1 className="text-3xl font-bold text-center mb-10">The Eisenhower Matrix</h1>

        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
          <div className="bg-base-100 rounded-lg shadow-lg p-6">
            {/* Top Labels (Urgent / Non-Urgent) */}
            <div className="grid grid-cols-2 text-center font-semibold text-base-content mb-1">
              <div>URGENT</div>
              <div>NOT URGENT</div>
            </div>

            <div className="grid grid-cols-[auto_1fr_1fr] grid-rows-[auto_1fr_1fr]">
              {/* Left Labels (Important / Not Important) */}
              <div className="row-span-1 flex items-center justify-center font-semibold pr-2 rotate-[-90deg]">
                IMPORTANT
              </div>

              {/* Q1 – Do */}
              <Quadrant id='do' title='Do' description='Urgent and Important' className='bg-base-200'>
                {quadrants.do.tasks.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </Quadrant>

              {/* Q2 – Plan */}
              <Quadrant id='plan' title='Plan' description='Not Urgent but Important'>
                {quadrants.plan.tasks.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </Quadrant>

              {/* Left Label Row 2 */}
              <div className="row-span-1 flex items-center justify-center font-semibold pr-2 rotate-[-90deg]">
                NOT IMPORTANT
              </div>

              {/* Q3 – Delegate */}
              <Quadrant id='delegate' title='Delegate' description='Urgent but Not Important'>
                {quadrants.delegate.tasks.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </Quadrant>

              {/* Q4 – Eliminate */}
              <Quadrant id='eliminate' title='Eliminate' description='Not Urgent and Not Important' className='bg-base-200'>
                {quadrants.eliminate.tasks.map((task) => (
                  <TaskCard key={task._id} task={task} />
                ))}
              </Quadrant>
            </div>
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default EisenhowerMatrixPage;

/*
  * MOCK `useTaskStore` - for context

  import create from 'zustand';
  import toast from 'react-hot-toast';

  export const useTaskStore = create((set, get) => ({
    tasks: [],
    isLoading: true,
    getTasks: async () => {
      set({ isLoading: true });
      try {
        const res = await fetch("/api/tasks");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        set({ tasks: data, isLoading: false });
      } catch (error) {
        toast.error(error.message);
        set({ isLoading: false });
      }
    },
    updateTask: async (taskId, taskData) => {
      try {
        const res = await fetch(`/api/tasks/${taskId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(taskData),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        // Update local state
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task._id === taskId ? { ...task, ...taskData } : task
          ),
        }));
        toast.success("Task updated successfully");
      } catch (error) {
        toast.error(error.message);
        // Revert optimistic update on error if needed
        get().getTasks(); // Refetch to be safe
      }
    },
    // other actions like addTask, deleteTask...
  }));

  * MOCK `Task` object shape
  {
    _id: "string",
    title: "string",
    description: "string",
    completed: boolean,
    urgent: boolean,
    important: boolean,
    // ... other fields
  }

*/