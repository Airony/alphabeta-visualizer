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
import {
  edgeTypes,
  initialEdges,
  initialNodes,
  nodeTypes,
  type MyEdge,
  type MyNoode,
} from "./nodes-edges";
import { useCallback, useEffect, useRef, useState } from "react";
import { resetEdge, resetNode } from "./utils";

const getLayoutedElements = (nodes: MyNoode[], edges: MyEdge[]) => {
  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: "TB", marginx: 100, marginy: 100 });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  console.log("measured width ", nodes[0].measured?.width);
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
  child?: number;
};

type ExecutionData = {
  map: AdjacencyMap;
  rootId: string;
  stack: State[];
};

function App() {
  const { fitView } = useReactFlow();
  const [nodes, setNodes] = useNodesState(initialNodes);
  const [edges, setEdges] = useEdgesState(initialEdges);
  const [isEditMode] = useState<boolean>(false);
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
    const currentState = executionData.current.stack.pop();
    if (!currentState) {
      console.log("Operation Finished!");
      return;
    }

    const currentNode = getNodeById(currentState.node)!;
    const childIds = executionData.current.map.get(currentState.node) ?? [];

    currentNode.data.highlighted = false;

    // If the node has no more children to handle, then the next task is to bubble up its value to the parent
    if (childIds.length <= (currentState.child || 0)) {
      const parentState = executionData.current.stack.pop();
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

      executionData.current.stack.push({
        node: parentState.node,
        child: (parentState.child as number) + 1,
      });
      return;
    }

    // otherwise, push it down
    executionData.current.stack.push(currentState);

    const currentAlpha = currentNode.data.alpha;
    const currentBeta = currentNode.data.beta;
    const nextExploredChild = childIds[currentState.child as number];
    if (currentAlpha && currentBeta && currentAlpha >= currentBeta) {
      pruneEdge(currentState.node, nextExploredChild);
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
      currentAlpha !== undefined ? -1 * currentAlpha : undefined;

    const nextState: State = {
      node: childIds[currentState.child as number],
      child: 0,
    };

    nextExploredNode.data.highlighted = true;
    nextExploredNode.data.visited = true;
    updateNode(nextExploredNode);
    updateNode(currentNode);
    executionData.current.stack.push(nextState);
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
        <button onClick={() => execute()}>Next</button>
        <button onClick={() => resetExecution()}>Reset</button>
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
          minZoom={1}
          translateExtent={[
            [-750, -750],
            [1250, 750],
          ]}
        ></ReactFlow>
      </div>
    </div>
  );
}

export default App;
