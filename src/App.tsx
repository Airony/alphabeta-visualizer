import { useId, useRef, useState, type ReactElement } from "react";
import "./App.css";
import { execute, type MyNode, type State } from "./types";
import type { UINodeData } from "./NodeComp";

const initTree: MyNode = {
  value: null,
  highlighted: true,
  children: [
    {
      value: null,
      children: [
        {
          value: 3,
          children: [],
        },
        {
          value: 17,
          children: [],
        },
      ],
    },
    {
      value: null,
      children: [
        {
          value: 6,
          children: [],
        },
        {
          value: 1,
          children: [],
        },
      ],
    },
  ],
};

const initialStack: State[] = [
  {
    opType: "explore",
    child: 0,
    node: initTree,
  },
];

export type UINode = {
  value?: number;
  highlighted: boolean;
  children: UINode[];
};

function duplicateTree(tree: MyNode): MyNode {
  return {
    value: tree.value,
    children: tree.children.map((child) => duplicateTree(child)),
    highlighted: tree.highlighted,
  };
}
function constructTreeUI(tree: MyNode): ReactElement {
  //console.log("Rerendieng tree", tree);
  return (
    <div className="vertical-container">
      <div className={`node ${tree.highlighted ? "highlighted" : ""}`}>
        {tree.value}
      </div>
      <div className="horizontal-container">
        {tree.children.map((child) => constructTreeUI(child))}
      </div>
    </div>
  );
}

function App() {
  const stack = useRef<State[]>(initialStack);
  const [tree, setTree] = useState<MyNode>(duplicateTree(initTree));

  function handleNext() {
    execute(stack.current);
    setTree(duplicateTree(initTree));
  }

  return (
    <>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
      <div className="tree-container">{constructTreeUI(tree)}</div>
      <button onClick={handleNext}>Next</button>
    </>
  );
}

export default App;
