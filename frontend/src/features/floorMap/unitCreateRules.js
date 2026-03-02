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

  // --- Grid alignment helper ---
  // Used when "snap to grid" is enabled, forcing movement to land on clean
  // grid boundaries so items align nicely with others and keep spacing consistent.
  const snapTo = (v) => Math.max(GRID, Math.round(v / GRID) * GRID);

  // --- Boundary clamp helper ---
  // Prevents the dragged element from being moved outside its container.
  // Without this, the element could be dragged partially or fully offscreen.
  const clampToParent = (x, y, w, h) => {
    const pw = parentEl.clientWidth;
    const ph = parentEl.clientHeight;
    const nx = Math.min(Math.max(0, x), Math.max(0, pw - w));
    const ny = Math.min(Math.max(0, y), Math.max(0, ph - h));
    return { x: nx, y: ny };
  };

  // --- Visual preview helpers ---
  // We use transform-based movement during dragging for two reasons:
  // 1. Transforms are GPU-accelerated (much smoother).
  // 2. We can visually preview position before committing it to global state.
  const setPreview = (node, dx, dy) => {
    node.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
    node.style.willChange = "transform"; // Hint browser to optimize GPU layer.
  };

  // Clears temporary transform when the drag ends or cancels.
  const clearPreview = (node) => {
    node.style.transform = "";
    node.style.willChange = "";
  };

  const interactable = interact(el)
    .draggable({
      listeners: {
        // ------------------- DRAG START -------------------
        start() {
          // Store the element’s original position at the moment the drag starts.
          // We need this as the base reference to compute deltas (movement offsets).
          dragStartRef.current = {
            x: posRef.current.x,
            y: posRef.current.y,
            children: null, // reserved for potential grouped/child drags.
          };

          // Reset accumulated deltas.
          // WHY: interact.js gives us incremental dx/dy in each move event,
          // so we accumulate them into `accRef`. Resetting ensures no leftover
          // deltas from previous drags corrupt the next drag’s starting state.
          accRef.current.dx = 0;
          accRef.current.dy = 0;

          // Disable CSS transitions during drag so movement feels immediate.
          // Without this, inertia from prior transitions would cause delay or lag.
          el.style.transition = "none";
        },

        // ------------------- DRAG MOVE -------------------
        move(event) {
          // Add the small dx/dy from this frame to the running totals.
          // WHY: interact.js reports movement deltas relative to the last event,
          // not the drag start. Accumulating gives the true displacement since start.
          accRef.current.dx += event.dx;
          accRef.current.dy += event.dy;

          // Compute the element’s new tentative position.
          // Start position + total delta = current drag offset.
          let nx = dragStartRef.current.x + accRef.current.dx;
          let ny = dragStartRef.current.y + accRef.current.dy;

          // Apply snapping logic if enabled.
          // WHY: ensures all elements align on a fixed grid, improving precision
          // and making layout editing predictable.
          if (snapEnabled) {
            nx = snapTo(nx);
            ny = snapTo(ny);
          } else {
            nx = Math.round(nx);
            ny = Math.round(ny);
          }

          // Prevent dragging outside the parent container.
          // WHY: keeps layout valid and prevents items from being placed out of view.
          const { x: cx, y: cy } = clampToParent(
            nx,
            ny,
            sizeRef.current.w,
            sizeRef.current.h
          );

          // Determine actual movement that was applied (after clamping).
          const dxApplied = cx - dragStartRef.current.x;
          const dyApplied = cy - dragStartRef.current.y;

          // Apply transform-based visual movement.
          // WHY: immediate feedback to user, without altering persisted state yet.
          setPreview(el, dxApplied, dyApplied);

          // (Future hook) could preview child elements moving with parent here.
        },

        // ------------------- DRAG END -------------------
        end() {
          // Compute the final position (base + accumulated deltas).
          // If the user dragged very fast, these accumulated values are the
          // total pixel offset since drag start.
          let nx = dragStartRef.current.x + (accRef.current.dx || 0);
          let ny = dragStartRef.current.y + (accRef.current.dy || 0);

          // Apply same snapping or rounding logic as during move for consistency.
          if (snapEnabled) {
            nx = snapTo(nx);
            ny = snapTo(ny);
          } else {
            nx = Math.round(nx);
            ny = Math.round(ny);
          }

          // Clamp one last time to ensure element stays inside parent container.
          const { x: fx, y: fy } = clampToParent(
            nx,
            ny,
            sizeRef.current.w,
            sizeRef.current.h
          );

          // --- Commit final position ---
          // WHY: at this point, drag is finished, so we dispatch a Redux action
          // (or similar) to update the canonical position in app state.
          // This is when the new position becomes "official".
          dispatch(setPos({ id, floor, x: fx, y: fy }));

          // Clear temporary transform and re-enable transitions.
          // WHY: restores element’s normal styling so subsequent animations behave.
          clearPreview(el);
          el.style.transition = "";

          // Reset deltas again for safety.
          // WHY: ensures next drag starts from a clean state, avoiding cumulative drift.
          accRef.current.dx = 0;
          accRef.current.dy = 0;
        },
      },

      modifiers: [
        // interact.js built-in constraint to stop dragging outside parent.
        // WHY: acts as a safety net for extra protection in case clamp logic
        // doesn’t run (e.g., due to a logic or rendering glitch).
        interact.modifiers.restrictRect({
          restriction: parentEl,
          endOnly: false,
        }),
      ],
    })


    // ---------------- Resize (unchanged behavior; commit on end) ----------------
