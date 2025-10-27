import { useState } from "react";
import "./App.css";
import { execute, type MyNode, type State } from "./types";

const tree: MyNode = {
  value: null,
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
    child: undefined,
    node: tree,
  },
];

let cap = 30;
do {
  cap--;
  execute(initialStack);
  console.log(initialStack);
} while (initialStack.length > 0 && cap >= 0);
console.log("Final tree is ");
console.log(tree);

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  );
}

export default App;
