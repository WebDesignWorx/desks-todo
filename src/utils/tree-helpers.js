/* straight-copy of aliYous/dnd-kit-tree-base logic (ESM, no TS) */

export const sortByPosition = (a, b) => a.position - b.position;

/* returns nested tree from flat [{id,parent_id,…}] */
export function buildTree(flat) {
  const map = new Map();
  flat.forEach((n) => map.set(n.id, { ...n, children: [] }));
  const roots = [];
  map.forEach((n) => {
    if (n.parent_id) map.get(n.parent_id)?.children.push(n);
    else roots.push(n);
  });
  return roots.sort(sortByPosition);
}

export function flatten(tree, depth = 0, parent = null, lines = [], acc = []) {
  tree.sort(sortByPosition).forEach((n, i) => {
    const hasChildren = !!(n.children && n.children.length);
    lines.push(i < tree.length - 1);
    acc.push({
      ...n,
      depth,
      lines: [...lines],
      parentId: parent,
      hasChildren,
    });
    if (hasChildren && !n.collapsed) flatten(n.children, depth + 1, n.id, lines, acc);
    lines.pop();
  });
  return acc;
}

export function removeNode(tree, id) {
  const out = [];
  let removed;
  for (const n of tree) {
    if (n.id === id) removed = n;
    else {
      if (n.children) {
        const r = removeNode(n.children, id);
        removed ??= r.removed;
        n.children = r.tree;
      }
      out.push(n);
    }
  }
  return { removed, tree: out };
}

export function insertNode(tree, parentId, node, index) {
  if (!parentId) {
    const copy = [...tree];
    copy.splice(index, 0, node);
    return copy;
  }
  return tree.map((n) => {
    if (n.id === parentId) {
      const kids = n.children ? [...n.children] : [];
      kids.splice(index, 0, node);
      return { ...n, children: kids };
    }
    if (n.children) {
      return { ...n, children: insertNode(n.children, parentId, node, index) };
    }
    return n;
  });
}

export function getProjection(flat, activeId, overId, offset, indent = 20) {
  const active = flat.find((n) => n.id === activeId);
  const over = flat.find((n) => n.id === overId);
  if (!active || !over) return null;

  let depth = over.depth;
  if (offset > indent) depth = over.depth + 1;
  if (offset < -indent && over.parentId != null) depth = over.depth - 1;
  depth = Math.max(0, depth);

  let parentId = null;
  if (depth === over.depth) parentId = over.parentId;
  else if (depth < over.depth) {
    let p = over;
    while (p && p.depth !== depth - 1) p = flat.find((n) => n.id === p.parentId);
    parentId = p ? p.id : null;
  } else parentId = over.id;

  return { depth, parentId };
}
