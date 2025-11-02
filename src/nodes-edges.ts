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
