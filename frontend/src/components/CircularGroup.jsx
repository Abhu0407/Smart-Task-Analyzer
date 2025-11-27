import { AlertTriangle } from "lucide-react";

const CircularGroup = ({ group, groupIndex }) => {
  if (!group || group.length === 0) return null;

  // Create a visual chain representation
  const chain = group.map((task, idx) => (
    <div key={task.id} className="flex items-center gap-2">
      <div className="bg-error/20 border border-error/50 rounded-lg p-3 min-w-[200px]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-error">Task #{task.number}</span>
          <span className="text-xs text-base-content/60">(ID: {task.id})</span>
        </div>
        <div className="text-sm font-medium truncate" title={task.title}>
          {task.title}
        </div>
      </div>
      {idx < group.length - 1 && (
        <div className="text-error font-bold">→</div>
      )}
    </div>
  ));

  return (
    <div className="bg-error/10 border border-error/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-error" />
        <h3 className="font-semibold text-error">Circular Group {groupIndex + 1}</h3>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {chain}
        {group.length > 0 && (
          <>
            <div className="text-error font-bold">→</div>
            <div className="text-error font-semibold">Task #{group[0].number}</div>
          </>
        )}
      </div>
      <p className="text-xs text-base-content/60 mt-2">
        These tasks have circular dependencies and may cause issues in task completion order.
      </p>
    </div>
  );
};

export default CircularGroup;

