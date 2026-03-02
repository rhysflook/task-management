import interact from "interactjs";
import {store } from "../../../stores/store";
import { patientApi, stagePatient } from "../../../services/patient";
const GRID = 20;
const snap = (v) => Math.round(v / GRID) * GRID;

function hitTestStaging(ghostRect) {
  const el = document.getElementById("staging-area");
  if (!el) return false;

  const r = el.getBoundingClientRect();
  return (
    ghostRect.left < r.right &&
    ghostRect.right > r.left &&
    ghostRect.top < r.bottom &&
    ghostRect.bottom > r.top
  );
}

function setBedDragRules(
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
  itemType = "bed",
  bedMutator = null
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
      if (it.type !== "bed") continue;
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

      // --- If a bed is dragged, check containment and possibly resize the room ---
     // --- If a bed is dragged, snap into empty space; only expand if no slot fits ---
    if (itemType === "bed") {
      const bed = { x: fx, y: fy, w: sizeRef.current.w, h: sizeRef.current.h };

      const state = store.getState();
      const floorData = state.unitMaps.floors.find((f) => f.id == floor);
      const items = floorData?.items ?? [];

      const rooms = items.filter((it) => it.type === "room");
      const beds  = items.filter((it) => it.type === "bed" && it.id !== id);

      const rectsIntersect = (a, b) =>
        a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

      const containsRect = (outer, inner) =>
        inner.x >= outer.x &&
        inner.y >= outer.y &&
        inner.x + inner.w <= outer.x + outer.w &&
        inner.y + inner.h <= outer.y + outer.h;

      const snap = (v) => (snapEnabled ? Math.max(GRID, Math.round(v / GRID) * GRID) : Math.round(v));

      // find room that the bed's center is in
      const cx = bed.x + bed.w / 2;
      const cy = bed.y + bed.h / 2;
      const room =
        rooms.find(r => cx >= (r.x ?? 0) &&
                        cx <= (r.x ?? 0) + (r.w ?? GRID) &&
                        cy >= (r.y ?? 0) &&
                        cy <= (r.y ?? 0) + (r.h ?? GRID)) ||
        // fallback: any intersecting room
        rooms.find(r => rectsIntersect(bed, { x: r.x ?? 0, y: r.y ?? 0, w: r.w ?? GRID, h: r.h ?? GRID }));

      if (room) {
        const roomRect = { x: room.x ?? 0, y: room.y ?? 0, w: room.w ?? GRID, h: room.h ?? GRID };

        // 1) Try to place the bed inside room without overlap
        const obstacles = beds.map(b => ({ x: b.x ?? 0, y: b.y ?? 0, w: b.w ?? GRID, h: b.h ?? GRID }));

        const findSnapSlot = () => {
          let best = null;
          // grid scan within room
          const maxX = roomRect.x + roomRect.w - bed.w;
          const maxY = roomRect.y + roomRect.h - bed.h;

          for (let y = snap(roomRect.y); y <= maxY; y += GRID) {
            for (let x = snap(roomRect.x); x <= maxX; x += GRID) {
              const candidate = { x, y, w: bed.w, h: bed.h };
              if (!containsRect(roomRect, candidate)) continue;

              let blocked = false;
              for (const ob of obstacles) {
                if (rectsIntersect(candidate, ob)) { blocked = true; break; }
              }
              if (blocked) continue;

              // distance to user drop point → prefer closest slot
              const dx = (x - bed.x);
              const dy = (y - bed.y);
              const dist = dx*dx + dy*dy;

              if (!best || dist < best.dist) best = { x, y, dist };
            }
          }
          return best;
        };

        const slot = findSnapSlot();
        if (slot) {
          // ✅ Snap bed to free slot; do NOT expand the room
          const sx = snap(slot.x);
          const sy = snap(slot.y);
          dispatch(setPos({ id, floor, x: sx, y: sy }));
          // size stays same
        } else {
          // 2) No slot fits → expand room in direction with fewest room collisions
          // compute needed expansion deltas
          const needLeft   = Math.max(0, roomRect.x - bed.x);
          const needTop    = Math.max(0, roomRect.y - bed.y);
          const needRight  = Math.max(0, (bed.x + bed.w) - (roomRect.x + roomRect.w));
          const needBottom = Math.max(0, (bed.y + bed.h) - (roomRect.y + roomRect.h));

          // candidate expansions
          const candidates = [];
          if (needLeft)   candidates.push({ dir: 'left',   dx: needLeft,   dy: 0 });
          if (needTop)    candidates.push({ dir: 'top',    dx: 0,          dy: needTop });
          if (needRight)  candidates.push({ dir: 'right',  dx: needRight,  dy: 0 });
          if (needBottom) candidates.push({ dir: 'bottom', dx: 0,          dy: needBottom });

          const otherRooms = rooms.filter(r => r.id !== room.id).map(r => ({
            x: r.x ?? 0, y: r.y ?? 0, w: r.w ?? GRID, h: r.h ?? GRID,
          }));

          const scoreExpansion = (cand) => {
            let newRoom = { ...roomRect };
            if (cand.dir === 'left')  { newRoom.x -= cand.dx; newRoom.w += cand.dx; }
            if (cand.dir === 'top')   { newRoom.y -= cand.dy; newRoom.h += cand.dy; }
            if (cand.dir === 'right') { newRoom.w += cand.dx; }
            if (cand.dir === 'bottom'){ newRoom.h += cand.dy; }

            // count overlaps with other rooms (lower is better)
            let overlaps = 0;
            for (const r of otherRooms) if (rectsIntersect(newRoom, r)) overlaps++;
            return { ...cand, overlaps, newRoom };
          };

          let choice = null;
          for (const cand of candidates) {
            const scored = scoreExpansion(cand);
            if (!choice || scored.overlaps < choice.overlaps) choice = scored;
          }

          if (choice) {
            // snap new geometry
            const nr = choice.newRoom;
            const nx = snap(nr.x), ny = snap(nr.y), nw = snap(nr.w), nh = snap(nr.h);

            dispatch(setPos({ id: room.id, floor, x: nx, y: ny }));
            dispatch(setSize({ id: room.id, floor, w: nw, h: nh }));

            // shift bed minimally into the expanded room near drop
            let bx = snap(Math.min(Math.max(bed.x, nx), nx + nw - bed.w));
            let by = snap(Math.min(Math.max(bed.y, ny), ny + nh - bed.h));

            // avoid overlapping other beds if possible (1-step nudge on grid)
            const tryNudges = [
              [0,0],[GRID,0],[-GRID,0],[0,GRID],[0,-GRID],
              [GRID,GRID],[GRID,-GRID],[-GRID,GRID],[-GRID,-GRID],
            ];
            const fits = (x,y) => {
              const c = { x, y, w: bed.w, h: bed.h };
              if (!containsRect({ x:nx, y:ny, w:nw, h:nh }, c)) return false;
              for (const ob of obstacles) if (rectsIntersect(c, ob)) return false;
              return true;
            };
            let placed = false;
            for (const [dxN, dyN] of tryNudges) {
              const tx = snap(bx + dxN);
              const ty = snap(by + dyN);
              if (fits(tx, ty)) { bx = tx; by = ty; placed = true; break; }
            }
            if (!placed) {
              // fallback: clamp only
              bx = snap(Math.min(Math.max(bx, nx), nx + nw - bed.w));
              by = snap(Math.min(Math.max(by, ny), ny + nh - bed.h));
            }

            dispatch(setPos({ id, floor, x: bx, y: by }));
          }
        }
      }
    }


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

function isInsideRoom(patientEl, bedEls) {
  const patientRect = patientEl.getBoundingClientRect();
  for (const bedEl of bedEls) {
    
    const bedRect = bedEl.getBoundingClientRect();
    const overlap =
      patientRect.left < bedRect.right &&
      patientRect.right > bedRect.left &&
      patientRect.top < bedRect.bottom &&
      patientRect.bottom > bedRect.top;
    if (overlap) return bedEl.dataset.id; // return bed ID if collision
  }
  return null;
}

function setBedTransferRules(el, items, bed_id, dispatch, id, floor, getRooms, bedMutator) {
  let ghost = null;          // the floating clone
  let startRect = null;      // original rect at drag start
  let dx = 0, dy = 0;

  const interactable = interact(el).draggable({
    listeners: {
      start() {
        // snapshot rect & create floating clone
        startRect = el.getBoundingClientRect();

        ghost = el.cloneNode(true);
        ghost.classList.add("drag-ghost");

        Object.assign(ghost.style, {
          position: "fixed",
          left: `${startRect.left}px`,
          top: `${startRect.top}px`,
          width: `${startRect.width}px`,
          height: `${startRect.height}px`,
          transform: "translate(0,0)",
          zIndex: "99999",
          pointerEvents: "none",
          margin: "0",
          boxSizing: "border-box",
          // subtle lift
          boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
          borderRadius: getComputedStyle(el).borderRadius || "8px",
          transition: "none",
        });

        document.body.appendChild(ghost);

        // keep original in the flow so layout doesn't collapse
        el.style.visibility = "hidden";
        dx = 0; dy = 0;
      },

      move(event) {
        dx += event.dx;
        dy += event.dy;
        if (ghost) {
          ghost.style.transform = `translate(${dx}px, ${dy}px)`;
        }
      },

      end() {
        if (!ghost) return;

        const ghostRect = getRect(ghost);
        const droppedInStaging = hitTestStaging(ghostRect);

       
        el.style.visibility = "";
        dx = 0;
        dy = 0;

        if (droppedInStaging) {
          dispatch({
            type: "unitMaps/stagePatient",
            payload: { patientId: id, fromBedId: bed_id, floor },
          });

          dispatch(patientApi.endpoints.stagePatient.initiate({ patientId: id }));
          ghost.remove();
          ghost = null;
          return;
        }
         // decide move
        const rooms = store
          .getState()
          .unitMaps.floors.find(f => f.id == floor)
          ?.rooms || [];

        const beds = []

        rooms.forEach(element => {
          element.beds?.forEach(bed => {
            beds.push(bed);
          });
        });
        // hit-test using the clone's rect
        // const ghostRect = getRect(ghost);
        const targetBedId = hitTestRooms(ghostRect, beds.map(b => {
          const bedEl = document.querySelector(`.bed[data-id="${b.id}"]`);
          return bedEl;
        }));

        // remove clone, reveal original (layout stays intact)
        ghost.remove();
        ghost = null;
        el.style.visibility = "";

        // reset counters
        dx = 0; dy = 0;

        const targetBed = beds.find(r => r.id == targetBedId);
        const targetOccupied = !!targetBed?.patient;
        if (targetBedId && targetBedId !== bed_id && !targetOccupied) {
          dispatch({
            type: "unitMaps/movePatientToRoom",
            payload: { patientId: id, targetBedId, floor },
          });
          bedMutator({ patientId: id, bedId: targetBedId });
        }
        // else: invalid drop → do nothing; original is already back where it was
      },
    },
    inertia: false,
  });

  return interactable;
}

// read DOMRect (including current transform)
function getRect(node) {
  const r = node.getBoundingClientRect();
  return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
}

// test overlap between ghost and bed elements
function hitTestRooms(ghostRect, bedEls) {
  for (const bed of bedEls) {
    const r = bed.getBoundingClientRect();
    const overlap =
      ghostRect.left + 70 < r.right &&
      ghostRect.right - 70 > r.left &&
      ghostRect.top + 50 < r.bottom &&
      ghostRect.bottom -50  > r.top;

    if (overlap) return bed.dataset.id;
  }
  return null;
}

function setStagingTransferRules(
  el,
  dispatch,
  patientId,
  floor,
) {
   let ghost = null;
  let startRect = null;
  let dx = 0;
  let dy = 0;

  interact(el).draggable({
    listeners: {
      start() {
        startRect = el.getBoundingClientRect();

        ghost = el.cloneNode(true);
        ghost.classList.add("drag-ghost");

        Object.assign(ghost.style, {
          position: "fixed",
          left: `${startRect.left}px`,
          top: `${startRect.top}px`,
          width: `140px`,
          height: `100px`,
          transform: "translate(0,0)",
          zIndex: "99999",
          pointerEvents: "none",

          margin: "0",
          boxSizing: "border-box",
          boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
        });

        document.body.appendChild(ghost);

        el.style.visibility = "hidden";

        dx = 0;
        dy = 0;
      },

      move(event) {
        dx += event.dx;
        dy += event.dy;

        if (ghost) {
          ghost.style.transform = `translate(${dx}px, ${dy}px)`;
        }
      },

      end() {
        if (!ghost) return;

        const ghostRect = ghost.getBoundingClientRect();

        ghost.remove();
        ghost = null;
        el.style.visibility = "";

        dx = 0;
        dy = 0;

        // decide drop target (beds, rooms, etc)
        const targetBedId = hitTestRooms(
          ghostRect,
          document.querySelectorAll(".bed")
        );

        if (targetBedId) {
          dispatch({
            type: "unitMaps/unstagePatientToBed",
            payload: { patientId, targetBedId, floor },
          });

          dispatch(
            patientApi.endpoints.unstagePatient.initiate({ patientId, bedId: targetBedId })
          )
        }
      },
    },
    inertia: false,
  });
}


export { setBedDragRules, setBedTransferRules, setStagingTransferRules };