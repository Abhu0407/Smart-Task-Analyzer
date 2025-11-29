import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";

const TaskCard = ({ task }) => {
	const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
		id: task._id,
	});

	const style = {
		transform: CSS.Translate.toString(transform),
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 10 : "auto",
		cursor: "grab",
	};

	return (
		<div ref={setNodeRef} style={style} {...listeners} {...attributes} className='card bg-base-200 shadow-md'>
			<div className='card-body p-4'>
				<h3 className='card-title text-sm'>{task.title}</h3>
			</div>
		</div>
	);
};

export default TaskCard;