.resizable({
  // Enable resize handles on all four edges
  edges: { top: true, left: true, bottom: true, right: true },

  listeners: {
    // ------------------- RESIZE START -------------------
    start(event) {
      // Save the element’s starting geometry and which edges are being dragged.
      // WHY:
      // - We need the original width/height to compute deltas later.
      // - The 'edges' info tells us if user is resizing from top/left
      //   (which affects position too, not just size).
      resizeStartRef.current = {
        x: posRef.current.x,
        y: posRef.current.y,
        w: sizeRef.current.w,
        h: sizeRef.current.h,
        edges: event.edges || {}, // which sides are active (top, left, etc.)
      };

      // Optimize rendering by telling browser we’ll animate layout properties.
      // WHY: improves performance by allowing preallocation of compositor resources.
      el.style.willChange = "width, height, transform";

      // Disable transitions for instant visual response during resizing.
      // WHY: transitions would cause lag or interpolation artifacts between frames.
      el.style.transition = "none";
    },

    // ------------------- RESIZE MOVE -------------------
    move(event) {
      // Deconstruct stored initial state
      const { edges, x: sx, y: sy, w: sw, h: sh } = resizeStartRef.current;

      // Read raw dimensions reported by interact.js
      // WHY: these represent the element’s new size at this moment in pixels.
      let pw = Math.round(event.rect.width);
      let ph = Math.round(event.rect.height);

      // Apply optional snapping for preview
      // WHY: ensures resizes land on the same grid spacing as drags,
      // maintaining layout consistency and symmetry.
      if (snapEnabled) {
        pw = snapTo(pw);
        ph = snapTo(ph);
      }

      // When resizing from top or left, the element's origin (x, y) must move.
      // WHY:
      // - If you shrink width from the left, the left edge moves right → x increases.
      // - If you shrink height from the top, the top edge moves down → y increases.
      let px = sx;
      let py = sy;
      if (edges.left) px = sx + (sw - pw);
      if (edges.top)  py = sy + (sh - ph);

      // Constrain both size and position so element never leaves container.
      // WHY: guarantees visible layout and prevents overflow outside the floor plan.
      const { x: cx, y: cy } = clampToParent(px, py, pw, ph);

      // Apply real-time preview using width, height, and translation.
      // WHY: visually updates element size + position instantly without committing.
      el.style.width = `${pw}px`;
      el.style.height = `${ph}px`;
      el.style.transform = `translate3d(${cx - sx}px, ${cy - sy}px, 0)`;
    },

    // ------------------- RESIZE END -------------------
    end(event) {
      // Retrieve same baseline values used during move.
      const { edges, x: sx, y: sy, w: sw, h: sh } = resizeStartRef.current;

      // Compute final raw size from event.
      let nw = Math.round(event.rect.width);
      let nh = Math.round(event.rect.height);

      // Snap to grid again for final consistency.
      // WHY: prevents pixel drift between visual preview and committed data.
      if (snapEnabled) {
        nw = snapTo(nw);
        nh = snapTo(nh);
      }

      // Compute new top-left coordinates if resizing from top/left.
      let nx = sx;
      let ny = sy;
      if (edges.left) nx = sx + (sw - nw);
      if (edges.top)  ny = sy + (sh - nh);

      // Clamp again to enforce parent boundaries.
      const { x: fx, y: fy } = clampToParent(nx, ny, nw, nh);

      // --- Commit final values to global state/store ---
      // WHY:
      // - We update both position and size together for data integrity.
      // - Ensures the element's persisted geometry matches what user sees.
      dispatch(setPos({ id, floor, x: fx, y: fy }));
      dispatch(setSize({ id, floor, w: nw, h: nh }));

      // --- Cleanup temporary inline styles ---
      // WHY:
      // - Resets element styling after resize ends.
      // - Prevents accumulation of transforms or will-change hints.
      el.style.width = "";
      el.style.height = "";
      el.style.transform = "";
      el.style.willChange = "";
      el.style.transition = "";
    },
  },

  // ------------------- MODIFIERS -------------------
  modifiers: [
    // Optional: add snapping directly at the handle level for tactile feedback
    // WHY: lets interact.js handle minor snapping corrections automatically
    // rather than relying solely on manual rounding in move/end.
    ...(snapEnabled
      ? [interact.modifiers.snapSize({
          targets: [interact.snappers.grid({ x: GRID, y: GRID })],
        })]
      : []),

    // Prevent resizing beyond parent edges.
    // WHY: ensures the element stays visually contained in its floor area.
    interact.modifiers.restrictEdges({ outer: parentEl, endOnly: false }),

    // Prevent shrinking smaller than one grid unit.
    // WHY: keeps items usable and prevents accidental collapse to zero size.
    interact.modifiers.restrictSize({
      min: { width: GRID, height: GRID },
    }),
  ],
});

  return interactable;
}

export { setDragRulesBuildMode };