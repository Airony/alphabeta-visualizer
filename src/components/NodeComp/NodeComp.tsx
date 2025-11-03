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
      {data.visited && (
        <div className="node-data">
          <p>α: {data.alpha || "-inf"}</p>
          <p>β: {data.beta || "+inf"}</p>
        </div>
      )}
      {data.editMode && data.isLeaf ? (
        <input
          type="number"
          value={
            typeof data.value === "number" && !Number.isNaN(data.value)
              ? data.value
              : ""
          }
          onChange={(e) => {
            const raw = e.target.value;
            const val = raw === "" ? undefined : Number(raw);
            data.onLeafValueChange?.(data.nodeId as string, val);
          }}
          onMouseDown={(e) => e.stopPropagation()}
          style={{ width: "4rem" }}
        />
      ) : (
        <>{data.value ?? ""}</>
      )}
      <Handle type="target" position={Position.Top} />
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
