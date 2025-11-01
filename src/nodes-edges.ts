import type { Edge, Node } from "@xyflow/react";
import NodeComp from "./components/NodeComp/NodeComp";
import { CustomEdge } from "./components/CustomEdge";

export interface NodeData extends Record<string, unknown> {
  value?: number;
  visited?: boolean;
  highlighted?: boolean;
  alpha?: number;
  beta?: number;
}

export interface EdgeData extends Record<string, unknown> {
  deleted?: boolean;
}

export const nodeTypes = { custom: NodeComp };

export const edgeTypes = { custom: CustomEdge };

export type MyNoode = Node<NodeData, keyof typeof nodeTypes>;
export type MyEdge = Edge<EdgeData, keyof typeof edgeTypes>;

export const initialNodes: MyNoode[] = [
  {
    id: "root",
    data: { highlighted: true, visited: true },
    position: { x: 0, y: 0 },
    type: "custom",
  },

  {
    id: "n1",
    data: {},
    position: { x: 0, y: 100 },
    type: "custom",
  },
  {
    id: "n2",
    data: {},
    position: { x: 200, y: 100 },
    type: "custom",
  },

  {
    id: "n1a",
    data: {},
    position: { x: -50, y: 200 },
    type: "custom",
  },
  {
    id: "n1b",
    data: {},
    position: { x: 50, y: 200 },
    type: "custom",
  },

  {
    id: "n1a1",
    data: { value: 3 },
    position: { x: -70, y: 300 },
    type: "custom",
  },
  {
    id: "n1a2",
    data: { value: 17 },
    position: { x: -30, y: 300 },
    type: "custom",
  },
  {
    id: "n1b1",
    data: { value: 2 },
    position: { x: 30, y: 300 },
    type: "custom",
  },
  {
    id: "n1b2",
    data: { value: 4 },
    position: { x: 70, y: 300 },
    type: "custom",
  },

  {
    id: "n2a",
    data: {},
    position: { x: 150, y: 200 },
    type: "custom",
  },
  {
    id: "n2b",
    data: {},
    position: { x: 250, y: 200 },
    type: "custom",
  },

  {
    id: "n2a1",
    data: { value: 15 },
    position: { x: 130, y: 300 },
    type: "custom",
  },
  {
    id: "n2a2",
    data: { value: 24 },
    position: { x: 170, y: 300 },
    type: "custom",
  },
  {
    id: "n2b1",
    data: { value: 3 },
    position: { x: 230, y: 300 },
    type: "custom",
  },
  {
    id: "n2b2",
    data: { value: 8 },
    position: { x: 270, y: 300 },
    type: "custom",
  },
];

export const initialEdges: Edge[] = [
  { id: "eroot_n1", source: "root", target: "n1", type: "custom", data: {} },
  { id: "eroot_n2", source: "root", target: "n2", type: "custom", data: {} },

  { id: "n1_n1a", source: "n1", target: "n1a", type: "custom", data: {} },
  { id: "n1_n1b", source: "n1", target: "n1b", type: "custom", data: {} },

  { id: "n1a_n1a1", source: "n1a", target: "n1a1", type: "custom", data: {} },
  { id: "n1a_n1a2", source: "n1a", target: "n1a2", type: "custom", data: {} },
  { id: "n1b_n1b1", source: "n1b", target: "n1b1", type: "custom", data: {} },
  { id: "n1b_n1b2", source: "n1b", target: "n1b2", type: "custom", data: {} },

  { id: "n2_n2a", source: "n2", target: "n2a", type: "custom", data: {} },
  { id: "n2_n2b", source: "n2", target: "n2b", type: "custom", data: {} },

  { id: "n2a_n2a1", source: "n2a", target: "n2a1", type: "custom", data: {} },
  { id: "n2a_n2a2", source: "n2a", target: "n2a2", type: "custom", data: {} },
  { id: "n2b_n2b1", source: "n2b", target: "n2b1", type: "custom", data: {} },
  { id: "n2b_n2b2", source: "n2b", target: "n2b2", type: "custom", data: {} },
];
