import type { MyEdge, MyNoode } from "./nodes-edges";

export function resetNode(
  node: MyNoode,
  isRoot: boolean,
  isLeaf: boolean,
): MyNoode {
  return {
    ...node,
    data: {
      alpha: undefined,
      beta: undefined,
      highlighted: isRoot,
      value: isLeaf ? node.data.value : undefined,
      visited: isRoot,
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
