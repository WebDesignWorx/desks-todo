// src/utils/tree-utils.js

/**
 * Given a nested tree of items, flatten it into an array
 * of { id, parentId, depth, children }.
 */
export function flattenTree(items, parentId = null, depth = 0) {
  return items.reduce((acc, item, index) => {
    const { id, children = [], ...rest } = item;
    const flattenedItem = {
      id,
      parentId,
      depth,
      index,
      children, // keep original children array for collapse logic
      ...rest
    };
    acc.push(flattenedItem);
    if (children.length) {
      acc.push(...flattenTree(children, id, depth + 1));
    }
    return acc;
  }, []);
}

/**
 * Given a flat list (as from flattenTree), rebuild the nested tree.
 */
export function buildTree(flatItems) {
  const lookup = new Map();
  // create a map of id -> node (without children)
  flatItems.forEach(({ id, parentId, depth, children, index, ...rest }) => {
    lookup.set(id, { id, parentId, depth, children: [], index, ...rest });
  });
  const rootItems = [];
  // link children into parents
  lookup.forEach(node => {
    if (node.parentId === null) {
      rootItems.push(node);
    } else {
      const parent = lookup.get(node.parentId);
      if (parent) parent.children.push(node);
    }
  });
  // optionally sort siblings by their original index
  function sortRecursively(list) {
    list.sort((a, b) => a.index - b.index);
    list.forEach(n => {
      if (n.children.length) sortRecursively(n.children);
    });
  }
  sortRecursively(rootItems);
  return rootItems;
}

/**
 * Given flattened items and a drag position, compute
 * the projected parentId and depth.
 */
export function getProjection(flattened, activeId, overId, offsetX, indentationWidth) {
  const overIndex = flattened.findIndex(it => it.id === overId);
  const activeIndex = flattened.findIndex(it => it.id === activeId);
  if (overIndex === -1 || activeIndex === -1) return null;
  const overItem = flattened[overIndex];
  const prevItem = flattened[overIndex - 1];

  // how many levels in
  const rawDepth = Math.round(offsetX / indentationWidth);
  // clamp between 0 and either prevItem.depth+1 or 0
  const maxDepth = prevItem ? prevItem.depth + 1 : 0;
  const depth = Math.max(0, Math.min(rawDepth, maxDepth));

  let parentId = null;
  if (depth > 0) {
    if (!prevItem) {
      parentId = null;
    } else if (depth === prevItem.depth) {
      parentId = prevItem.parentId;
    } else if (depth > prevItem.depth) {
      parentId = prevItem.id;
    }
  }

  return { depth, parentId };
}

/**
 * Count all descendants of the node with the given id.
 */
export function getChildCount(flattened, id) {
  // assume flattened is in depth-first order
  const startIndex = flattened.findIndex(it => it.id === id);
  if (startIndex === -1) return 0;
  const parentDepth = flattened[startIndex].depth;
  let count = 0;
  for (let i = startIndex + 1; i < flattened.length; i++) {
    if (flattened[i].depth > parentDepth) {
      count++;
    } else {
      break;
    }
  }
  return count;
}

/**
 * Remove a single item and all its descendants from a nested tree.
 */
export function removeItem(items, idToRemove) {
  return items
    .filter(item => item.id !== idToRemove)
    .map(item => ({
      ...item,
      children: removeItem(item.children || [], idToRemove)
    }));
}

/**
 * From a flattened list, drop any items whose parentId is in the given array.
 */
export function removeChildrenOf(flattened, parentIds = []) {
  return flattened.filter(item => !parentIds.includes(item.parentId));
}

/**
 * In a nested tree, set `item[prop] = fn(item[prop])` for the node with matching id.
 */
export function setProperty(items, id, prop, fn) {
  return items.map(item => {
    if (item.id === id) {
      return { 
        ...item, 
        [prop]: fn(item[prop]) 
      };
    }
    if (item.children && item.children.length) {
      return {
        ...item,
        children: setProperty(item.children, id, prop, fn)
      };
    }
    return item;
  });
}
