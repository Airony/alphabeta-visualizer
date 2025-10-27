export type MyNode = {
  value: number | null;
  children: MyNode[];
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

  // If the current child is not set, then its the first time we are visting this node,
  // just highlight it and do nothing in this case
  if (currentState.opType === "bubbleUp") {
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
    // Update parent value and then move on to the next child
    parentState.node.value = newParentValue;
    stack.push({
      node: parentState.node,
      child: (parentState.child as number) + 1,
      opType: "explore",
    });
    return;
  }

  if (currentState.child === undefined) {
    console.log("Setting child to 0 ");
    stack.push({ ...currentState, child: 0 });
    return;
  }
  // If the node has no more children to handle, then the next task is to bubble up its value to the parent
  if (currentState.node.children.length <= currentState.child) {
    console.log("No more children");
    stack.push({ node: currentState.node, opType: "bubbleUp" });
    return;
  }

  // otherwise, push it down
  stack.push(currentState);
  const nextState: State = {
    node: currentState.node.children[currentState.child],
    child: undefined,
    opType: "explore",
  };
  console.log("adding new state ", nextState);
  stack.push(nextState);
}
