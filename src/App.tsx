import { useRef, useState, type ReactElement } from "react";
import "./App.css";
import { execute, type MyNode, type State } from "./types";

const initTree: MyNode = {
  value: null,
  highlighted: true,
  visited: true,
  children: [
    {
      value: null,
      children: [
        {
          value: 3,
          children: [],
        },
        {
          value: 5,
          children: [],
        },
      ],
    },
    {
      value: null,
      children: [
        {
          value: 2,
          children: [],
        },
        {
          value: 9,
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
    ...tree,
    children: tree.children.map((child) => duplicateTree(child)),
  };
}
function constructTreeUI(tree: MyNode): ReactElement {
  //console.log("Rerendieng tree", tree);
  return (
    <div className="vertical-container">
      <div
        className={`node ${tree.highlighted ? "highlighted" : ""} ${tree.prunned ? "prunned" : ""}`}
      >
        {tree.value}
        {tree.visited && (
          <ul className="node-info">
            <li>alpha: {tree.alpha}</li>
            <li>beta: {tree.beta}</li>
          </ul>
        )}
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
