import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { SortableTree } from "../components/SortableTree";      // the new tree
import {
  getTasksByDeskId,
  saveTask,
  pruneEmptyTasks
} from "../utils/idb";
import { v4 as uuid } from "uuid";

/* helpers to convert between DB flat list and tree component ---- */
const makeTree = (flat) => {
  const byId = Object.fromEntries(flat.map((t) => [t.id, { ...t, children: [] }]));
  const root = [];
  flat.forEach((t) => {
    if (t.parent_id) byId[t.parent_id]?.children.push(byId[t.id]);
    else root.push(byId[t.id]);
  });
  return root;
};
const flattenTree = (nodes, parentId = null, depth = 0, list = []) => {
  nodes.forEach((n, i) => {
    list.push({
      ...n,
      parent_id: parentId,
      position: i,
      depth,                             // not saved – just helper
      children: undefined                // strip children for DB
    });
    flattenTree(n.children ?? [], n.id, depth + 1, list);
  });
  return list;
};
// ---------------------------------------------------------------

export default function TaskPage() {
  const { id: deskId } = useParams();
  const [tree, setTree] = useState([]);

  /* load + prune ---------------------------------------------- */
  useEffect(() => {
    (async () => {
      await pruneEmptyTasks(deskId);
      const tasks = await getTasksByDeskId(deskId, true /* include archive toggle in tree if you want */);
      setTree(makeTree(tasks));
    })();
  }, [deskId]);

  /* persist any tree mutation --------------------------------- */
  const persist = useCallback(
    (newTree) => {
      setTree(newTree);
      // flatten + write every task (very small, happens on drop / text change)
      flattenTree(newTree).forEach(saveTask);
    },
    [deskId]
  );

  /* add at root level (Enter in footer) ------------------------ */
  const addRootTask = (name) => {
    const t = {
      id: uuid(),
      desk_id: deskId,
      name,
      done: false,
      archived: false,
      parent_id: null,
      position: tree.length
    };
    persist([...tree, { ...t, children: [] }]);
  };

  return (
    <>
      <SortableTree
        items={tree}
        setItems={persist}
        indentationWidth={20}
        collapsible
        indicator
        removable
      />

      {/* quick-add input */}
      <input
        placeholder="Add task…"
        className="mt-4 w-full border rounded px-3 py-2"
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.currentTarget.value.trim()) {
            addRootTask(e.currentTarget.value.trim());
            e.currentTarget.value = "";
          }
        }}
      />
    </>
  );
}
