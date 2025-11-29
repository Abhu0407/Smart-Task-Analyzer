import { useDroppable } from "@dnd-kit/core";

const Quadrant = ({ id, title, description, children, className }) => {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    const quadrantStyle = {
        borderColor: isOver ? "hsl(var(--p))" : "hsl(var(--b3))",
        transition: "border-color 0.2s ease-in-out",
    };

    return (
        <div ref={setNodeRef} style={quadrantStyle} className={`border p-4 min-h-[200px] ${className}`}>
            <h2 className='text-xl font-bold mb-2'>{title}</h2>
            <p className='mb-4 text-sm text-base-content/70'>{description}</p>
            <div className='space-y-2'>{children}</div>
        </div>
    );
};

export default Quadrant;