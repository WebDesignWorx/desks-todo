# Desks Todo

A local‑first, keyboard‑driven to‑do app that combines **infinite outline structure** with a fast “Next‑action” workflow.  
No server, no sign‑up — everything lives in your browser (IndexedDB) until you decide to sync.

## Why another task app?

Most list apps give you either:

* Flat lists (quick but messy), **or**
* Fixed‑depth projects (structured but slow).

**Desks Todo** lets you start quick and stay organised:

* **Enter** to keep capturing
* **Tab** to nest ideas when they grow
* Drag (or Shift+Drag) to reorder *and* indent/out‑dent
* Separate **Desks** so work ≠ private ≠ side‑hustle

---

## Key Features (Current)

| Category | What you get |
|----------|--------------|
| **Multi‑Desk workspace** | Unlimited projects (“Desks”) with instant switching. |
| **Infinite hierarchy** | Tasks can nest to any depth; visual indents show structure. |
| **Zero‑latency capture** | *Enter* = sibling, *Tab* = child. Bottom **Add task…** box for continuous entry. |
| **Inline editing** | Every item is always editable — no mode switching. |
| **Drag‑and‑Drop** | Reorder siblings; drag a little right/left to nest or un‑nest. |
| **Offline & private** | Data stored in **IndexedDB**; reload or go offline and nothing is lost. |
| **One‑click setup** | Vite + React, Tailwind — `npm install` then `npm run dev`. |

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Enter` | Add sibling below |
| `Tab` | Add child (nest) |
| `↑ / ↓` | Native cursor movement (keeps editing inline) |
| Drag (handle ☰) | Reorder; drag horizontally to change depth |

*(More shortcuts coming soon.)*

---

## Road‑map / Upcoming

* Collapse / expand branches
* Trash / archive list
* Task details: priority, due‑date, reminders
* Markdown formatting inside items
* PWA install & encrypted cloud sync

---

## Getting Started

```bash
git clone git@github.com:WebDesignWorx/desks-todo.git
cd desks-todo/mytodo-react
npm install
npm run dev      # open http://localhost:5173
