import type { MyEdge, MyNoode } from "./nodes-edges";

export function resetNode(node: MyNoode, isLeaf: boolean): MyNoode {
  return {
    ...node,
    data: {
      alpha: undefined,
      beta: undefined,
      highlighted: false,
      value: isLeaf ? node.data.value : undefined,
      visited: false,
    },
  };
}

export function resetEdge(edge: MyEdge): MyEdge {
  return {
    ...edge,
    data: {
      deleted: false,
    },
  };
}
