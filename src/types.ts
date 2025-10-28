export type MyNode = {
  value: number | null;
  children: MyNode[];
  highlighted?: boolean;
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
    console.log("No more children");
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
    console.log("Bubble up value!");
    parentState.node.highlighted = true;
    // Update parent value and then move on to the next child
    parentState.node.value = newParentValue;
    console.log(parentState.node);
    stack.push({
      node: parentState.node,
      child: (parentState.child as number) + 1,
      opType: "explore",
    });
    return;
  }

  // otherwise, push it down
  stack.push(currentState);
  const nextState: State = {
    node: currentState.node.children[currentState.child as number],
    child: 0,
    opType: "explore",
  };

  nextState.node.highlighted = true;
  stack.push(nextState);
}
