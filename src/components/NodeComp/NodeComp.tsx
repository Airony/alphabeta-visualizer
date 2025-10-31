import { Handle, Position } from "@xyflow/react";
import "./nodecomp.css";

export interface UINodeData {
  label: string;
  highlighted?: boolean;
}

interface NodeCompProps {
  data: UINodeData;
}

export default function NodeComp({ data }: NodeCompProps) {
  return (
    <div className="node-comp">
      {data.label}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
