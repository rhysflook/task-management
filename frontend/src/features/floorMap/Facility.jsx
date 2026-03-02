import React, { useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteItem, setPos, setSize, setVisibleMenuId } from "../../stores/reducers/unitMapSlice";
import { setDragRulesBuildMode } from "./unitCreateRules";
import { Box, Typography, useTheme } from "@mui/joy";
import { FACILITY_KINDS } from "./facilityConfig";

const GRID = 20;

const Facility = ({ id, type, floor, snapEnabled }) => {
  const theme = useTheme();
  const ref = useRef(null);
  const dispatch = useDispatch();
  const { mode, visibleMenuId } = useSelector((state) => state.unitMaps);
  const { pos, size, items, item } = useSelector((state) => {
    const floorData = state.unitMaps.floors?.find((f) => f.id == floor);
    const item = floorData?.rooms.find((i) => i.id === id);
    return {
      pos: { x: item?.x ?? GRID * 3, y: item?.y ?? GRID * 2 },
      size: { w: item?.w ?? GRID * 7, h: item?.h ?? GRID * 5 },
      items: floorData?.rooms || [],
      item: item || {},
    };
  });

  const posRef = useRef(pos);
  const sizeRef = useRef(size);
  useEffect(() => { posRef.current = pos; }, [pos]);
  useEffect(() => { sizeRef.current = size; }, [size]);

  const dragStartRef = useRef({ x: 0, y: 0 });
  const resizeStartRef = useRef({ x: 0, y: 0, w: 0, h: 0, edges: {} });
  const accRef = useRef({ dx: 0, dy: 0, dl: 0, dt: 0 });

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    let interactable;

    if (mode === "build") {
      interactable = setDragRulesBuildMode(
        el, dragStartRef, resizeStartRef, posRef, accRef, sizeRef,
        dispatch, id, floor, snapEnabled, setPos, setSize, items, type
      );
    }
    return () => interactable?.unset();
  }, [snapEnabled, mode, item.bed?.patient]);

  const palette = theme.vars.palette;
  return (
    <>
      <Box
        ref={ref}
        className="bed"
        data-id={type === "bed" ? id : undefined}
        onContextMenu={(e) => {
          e.preventDefault();
          dispatch(setVisibleMenuId(visibleMenuId === id ? null : id));
        }}
        sx={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          width: size.w,
          height: size.h,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: palette.background.level1,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          // overflow: "hidden",
          zIndex: type === "bed" ? 2 : 1,
          userSelect: "none",
          cursor: mode === "build" ? "move" : "default",

        }}
      >
       {/* <Box sx={{ 
          width: "0.8rem",
          height: size.h, 
          whiteSpace: "normal",
          wordBreak: "break-word",
          display: "flex", alignItems:
          "center", justifyContent:  "flex-start",
          position: "absolute",
          top: 0,
          left: 0,
          paddingLeft: "4px",
          paddingRight: "4px",
          writingMode: "vertical-rl",
          textOrientation: "upright",
          fontSize: "0.75rem",
          opacity: 0.7,
          color: "#ffffff",
          backgroundColor: item.type == "room" || !item.bed?.patient ? "#747272ff" : (item.bed?.patient?.gender == 1 ? "#f31b1bff" : "#339ee6ff"),
        }}> */}
          {/* {item.name || item.bed?.name}
       </Box> */}
          <Box
            className="facility"
            data-id={id}
            sx={{
              position: "absolute",
              inset: 0,                // fill the draggable area (no size change)
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",   // don't steal drag/resizes
              userSelect: "none",
            }}
          >
            {(() => {
              const conf = FACILITY_KINDS[item.kind] || {};
              const Icon = conf.icon;
              if (!Icon) return null;

              // scale icon to container without changing the container size
              // pick the smaller of w/h and use ~60% of it
              const maxSide = Math.min(size.w, size.h);
              const iconSize = Math.max(20, Math.floor(maxSide * 0.6));

              return (
                <Icon
                  sx={{
                    fontSize: iconSize,
                    color: conf.color || "var(--mui-palette-text-primary)",
                    opacity: 0.95,
                  }}
                />
              );
            })()}
          </Box>
      </Box>

      {/* Context menu restored */}
      {visibleMenuId === id && (
        <Box
          sx={{
            position: "absolute",
            left: pos.x + size.w + 8,
            top: pos.y,
            backgroundColor: palette.background.surface,
            border: `1px solid ${palette.divider}`,
            boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
            p: 1,
            zIndex: 100,
            minWidth: "120px",
            userSelect: "none",
          }}
        >
          <Typography
            level="body-sm"
            sx={{ mb: 0.5, color: palette.text.secondary }}
          >
            Actions
          </Typography>
          <Box
            component="button"
            onClick={() => dispatch(deleteItem({ floor, id }))}
            style={{
              background: "none",
              border: "none",
              color: palette.danger.solidBg,
              cursor: "pointer",
              fontSize: "0.85rem",
              padding: "4px 0",
              width: "100%",
              textAlign: "left",
            }}
          >
            Delete
          </Box>
          <Box
            component="button"
            onClick={() => dispatch(setVisibleMenuId(null))}
            style={{
              background: "none",
              border: "none",
              color: palette.text.secondary,
              cursor: "pointer",
              fontSize: "0.85rem",
              padding: "4px 0",
              width: "100%",
              textAlign: "left",
            }}
          >
            Close
          </Box>
        </Box>
      )}
    </>
  );
};

export default Facility;
