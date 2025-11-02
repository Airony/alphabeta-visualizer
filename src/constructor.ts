import type { MyEdge, MyNoode } from "./nodes-edges";

export function constructNodesAndEdges(
  depth: number,
  childCount: number,
  leafValues: number[],
) {
  const nodes: MyNoode[] = [
    {
      id: "root",
      data: {},
      type: "custom",
      position: { x: 0, y: 0 },
    },
  ];

  const edges: MyEdge[] = [];
  let currentLeaf = 0;
  for (let i = 1; i < depth; i++) {
    const numberOfNodesAtPrevDepth = Math.pow(childCount, i - 1);
    // Loop through each parent Node
    const parentsStart = nodes.length - numberOfNodesAtPrevDepth;

    for (let k = 0; k < numberOfNodesAtPrevDepth; k++) {
      const parentNode = nodes[parentsStart + k];
      for (let j = 0; j < childCount; j++) {
        const id: string =
          i.toString() + (k * numberOfNodesAtPrevDepth + j).toString();
        const node: MyNoode = {
          id,
          position: { x: 0, y: 0 },
          type: "custom",
          data: {},
        };

        if (i === depth - 1 && currentLeaf < leafValues.length) {
          node.data = { value: leafValues[currentLeaf++] };
        }
        const edge: MyEdge = {
          id: parentNode.id + id,
          source: parentNode.id,
          target: id,
          data: {},
          type: "custom",
        };
        edges.push(edge);
        nodes.push(node);
      }
    }
  }

  return {
    edges,
    nodes,
  };
}
