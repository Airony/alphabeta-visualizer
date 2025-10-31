export type MyNode = {
  value: number | null;
  alpha?: number;
  beta?: number;
  children: MyNode[];
  highlighted?: boolean;
  prunned?: boolean;
  visited?: boolean;
};

type OperationType = "bubbleUp" | "explore";

export type State = {
  node: MyNode;
  child?: number;
  callBack?: (val: number) => void;
  opType: OperationType;
};

export function execute(stack: State[]) {
  const currentState = stack.pop();
  if (!currentState) {
    console.log("Operation Finished!");
    return;
  }

  currentState.node.highlighted = false;

  // If the node has no more children to handle, then the next task is to bubble up its value to the parent
  if (currentState.node.children.length <= (currentState.child || 0)) {
    const parentState = stack.pop();
    if (!parentState) {
      //We have finished our execution at this point.
      return;
    }
    const parentValue = parentState.node.value;
    let newParentValue = parentValue;

    if (
      !parentValue ||
      parentValue <= -1 * (currentState.node.value as number)
    ) {
      newParentValue = -1 * (currentState.node.value as number);
    }

    parentState.node.alpha =
      parentState.node.alpha !== undefined
        ? Math.max(parentState.node.alpha, newParentValue as number)
        : (newParentValue as number);
    console.log("Bubble up value!");
    parentState.node.highlighted = true;
    // Update parent value and then move on to the next child
    parentState.node.value = newParentValue;
    stack.push({
      node: parentState.node,
      child: (parentState.child as number) + 1,
      opType: "explore",
    });
    return;
  }

  // otherwise, push it down
  stack.push(currentState);

  const parentAlpha = currentState.node.alpha;
  const parentBeta = currentState.node.beta;
  const nextExploredChild =
    currentState.node.children[currentState.child as number];
  if (parentAlpha && parentBeta && parentAlpha >= parentBeta) {
    nextExploredChild.prunned = true;
    //prune the next child nodes
    //basically lets just skip all nodes
    currentState.child = currentState.node.children.length;
    currentState.node.highlighted = true;
    return;
  }

  nextExploredChild.alpha =
    parentBeta !== undefined ? -1 * parentBeta : undefined;
  nextExploredChild.beta =
    parentAlpha !== undefined ? -1 * parentAlpha : undefined;

  const nextState: State = {
    node: currentState.node.children[currentState.child as number],
    child: 0,
    opType: "explore",
  };

  nextState.node.highlighted = true;
  nextState.node.visited = true;
  stack.push(nextState);
}
