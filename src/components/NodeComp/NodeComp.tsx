import { Handle, Position } from "@xyflow/react";
import "./nodecomp.css";
import type { MyNoode } from "../../nodes-edges";

interface NodeCompProps {
  data: MyNoode["data"];
}

export default function NodeComp({ data }: NodeCompProps) {
  return (
    <div
      className="node-comp"
      style={{
        borderColor: data.highlighted ? "blue" : undefined,
      }}
    >
      {data.value || ""}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
