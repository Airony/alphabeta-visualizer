import type { MyNode, State } from "./types";

export const initTree: MyNode = {
  value: null,
  highlighted: true,
  visited: true,
  children: [
    {
      value: null,
      children: [
        {
          value: null,
          children: [
            { value: 3, children: [] },
            { value: 17, children: [] },
          ],
        },
        {
          value: null,
          children: [
            { value: 2, children: [] },
            { value: 4, children: [] },
          ],
        },
      ],
    },
    {
      value: null,
      children: [
        {
          value: null,
          children: [
            { value: 15, children: [] },
            { value: 24, children: [] },
          ],
        },
        {
          value: null,
          children: [
            { value: 3, children: [] },
            { value: 8, children: [] },
          ],
        },
      ],
    },
  ],
};

export const initialStack: State[] = [
  {
    opType: "explore",
    child: 0,
    node: initTree,
  },
];
