import "./App.css";
import "@xyflow/react/dist/style.css";
import Dagre from "@dagrejs/dagre";
import {
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
} from "@xyflow/react";
import { edgeTypes, nodeTypes, type MyEdge, type MyNoode } from "./nodes-edges";
import { useCallback, useEffect, useRef, useState } from "react";
import { resetEdge, resetNode } from "./utils";
import { constructNodesAndEdges } from "./constructor";

const getLayoutedElements = (nodes: MyNoode[], edges: MyEdge[]) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", marginx: 100, marginy: 100 });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.measured?.width || 50,
      height: node.measured?.height || 50,
    }),
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      const position = g.node(node.id);
      // We are shifting the dagre node position (anchor=center center) to the top left
      // so it matches the React Flow node anchor point (top left).
      const x = position.x - (node.measured?.width ?? 0) / 2;
      const y = position.y - (node.measured?.height ?? 0) / 2;

      return { ...node, position: { x, y } };
    }),
    edges,
  };
};

type AdjacencyMap = Map<string, string[]>;

function buildAdjacencyMap(edges: Edge[]): AdjacencyMap {
  const map = new Map<string, string[]>();
  edges.forEach((edge) => {
    if (map.has(edge.source)) {
      map.get(edge.source)!.push(edge.target);
    } else {
      map.set(edge.source, [edge.target]);
    }
  });
  return map;
}

type State = {
  node: string;
  child: number;
};

type ExecutionData = {
  map: AdjacencyMap;
  rootId: string;
  stack: State[];
};

const { nodes: initialNodes, edges: initialEdges } = constructNodesAndEdges(
  5,
  2,
  [15, 6, 3, 12, 42, 45, 42, 39, -9, 66, 27, 36, 33, 30, 61, 60],
);

