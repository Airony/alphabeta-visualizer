import type { Edge, Node } from "@xyflow/react";

export const initialNodes: Node[] = [
  {
    id: "1",
    data: { label: "input" },
    position: { x: 0, y: 0 },
    type: "custom",
  },
  {
    id: "2",
    data: { label: "node 2" },
    position: { x: 0, y: 100 },
    type: "custom",
  },
  {
    id: "2a",
    data: { label: "node 2a" },
    position: { x: 0, y: 200 },
    type: "custom",
  },
  {
    id: "2b",
    data: { label: "node 2b" },
    position: { x: 0, y: 300 },
    type: "custom",
  },
  {
    id: "2c",
    data: { label: "node 2c" },
    position: { x: 0, y: 400 },
    type: "custom",
  },
  {
    id: "2d",
    data: { label: "node 2d" },
    position: { x: 0, y: 500 },
    type: "custom",
  },
  {
    id: "3",
    data: { label: "node 3" },
    position: { x: 200, y: 100 },
    type: "custom",
  },
];

export const initialEdges: Edge[] = [
  { id: "e12", source: "1", target: "2" },
  { id: "e13", source: "1", target: "3" },
  { id: "e22a", source: "2", target: "2a" },
  { id: "e22b", source: "2", target: "2b" },
  { id: "e22c", source: "2", target: "2c" },
  { id: "e2c2d", source: "2c", target: "2d" },
];
