import "./App.css";
import "@xyflow/react/dist/style.css";
import Dagre from "@dagrejs/dagre";
import {
  Panel,
  ReactFlow,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import {
  initialEdges,
  initialNodes,
  nodeTypes,
  type MyNoode,
} from "./nodes-edges";
import { useCallback, useEffect, useRef, useState } from "react";

const getLayoutedElements = (nodes: MyNoode[], edges: Edge[]) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB" });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: 75,
      height: 75,
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

type AdjacencyMap = { map: Map<string, string[]>; rootId: string };

function buildAdjacencyMaps(nodes: Node[], edges: Edge[]): AdjacencyMap {
  const map = new Map<string, string[]>();
  edges.forEach((edge) => {
    if (map.has(edge.source)) {
      map.get(edge.source)!.push(edge.target);
    } else {
      map.set(edge.source, [edge.target]);
    }
  });
  const rootId = nodes
    .map((node) => node.id)
    .find((nodeId) => edges.every((edge) => edge.target !== nodeId))!;

  return {
    map,
    rootId,
  };
}

type State = {
  node: string;
  child?: number;
};

type ExecutionData = {
  map: AdjacencyMap;
  stack: State[];
};

function App() {
  const { fitView } = useReactFlow();
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const layoutDone = useRef<boolean>(false);
  const [isEditMode] = useState<boolean>(false);
  const executionData = useRef<ExecutionData | null>(null);

  useEffect(() => {
    if (isEditMode) {
      return;
    }
    const adjacencyMap = buildAdjacencyMaps(nodes, edges);
    executionData.current = {
      map: adjacencyMap,
      stack: [
        {
          child: 0,
          node: adjacencyMap.rootId,
        },
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);

  function getNodeById(id: string): MyNoode {
    return { ...nodes.find((node) => node.id === id)! };
  }

  function updateNode(updatedNode: MyNoode) {
    setNodes((prev) =>
      prev.map((node) => (node.id === updatedNode.id ? updatedNode : node)),
    );
  }

  //TODO: Refactor this because its a mess right now
  function execute() {
    const currentState = executionData.current!.stack.pop();
    if (!currentState) {
      console.log("Operation Finished!");
      return;
    }

    const currentNode = getNodeById(currentState.node)!;
    const childIds =
      executionData.current!.map.map.get(currentState.node) ?? [];

    currentNode.data!.highlighted = false;

    // If the node has no more children to handle, then the next task is to bubble up its value to the parent
    if (childIds.length <= (currentState.child || 0)) {
      const parentState = executionData.current!.stack.pop();
      if (!parentState) {
        //We have finished our execution at this point.
        return;
      }
      const parentNode = getNodeById(parentState.node);
      const parentValue = parentNode.data.value;
      let newParentValue = parentValue;

      if (
        !parentValue ||
        parentValue <= -1 * (currentNode.data.value as number)
      ) {
        newParentValue = -1 * (currentNode.data.value as number);
      }

      parentNode.data.alpha =
        parentNode.data.alpha !== undefined
          ? Math.max(parentNode.data.alpha, newParentValue as number)
          : (newParentValue as number);
      parentNode.data.highlighted = true;
      // Update parent value and then move on to the next child
      parentNode.data.value = newParentValue;

      updateNode(parentNode);
      updateNode(currentNode);

      executionData.current!.stack.push({
        node: parentState.node,
        child: (parentState.child as number) + 1,
      });
      return;
    }

    // otherwise, push it down
    executionData.current!.stack.push(currentState);

    const parentAlpha = currentNode.data.alpha;
    const parentBeta = currentNode.data.beta;
    const nextExploredChild = childIds[currentState.child as number];
    const nextExploredNode = getNodeById(nextExploredChild);
    if (parentAlpha && parentBeta && parentAlpha >= parentBeta) {
      nextExploredNode.data.prunned = true;
      //prune the next child nodes
      //basically lets just skip all nodes
      currentState.child = childIds.length;
      currentNode.data.highlighted = true;
      updateNode(currentNode);
      updateNode(nextExploredNode);
      return;
    }

    nextExploredNode.data.alpha =
      parentBeta !== undefined ? -1 * parentBeta : undefined;
    nextExploredNode.data.beta =
      parentAlpha !== undefined ? -1 * parentAlpha : undefined;

    const nextState: State = {
      node: childIds[currentState.child as number],
      child: 0,
    };

    nextExploredNode.data.highlighted = true;
    nextExploredNode.data.visited = true;
    updateNode(nextExploredNode);
    updateNode(currentNode);
    executionData.current!.stack.push(nextState);
  }

  const onLayout = useCallback(() => {
    const layouted = getLayoutedElements(nodes, edges);

    setNodes([...layouted.nodes]);
    setEdges([...layouted.edges]);
    fitView();
  }, [nodes, edges, fitView, setEdges, setNodes]);

  useEffect(() => {
    onLayout();
  }, []);

  useEffect(() => {
    const allMeasured = nodes.every((n) => n.measured);
    if (!layoutDone.current && allMeasured) {
      layoutDone.current = true;
      onLayout();
    }
  }, [nodes, onLayout]);

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        nodesDraggable={false}
        edgesReconnectable={false}
        nodeTypes={nodeTypes}
      >
        <Panel position="top-left">
          <button onClick={() => execute()}>Next</button>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default App;