function App() {
  const { fitView } = useReactFlow();
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [depth, setDepth] = useState<number>(5);
  const [childrenCount, setChildrenCount] = useState<number>(2);
  const executionData = useRef<ExecutionData>({
    map: new Map(),
    stack: [],
    rootId: "",
  });

  function resetExecution() {
    const { rootId } = executionData.current;
    clearNodeAndEdgeValues();
    setNodes((prev) =>
      prev.map((node) =>
        node.id !== rootId
          ? node
          : {
              ...node,
              data: { ...node.data, visited: true, highlighted: true },
            },
      ),
    );

    executionData.current = {
      ...executionData.current,
      stack: [
        {
          node: rootId,
          child: 0,
        },
      ],
    };
  }

  function clearNodeAndEdgeValues() {
    const nonLeaves = new Set<string>();
    edges.forEach((edge) => nonLeaves.add(edge.source));
    setNodes((prev) =>
      prev.map((node) => resetNode(node, !nonLeaves.has(node.id))),
    );

    setEdges((prev) => prev.map((e) => resetEdge(e)));
  }

  useEffect(() => {
    // When leaving edit mode, Setup the needed data for the execution
    if (isEditMode) {
      return;
    }
    const adjacencyMap = buildAdjacencyMap(edges);
    const rootId = nodes
      .map((node) => node.id)
      .find((nodeId) => edges.every((edge) => edge.target !== nodeId))!;

    executionData.current = {
      map: adjacencyMap,
      rootId,
      stack: [
        {
          child: 0,
          node: rootId,
        },
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  // helper to detect leaf ids
  const getLeafIds = useCallback(() => {
    const nonLeaves = new Set<string>();
    edges.forEach((edge) => nonLeaves.add(edge.source));
    const leafIds = nodes.map((n) => n.id).filter((id) => !nonLeaves.has(id));
    return new Set(leafIds);
  }, [edges, nodes]);

  // propagate edit flags and callbacks into node data whenever edges or edit mode changes
  useEffect(() => {
    const leafIds = getLeafIds();
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        data: {
          ...node.data,
          editMode: isEditMode,
          isLeaf: leafIds.has(node.id),
          nodeId: node.id,
          onLeafValueChange: (id: string, value?: number) => {
            setNodes((p) =>
              p.map((n) =>
                n.id === id ? { ...n, data: { ...n.data, value } } : n,
              ),
            );
          },
        },
      })),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode, edges]);

  function tryToggleEditMode(next: boolean) {
    if (!next) {
      // validate all leaves have values
      const leafIds = getLeafIds();
      const invalid = nodes.some(
        (n) =>
          leafIds.has(n.id) &&
          (typeof n.data.value !== "number" ||
            Number.isNaN(n.data.value as number)),
      );
      if (invalid) {
        // block leaving edit mode
        alert("Please fill all leaf node values before leaving edit mode.");
        return;
      }
      resetExecution();
      setIsEditMode(next);
    } else {
      clearNodeAndEdgeValues();
      setIsEditMode(next);
    }
  }

  function createTree() {
    // In edit mode, generate a fresh tree with empty leaf values
    console.log("Creating with stuff", depth);
    const { nodes: newNodes, edges: newEdges } = constructNodesAndEdges(
      depth,
      childrenCount,
      [],
    );
    console.log("nodes are ", newNodes);

    const layouted = getLayoutedElements(newNodes, newEdges);
    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
    fitView({ padding: 0.2 });
  }

  function getNodeById(id: string): MyNoode {
    return { ...nodes.find((node) => node.id === id)! };
  }

  function updateNode(updatedNode: MyNoode) {
    setNodes((prev) =>
      prev.map((node) => (node.id === updatedNode.id ? updatedNode : node)),
    );
  }

  function pruneEdge(source: string, target: string) {
    setEdges((prev) =>
      prev.map((edge) =>
        edge.source === source && edge.target === target
          ? { ...edge, data: { ...edge.data, deleted: true } }
          : edge,
      ),
    );
  }

  //TODO: Refactor this because its a mess right now
  function execute() {
    const stack = executionData.current.stack;
    const currentState = stack.pop();
    if (!currentState) {
      return;
    }

    const currentNode = getNodeById(currentState.node)!;
    const childIds = executionData.current.map.get(currentState.node) ?? [];

    currentNode.data.highlighted = false;

    // If the node has no more children to handle, then the next task is to bubble up its value to the parent
    if (childIds.length <= (currentState.child || 0)) {
      const parentState = stack.pop();
      if (!parentState) {
        //We have finished our execution at this point.
        return;
      }
      const parentNode = getNodeById(parentState.node);
      const { value: parentValue, alpha: parentAlpha } = parentNode.data;
      const currentValue = currentNode.data.value;
      let newParentValue = parentValue;

      if (!parentValue || parentValue <= -1 * (currentValue as number)) {
        newParentValue = -1 * (currentValue as number);
      }

      if (parentAlpha && parentAlpha > newParentValue!) {
        const grandParentState = stack.pop();

        if (!grandParentState) {
          return;
        }
        const grandParentChildIds =
          executionData.current.map.get(grandParentState.node) ?? [];

        if (grandParentState.child === grandParentChildIds.length - 1) {
          const grandParentNode = getNodeById(grandParentState.node);
          grandParentNode.data.highlighted = true;

          for (
            let i = grandParentState.child + 1;
            i < grandParentChildIds.length;
            i++
          ) {
            pruneEdge(grandParentState.node, grandParentChildIds[i]);
          }

          grandParentState.child = grandParentChildIds.length;
          grandParentNode.data.highlighted = true;
          updateNode(currentNode);
          updateNode(grandParentNode);
          stack.push({
            node: grandParentNode.id,
            child: grandParentChildIds.length,
          });
          return;
        }
        stack.push(grandParentState);
      }

      parentNode.data.highlighted = true;
      // Update parent value and then move on to the next child
      parentNode.data.value = newParentValue;

      updateNode(parentNode);
      updateNode(currentNode);

      stack.push({
        node: parentState.node,
        child: (parentState.child as number) + 1,
      });
      return;
    }

    // otherwise, push it down
    stack.push(currentState);

    const currentBeta = currentNode.data.beta;
    const currentValue = currentNode.data.value;
    const nextExploredChild = childIds[currentState.child as number];
    if (currentValue && currentBeta && currentValue >= currentBeta) {
      for (let i = currentState.child; i < childIds.length; i++) {
        pruneEdge(currentState.node, childIds[i]);
      }
      //pruneEdge(currentState.node, nextExploredChild);
      //prune the next child nodes
      //basically lets just skip all nodes
      currentState.child = childIds.length;
      currentNode.data.highlighted = true;
      updateNode(currentNode);
      return;
    }

    const nextExploredNode = getNodeById(nextExploredChild);

    nextExploredNode.data.alpha =
      currentBeta !== undefined ? -1 * currentBeta : undefined;
    nextExploredNode.data.beta =
      currentValue !== undefined ? -1 * currentValue : undefined;

    const nextState: State = {
      node: childIds[currentState.child as number],
      child: 0,
    };

    nextExploredNode.data.highlighted = true;
    nextExploredNode.data.visited = true;
    updateNode(nextExploredNode);
    updateNode(currentNode);
    stack.push(nextState);
  }

  const onLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges);

    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
    fitView({ padding: 0.2 });
  }, [nodes, edges, fitView, setEdges, setNodes]);

  useEffect(() => {
    const handleResize = () => onLayout();
    window.addEventListener("resize", handleResize);
    onLayout();
    return () => window.removeEventListener("resize", handleResize);
    //  eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="app-container">
      <div className="control-panel">
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button onClick={() => execute()} disabled={isEditMode}>
            Next
          </button>
          <button onClick={() => resetExecution()} disabled={isEditMode}>
            Reset
          </button>
          <button onClick={() => tryToggleEditMode(!isEditMode)}>
            {isEditMode ? "Leave Edit Mode" : "Enter Edit Mode"}
          </button>
          {isEditMode && (
            <>
              <label>
                Depth
                <input
                  type="number"
                  min={2}
                  value={depth}
                  onChange={(e) =>
                    setDepth(Math.max(2, Number(e.target.value) || 2))
                  }
                  style={{ width: "4rem", marginLeft: "4px" }}
                />
              </label>
              <label>
                Children
                <input
                  type="number"
                  min={1}
                  value={childrenCount}
                  onChange={(e) =>
                    setChildrenCount(Math.max(1, Number(e.target.value) || 1))
                  }
                  style={{ width: "4rem", marginLeft: "4px" }}
                />
              </label>
              <button onClick={createTree}>Create Tree</button>
            </>
          )}
        </div>
      </div>
      <div className="tree-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          nodesDraggable={false}
          edgesReconnectable={false}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          zoomOnDoubleClick={false}
        ></ReactFlow>
      </div>
    </div>
  );
}

export default App;
