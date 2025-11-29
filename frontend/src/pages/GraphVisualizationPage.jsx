import { useState, useEffect, useCallback } from "react";
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    MarkerType,
} from "reactflow";
import dagre from "dagre";
import { Loader } from "lucide-react";
import { getAllTasks } from "../api/tasks"; // Assuming this new API function exists
import toast from "react-hot-toast";

import "reactflow/dist/style.css";

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (nodes, edges, direction = "TB") => {
    const isHorizontal = direction === "LR";
    dagreGraph.setGraph({ rankdir: direction });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

const GraphVisualizationPage = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [isLoading, setIsLoading] = useState(true);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    useEffect(() => {
        const loadGraphData = async () => {
            try {
                setIsLoading(true);
                const tasks = await getAllTasks();

                if (!tasks || tasks.length === 0) {
                    setNodes([]);
                    setEdges([]);
                    return;
                }

                const initialNodes = tasks.map((task, index) => ({
                    id: task.id.toString(),
                    type: "default",
                    data: { label: `${task.title}` },
                    position: { x: 0, y: 0 }, // Position will be calculated by dagre
                    style: {
                        background: task.completed ? "#d1fae5" : "#fff",
                        borderColor: task.completed ? "#10b981" : "#9ca3af",
                    },
                }));

                const initialEdges = [];
                tasks.forEach((task) => {
                    if (task.dependencies && task.dependencies.length > 0) {
                        task.dependencies.forEach((depId) => {
                            initialEdges.push({
                                id: `e-${depId}-${task.id}`,
                                source: depId.toString(),
                                target: task.id.toString(),
                                style: { stroke: "#f97316" },
                                markerEnd: {
                                    type: MarkerType.ArrowClosed,
                                    color: "#f97316",
                                    width: 20,
                                    height: 20,
                                },
                            });
                        });
                    }
                });

                const { nodes: layoutedNodes, edges: layoutedEdges } =
                    getLayoutedElements(
                        initialNodes,
                        initialEdges
                    );

                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
            } catch (error) {
                toast.error("Failed to load task graph.");
                console.error("Error loading graph data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadGraphData();
    }, [setNodes, setEdges]);

    return (
        <div className="min-h-screen pt-20 pb-8 bg-base-200">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6">Task Graph Visualization</h1>
                <div
                    className="bg-base-100 rounded-lg shadow-lg p-6"
                    style={{ height: "70vh" }}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full">
                            <Loader className="w-12 h-12 animate-spin text-primary" />
                        </div>
                    ) : nodes.length === 0 ? (
                        <div className="text-center py-12 text-base-content/60">
                            <p>No tasks to visualize. Add some tasks first!</p>
                        </div>
                    ) : (
                        <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            fitView
                        >
                            <Controls />
                            <MiniMap />
                            <Background variant="dots" gap={12} size={1} />
                        </ReactFlow>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GraphVisualizationPage;
