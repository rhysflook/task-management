import React, { useRef, useEffect, useState, use } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteItem, setPos, setSize, setVisibleMenuId } from "../../stores/reducers/unitMapSlice";
import { setDragRulesBuildMode } from "./unitCreateRules";
import { Box, Button, Modal, ModalDialog, Typography, useTheme } from "@mui/joy";
import { FACILITY_KINDS } from "./facilityConfig";
import { useDeleteRecordMutation } from "../../services/tables";
import { useGetStagedPatientsQuery } from "../../services/patient";
const GRID = 20;

const Room = ({ id, type, floor, snapEnabled, children }) => {
  const theme = useTheme();
  const ref = useRef(null);
  const deleteRoom = useDeleteRecordMutation();
  const dispatch = useDispatch();
  const { data, refetch } = useGetStagedPatientsQuery(/* 必要なら引数 */);
  const [openModal, setOpenModal] = useState(false);
  const [modalText, setModalText] = useState("");
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

  const handleRightClick = (e, id) => {
    e.preventDefault();
    if (mode !== "build") return;
    console.log("right click on room:", id);
    setModalText(`${item.is_utility ? '施設' : '居室'}を削除します。よろしいですか？`);
    dispatch(setVisibleMenuId(visibleMenuId === id ? null : id));
  }

  const handleDelete = async () => {  
    setOpenModal(false);
    await deleteRoom[0]({ url: `rooms/${id}` })
    .unwrap()
    .then(async () => {
      await refetch();  // Refetch staged patients
      dispatch(deleteItem({ floor, id }));
    })
    .catch((error) => {
      setModalText(`居室の削除に失敗しました。`);
    });
    
  }

  return (
    <>
      <Box
        ref={ref}
        className=""
      
        sx={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          height: size.h,
          width: size.w,
          minWidth: item.is_utility ? undefined : `${(item.grid_columns || 1) * 140}px`,
          minHeight: item.is_utility ? undefined : `${(item.grid_rows || 1) * 60}px`,
          // width: size.w,
          // height: size.h,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: palette.background.level1,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          // overflow: "hidden",
          zIndex: 1,
          userSelect: "none",
          cursor: mode === "build" ? "move" : "default",

        }}
      >
       {item.name &&<Box 
          onContextMenu={(e) => handleRightClick(e, item.id)}
        sx={{ 
          width: "0.8rem",
          height: "100%", 
          
          whiteSpace: "normal",
          wordBreak: "break-word",
          display: "flex", alignItems:
          "center", justifyContent: "flex-start",
          position: "relative",
          top: 0,
          left: 0,
          paddingLeft: "4px",
          paddingRight: "4px",
          writingMode: "vertical-rl",
          textOrientation: "upright",
          fontSize: "0.75rem",
          opacity: 0.7,
          color: "#ffffff",
          backgroundColor: "#747272ff",
        }}>
          {item.name || item.bed?.name}
       </Box>}
        <Box sx={{ 
            width: '100%',
            height: '100%',
            display: 'grid',
            gridTemplateRows: `repeat(${item.grid_rows}, 1fr)`,
            gridTemplateColumns: `repeat(${item.grid_columns}, 1fr)`
        }}>
            {item.is_utility ? (
             <Box
             onContextMenu={(e) => handleRightClick(e, item.id)}
                className="facility"
                data-id={id}
                sx={{
                  position: "absolute",
                  inset: 0,                // fill the draggable area (no size change)
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  userSelect: "none",
                }}
              >
                {(() => {
                  const conf = FACILITY_KINDS[item.icon] || {};
                  const src = conf.icon; // now a PNG path or imported URL
                  if (!src) return null;

                  // scale icon to container without changing the container size
                  const maxSide = Math.min(size.w, size.h);
                  const iconSize = Math.max(24, Math.floor(maxSide * 0.8));

                  return (
                    <Box
                      onContextMenu={(e) => handleRightClick(e, item.id)}
                      component="img"
                      src={src}
                      alt={conf.label || item.icon}
                      sx={{
                        width: iconSize,
                        height: iconSize,
                        objectFit: "contain",
                        opacity: 0.95,
                      }}
                    />
                  );
                })()}
              </Box>
            ) : children}
        </Box>
      </Box>
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
          <Box
            component="button"
            onClick={() => setOpenModal(true)}
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
            {item.is_utility ? '施設削除' : '居室削除'}
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
            閉じる
          </Box>
        </Box>
        
      )}
      {openModal && (
        <Modal open onClose={() => setOpenModal(false)}
          sx={{
            '--Modal-backdrop-filter': 'blur(2px)',  // default ~8px
            '--Modal-backdrop-bg': 'rgba(0, 0, 0, 0.2)', // adjust if needed
          }}
        >
          <ModalDialog
            variant="outlined"
            color= "danger"
          >
            <Typography>
              {modalText}
            </Typography>

            <Box
              sx={{ mt: 2, display: "flex", gap: 1, justifyContent: "flex-end" }}
            >
              <Button variant="plain" onClick={() => setOpenModal(false)}>
                NG
              </Button>
              <Button color="danger" onClick={handleDelete}>
                OK
              </Button>
            </Box>
          </ModalDialog>
        </Modal>
      )}
    </>
  );
};

export default Room;
