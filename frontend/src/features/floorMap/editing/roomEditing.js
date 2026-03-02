import interact from "interactjs";
import {store } from "../../stores/store";
const GRID = 20;
const snap = (v) => Math.round(v / GRID) * GRID;
function setDragRulesBuildMode(
  el,
  dragStartRef,
  resizeStartRef,
  posRef,
  accRef,
  sizeRef,
  dispatch,
  id,
  floor,
  snapEnabled,
  setPos,
  setSize,
  allItems = [],
  itemType = "bed"
) {
  const parentEl = el.parentElement;
  const snapTo = (v) => Math.max(GRID, Math.round(v / GRID) * GRID);
  const clampToParent = (x, y, w, h) => {
    const pw = parentEl.clientWidth;
    const ph = parentEl.clientHeight;
    const nx = Math.min(Math.max(0, x), Math.max(0, pw - w));
    const ny = Math.min(Math.max(0, y), Math.max(0, ph - h));
    return { x: nx, y: ny };
  };

  // helpers for smooth preview
  const setPreview = (node, dx, dy) => {
    node.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    node.style.willChange = "transform";
  };
  const clearPreview = (node) => {
    node.style.transform = "";
    node.style.willChange = "";
  };

  // --- robust child detection: bed CENTER inside room rect ---
  const snapshotChildren = (bx, by, bw, bh) => {
    const kids = [];
    // get fresh items for the floor (safe if props were stale)
    const items = store
      .getState()
      .unitMaps.floors.find((f) => f.id == floor)?.items ?? [];

    for (const it of items) {
      const rx = it.x ?? 0;
      const ry = it.y ?? 0;
      const rw = it.w ?? GRID;
      const rh = it.h ?? GRID;

      const cx = rx + rw / 2;
      const cy = ry + rh / 2;

      const centerInside =
        cx >= bx && cx <= bx + bw && cy >= by && cy <= by + bh;

      if (centerInside) {
        // cache node ref for preview transforms (data-id is on beds only)
        const node =
          parentEl.querySelector(`.bed[data-id="${it.id}"]`) ||
          document.querySelector(`.bed[data-id="${it.id}"]`);
        kids.push({ id: it.id, sx: rx, sy: ry, w: rw, h: rh, node });
      }
    }
    return kids;
  };

  const interactable = interact(el)
    // ---------------- Drag ----------------
    // ---------------- Drag ----------------
.draggable({
  listeners: {
    start() {
      dragStartRef.current = {
        x: posRef.current.x,
        y: posRef.current.y,
        children: null,
      };
      accRef.current.dx = 0;
      accRef.current.dy = 0;

      if (itemType === "room") {
        const bx = posRef.current.x;
        const by = posRef.current.y;
        const bw = sizeRef.current.w;
        const bh = sizeRef.current.h;
        dragStartRef.current.children = snapshotChildren(bx, by, bw, bh);
      }

      el.style.transition = "none";
      const kids = dragStartRef.current.children;
      if (kids) kids.forEach((k) => k?.node && (k.node.style.transition = "none"));
    },

    move(event) {
      accRef.current.dx += event.dx;
      accRef.current.dy += event.dy;

      let nx = dragStartRef.current.x + accRef.current.dx;
      let ny = dragStartRef.current.y + accRef.current.dy;

      if (snapEnabled) {
        nx = snap(nx);
        ny = snap(ny);
      } else {
        nx = Math.round(nx);
        ny = Math.round(ny);
      }

      const { x: cx, y: cy } = clampToParent(
        nx,
        ny,
        sizeRef.current.w,
        sizeRef.current.h
      );

      const dxApplied = cx - dragStartRef.current.x;
      const dyApplied = cy - dragStartRef.current.y;

      setPreview(el, dxApplied, dyApplied);

      // preview transform for child beds (if room)
      const kids = dragStartRef.current.children;
      if (itemType === "room" && kids && kids.length) {
        for (const kid of kids) {
          if (!kid.node) continue;
          setPreview(kid.node, dxApplied, dyApplied);
        }
      }
    },

    end() {
      let nx = dragStartRef.current.x + (accRef.current.dx || 0);
      let ny = dragStartRef.current.y + (accRef.current.dy || 0);

      if (snapEnabled) {
        nx = snap(nx);
        ny = snap(ny);
      } else {
        nx = Math.round(nx);
        ny = Math.round(ny);
      }

      const { x: fx, y: fy } = clampToParent(
        nx,
        ny,
        sizeRef.current.w,
        sizeRef.current.h
      );

      const dxApplied = fx - dragStartRef.current.x;
      const dyApplied = fy - dragStartRef.current.y;

      // --- Base position commit ---
      dispatch(setPos({ id, floor, x: fx, y: fy }));

      // --- Child reposition if moving a room ---
      const kids = dragStartRef.current.children;
      if (itemType === "room" && kids && kids.length) {
        for (const kid of kids) {
          let cx = kid.sx + dxApplied;
          let cy = kid.sy + dyApplied;
          if (snapEnabled) {
            cx = snap(cx);
            cy = snap(cy);
          } else {
            cx = Math.round(cx);
            cy = Math.round(cy);
          }
          dispatch(setPos({ id: kid.id, floor, x: cx, y: cy }));
        }
      }

      // --- If a bed is dragged, check containment and possibly resize the room ---
     // --- If a bed is dragged, snap into empty space; only expand if no slot fits ---

      // --- Cleanup ---
      clearPreview(el);
      el.style.transition = "";
      if (kids) {
        for (const kid of kids) {
          if (!kid.node) continue;
          clearPreview(kid.node);
          kid.node.style.transition = "";
        }
      }

      accRef.current.dx = 0;
      accRef.current.dy = 0;
    },
  },
  modifiers: [
    interact.modifiers.restrictRect({ restriction: parentEl, endOnly: false }),
  ],
})


    // ---------------- Resize (unchanged behavior; commit on end) ----------------
    .resizable({
  edges: { top: true, left: true, bottom: true, right: true },
  listeners: {
    start(event) {
      resizeStartRef.current = {
        x: posRef.current.x,
        y: posRef.current.y,
        w: sizeRef.current.w,
        h: sizeRef.current.h,
        edges: event.edges || {},
      };
      el.style.willChange = "width, height, transform";
      el.style.transition = "none";
    },

    move(event) {
      const { edges, x: sx, y: sy, w: sw, h: sh } = resizeStartRef.current;

      // raw size from interact
      let pw = Math.round(event.rect.width);
      let ph = Math.round(event.rect.height);

      // snap size to grid for preview
      if (snapEnabled) {
        pw = snapTo(pw);
        ph = snapTo(ph);
      }

      // derive preview position when left/top edges move
      let px = sx;
      let py = sy;
      if (edges.left) px = sx + (sw - pw);
      if (edges.top)  py = sy + (sh - ph);

      // clamp inside parent
      const { x: cx, y: cy } = clampToParent(px, py, pw, ph);

      // live preview: width/height + translate
      el.style.width = `${pw}px`;
      el.style.height = `${ph}px`;
      el.style.transform = `translate3d(${cx - sx}px, ${cy - sy}px, 0)`;
    },

    end(event) {
      const { edges, x: sx, y: sy, w: sw, h: sh } = resizeStartRef.current;

      let nw = Math.round(event.rect.width);
      let nh = Math.round(event.rect.height);

      if (snapEnabled) {
        nw = snapTo(nw);
        nh = snapTo(nh);
      }

      let nx = sx;
      let ny = sy;
      if (edges.left) nx = sx + (sw - nw);
      if (edges.top)  ny = sy + (sh - nh);

      const { x: fx, y: fy } = clampToParent(nx, ny, nw, nh);

      // commit once
      dispatch(setPos({ id, floor, x: fx, y: fy }));
      dispatch(setSize({ id, floor, w: nw, h: nh }));

      // cleanup preview styles
      el.style.width = "";
      el.style.height = "";
      el.style.transform = "";
      el.style.willChange = "";
      el.style.transition = "";
    },
  },
  modifiers: [
    // Optional: let Interact also help with snapping at the handle level
    ...(snapEnabled
      ? [interact.modifiers.snapSize({
          targets: [interact.snappers.grid({ x: GRID, y: GRID })],
        })]
      : []),
    interact.modifiers.restrictEdges({ outer: parentEl, endOnly: false }),
    interact.modifiers.restrictSize({ min: { width: GRID, height: GRID } }),
  ],
});

  return interactable;
}

export { setDragRulesBuildMode, setDragRulesMoveMode };