export type Node = {
  task: any;          // original task object
  children: Node[];
};

export const buildTree = (flat: any[]): Node[] => {
  const idMap: Record<string, Node> = {};
  flat.forEach((t) => (idMap[t.id] = { task: t, children: [] }));

  const root: Node[] = [];
  flat.forEach((t) => {
    if (t.parent_id) idMap[t.parent_id]?.children.push(idMap[t.id]);
    else root.push(idMap[t.id]);
  });
  return root;
};

export const flattenTree = (
  nodes: Node[] | Node,
  collapsed: Set<string>,
  keepTask = false,
  depth = 0,
) => {
  const arr: any[] = [];
  (Array.isArray(nodes) ? nodes : [nodes]).forEach((n) => {
    arr.push(keepTask ? { ...n.task } : { task: n.task, depth });
    if (!collapsed.has(n.task.id) && n.children.length) {
      arr.push(...flattenTree(n.children, collapsed, keepTask, depth + 1));
    }
  });
  return arr;
};

export const moveBranch = (tree: Node[], dragId: string, dropId: string) => {
  // remove drag node & capture it
  let dragNode: Node | null = null;
  const remove = (list: Node[]) => {
    const idx = list.findIndex((n) => n.task.id === dragId);
    if (idx > -1) dragNode = list.splice(idx, 1)[0];
    else list.forEach((n) => remove(n.children));
  };
  remove(tree);

  if (!dragNode) return tree;

  // insert before dropId sibling
  const insert = (list: Node[]) => {
    const idx = list.findIndex((n) => n.task.id === dropId);
    if (idx > -1) list.splice(idx, 0, dragNode!);
    else list.forEach((n) => insert(n.children));
  };
  insert(tree);
  dragNode.task.parent_id = findParentId(tree, dropId);
  renumber(tree);
  return tree;
};

const findParentId = (list: Node[], childId: string, parent: Node | null = null): string | null => {
  for (const n of list) {
    if (n.task.id === childId) return parent ? parent.task.id : null;
    const found = findParentId(n.children, childId, n);
    if (found !== undefined) return found;
  }
  return null;
};

const renumber = (list: Node[], pos = 0) =>
  list.sort((a, b) => a.task.position - b.task.position).forEach((n, i) => {
    n.task.position = pos + i;
    renumber(n.children, 0);
  });

