export interface UINodeData {
  value: number;
  left: number;
}

interface NodeCompProps {
  comp: UINodeData;
}

export default function NodeComp({ comp }: NodeCompProps) {
  return (
    <div
      className="node"
      style={{
        left: `${comp.left}px`,
      }}
    >
      {comp.value}
    </div>
  );
}
