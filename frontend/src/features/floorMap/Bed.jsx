import React, { useRef, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteItem, setPos, setSize, setVisibleMenuId } from "../../stores/reducers/unitMapSlice";
import { setBedDragRules, setBedTransferRules } from "./editing/bedEditing";
import { Box, Typography, useTheme, Chip, IconButton, Menu, MenuItem } from "@mui/joy";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useSetPatientsBedMutation } from "../../services/patient";
import Patient from "./Patient";
import ClientStatusIcon from "../../components/common/ClientStatusIcon";
import { setPrefillData, setRedirectAfterSave } from "../../stores/reducers/patientSlice";
import { useNavigate } from "react-router-dom";

const GRID = 20;

const Bed = ({ id, type, floor, item, isAlive }) => {
  const snapEnabled = true;
  const theme = useTheme();
  const ref = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [ setPatientsBed ] = useSetPatientsBedMutation();
  const { mode, visibleMenuId } = useSelector((state) => state.unitMaps);
  const unitsState = useSelector((state) => state.unitMaps);
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { pos, size, items } = useSelector((state) => {
    const floorData = state.unitMaps.floors?.find((f) => f.id == floor);
    const item = floorData?.rooms.find((i) => i.id === id);
    return {
      pos: { x: item?.x ?? GRID * 3, y: item?.y ?? GRID * 2 },
      size: { w: item?.w ?? GRID * 7, h: item?.h ?? GRID * 3 },
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

  const handleContextMenu = (e) => {
    // Only show menu if bed is empty and not in build mode
    if (!item.patient && mode !== "build") {
      e.preventDefault();
      e.stopPropagation();
      setAnchorEl(e.currentTarget);
      setMenuOpen(prev => !prev);
    }
  };

  const handleCreatePatient = () => {
    // Get room info from the bed's parent
    const floorData = items.find(room => 
      room.beds?.some(bed => bed.id === item.id)
    );

    // Pre-calculate correct options
    const roomsOptions = unitsState.floors.find(f => f.id === floor)?.rooms;
    let bedsOptions = roomsOptions
      .find(r => r.id === floorData?.id)
      ?.beds.filter(bed => !bed.patient);

    // This is used by FormSelect.jsx to display option name correctly
    bedsOptions = (bedsOptions || []).map(bed => ({
      ...bed,
      name: bed.bed_no
    }));
    
    // Set prefill data with bed, room, and unit info
    dispatch(setPrefillData({
      values: {
        unit_id: floor,
        room_id: floorData?.id,
        bed_id: item.id,
      },
      options: {
        room_id: roomsOptions,
        bed_id: bedsOptions,
      }
    }));
    
    // Set redirect to return to this floor after save
    dispatch(setRedirectAfterSave({
      targetPage: 'unitMaps',
      contextData: {
        unitId: floor
      }
    }));
    
    navigate('/patients/create');
    setMenuOpen(false);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    let interactable;

    if (mode === "build") {
      // interactable = setBedDragRules(
      //   el, dragStartRef, resizeStartRef, posRef, accRef, sizeRef,
      //   dispatch, id, floor, snapEnabled, setPos, setSize, items, type
      // );
    } else if (mode === "move" && item.patient) {
      const patientEl = el.querySelector(".patient");
      if (patientEl) {
        interactable = setBedTransferRules(
          patientEl, items, item.id, dispatch,
          item.patient.id, floor,
          () => Array.from(document.querySelectorAll(".bed[data-id]")),
          setPatientsBed
        );
      }
    }
    return () => interactable?.unset();
  }, [snapEnabled, mode, item.patient]);

  const palette = theme.vars.palette;
  return (
    <>
      <Box
        ref={ref}
        className="bed"
        data-id={id}
        onContextMenu={handleContextMenu}
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: palette.background.level1,
          boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
          // overflow: "hidden",
          zIndex: type === "bed" ? 2 : 1,
          userSelect: "none",
          cursor: mode === "build" ? "move" : "default",
          minWidth: "140px",
          minHeight: "60px",
        }}
      >
        
       <Box sx={{ 
          width: "0.8rem",
          height: "100%", 
          whiteSpace: "normal",
          wordBreak: "break-word",
          display: "flex", alignItems:
          "center", justifyContent: "center",
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
          backgroundColor: !item.patient ? "#747272ff" : (item.patient?.gender == 2 ? "#f31b1bff" : "#339ee6ff"),
        }}>
          {item.bed_no}
       </Box>       
       { item.client?.id && <ClientStatusIcon isAlive={isAlive} /> }
        {(item.patient) && (
          <Patient mode={mode} item={item.patient} id={id} palette={palette} />
        )}
      </Box>

      {/* Menu for empty bed */}
      {!item.patient && (
        <Menu
          open={menuOpen}
          onClose={handleCloseMenu}
          anchorEl={anchorEl}
          placement="right-start"
          sx={{ 
            zIndex: 10000,
            minWidth: "120px",
            '--List-padding': '8px',
            '--List-decorator-size': '0px',
          }}
          slotProps={{
            root: {
              sx: {
                backgroundColor: palette.background.surface,
                border: `1px solid ${palette.divider}`,
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              }
            }
          }}
        >
          <MenuItem
            onClick={handleCreatePatient}
            sx={{
              color: palette.primary.solidBg,
              py: '4px',
              px: 0,
              minHeight: 'auto',
            }}
          >
            新規
          </MenuItem>
          <MenuItem 
            onClick={handleCloseMenu}
            sx={{
              color: palette.text.secondary,
              py: '4px',
              px: 0,
              minHeight: 'auto',
            }}
          >
            閉じる
          </MenuItem>
        </Menu>
      )}

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

export default Bed;
