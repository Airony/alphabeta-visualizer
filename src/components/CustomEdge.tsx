import { BaseEdge, getBezierPath } from "@xyflow/react";
import type { EdgeData } from "../nodes-edges";

interface CustomEdgeProps {
  id: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  data: EdgeData;
}
export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  data,
}: CustomEdgeProps) => {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  });

  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      {data.deleted && (
        <text
          x={midX}
          y={midY}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="red"
          style={{
            fontWeight: "bold",
            fontSize: "24px",
          }}
        >
          ✕
        </text>
      )}
    </>
  );
};
