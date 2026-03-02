// import React, { useRef, useEffect } from "react";
// import interact from "interactjs";
// import { useDispatch, useSelector } from "react-redux";
// import { deleteItem, setPos, setSize, setVisibleMenuId } from "../../stores/reducers/unitMapSlice";
// import { setDragRulesBuildMode, setDragRulesMoveMode } from "./unitCreateRules";
// import { Box, Typography, useTheme, Chip, IconButton } from "@mui/joy";
// import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
// import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
// import { ImportExport } from "@mui/icons-material";
// import { FACILITY_KINDS } from "./facilityConfig";

// const GRID = 20;

// const DraggableItem = ({ id, type, floor, snapEnabled }) => {
//   const theme = useTheme();
//   const ref = useRef(null);
//   const dispatch = useDispatch();
//   const { mode, visibleMenuId } = useSelector((state) => state.unitMaps);
//   const { pos, size, items, item } = useSelector((state) => {
//     const floorData = state.unitMaps.floors?.find((f) => f.id == floor);
//     const item = floorData?.items.find((i) => i.id === id);
//     return {
//       pos: { x: item?.x ?? GRID * 3, y: item?.y ?? GRID * 2 },
//       size: { w: item?.w ?? GRID * 7, h: item?.h ?? GRID * 5 },
//       items: floorData?.items || [],
//       item: item || {},
//     };
//   });

//   const posRef = useRef(pos);
//   const sizeRef = useRef(size);
//   useEffect(() => { posRef.current = pos; }, [pos]);
//   useEffect(() => { sizeRef.current = size; }, [size]);

//   const dragStartRef = useRef({ x: 0, y: 0 });
//   const resizeStartRef = useRef({ x: 0, y: 0, w: 0, h: 0, edges: {} });
//   const accRef = useRef({ dx: 0, dy: 0, dl: 0, dt: 0 });

//   useEffect(() => {
//     if (!ref.current) return;
//     const el = ref.current;
//     let interactable;

//     if (mode === "build") {
//       interactable = setDragRulesBuildMode(
//         el, dragStartRef, resizeStartRef, posRef, accRef, sizeRef,
//         dispatch, id, floor, snapEnabled, setPos, setSize, items, type
//       );
//     } else if (mode === "move" && item.bed?.patient) {
//       const patientEl = el.querySelector(".patient");
//       if (patientEl) {
//         interactable = setDragRulesMoveMode(
//           patientEl, items, item.id, dispatch,
//           item.bed.patient.id, floor,
//           () => Array.from(document.querySelectorAll(".bed[data-id]"))
//         );
//       }
//     }
//     return () => interactable?.unset();
//   }, [snapEnabled, mode, item.bed?.patient]);

//   const palette = theme.vars.palette;
//   return (
//     <>
//       <Box
//         ref={ref}
//         className="bed"
//         data-id={type === "bed" ? id : undefined}
//         onContextMenu={(e) => {
//           e.preventDefault();
//           dispatch(setVisibleMenuId(visibleMenuId === id ? null : id));
//         }}
//         sx={{
//           position: "absolute",
//           left: pos.x,
//           top: pos.y,
//           width: size.w,
//           height: size.h,
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           backgroundColor: palette.background.level1,
//           boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
//           // overflow: "hidden",
//           zIndex: type === "bed" ? 2 : 1,
//           userSelect: "none",
//           cursor: mode === "build" ? "move" : "default",
//           // transition: "box-shadow 0.2s ease, transform 0.1s ease",
//           // "&:hover": {
//           //   boxShadow: "0 4px 10px rgba(0,0,0,0.12)",
//           // },
//           // "&:active": {
//           //   transform: "scale(0.995)",
//           // },
//         }}
//       >
//        <Box sx={{ 
//           width: "0.8rem",
//           height: size.h, 
//           whiteSpace: "normal",
//           wordBreak: "break-word",
//           display: "flex", alignItems:
//           "center", justifyContent: item.type == "bed" ? "center" : "flex-start",
//           position: "absolute",
//           top: 0,
//           left: 0,
//           paddingLeft: "4px",
//           paddingRight: "4px",
//           writingMode: "vertical-rl",
//           textOrientation: "upright",
//           fontSize: "0.75rem",
//           color: palette.text.secondary,
//           opacity: 0.7,
//           color: "#ffffff",
//           backgroundColor: item.type == "room" || !item.bed?.patient ? "#747272ff" : (item.bed?.patient?.gender == 1 ? "#f31b1bff" : "#339ee6ff"),
//         }}>
//           {item.name || item.bed?.name}
//        </Box>
//         {type == "facility" && (
//           <Box
//             className="facility"
//             data-id={id}
//             sx={{
//               position: "absolute",
//               inset: 0,                // fill the draggable area (no size change)
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "center",
//               pointerEvents: "none",   // don't steal drag/resizes
//               userSelect: "none",
//             }}
//           >
//             {(() => {
//               const conf = FACILITY_KINDS[item.kind] || {};
//               const Icon = conf.icon;
//               if (!Icon) return null;

//               // scale icon to container without changing the container size
//               // pick the smaller of w/h and use ~60% of it
//               const maxSide = Math.min(size.w, size.h);
//               const iconSize = Math.max(20, Math.floor(maxSide * 0.6));

//               return (
//                 <Icon
//                   sx={{
//                     fontSize: iconSize,
//                     color: conf.color || "var(--mui-palette-text-primary)",
//                     opacity: 0.95,
//                   }}
//                 />
//               );
//             })()}
//           </Box>
//         )}
//         {(type === "bed" && item.bed?.patient) && (
//           <Box
           
//             sx={{
//               position: "absolute",
//               top: "0%",
//               left: "1rem",
//               width: "calc(100% - 1rem)",
//               height: "100%",
//               display: "flex",
//               flexDirection: "column",
//               backgroundColor: item.bed?.patient
//                 ? palette.primary.softBg
//                 : palette.neutral.softBg,
//               color: palette.text.primary,
//               boxShadow: "inset 0 0 2px rgba(0,0,0,0.06)",
//               cursor: mode === "move" ? "grab" : "default",
//               userSelect: "none",
//               overflow: "hidden",
//               transition: "box-shadow 0.2s ease",
//               // "&:hover": {
//               //   boxShadow: `0 0 0 3px ${palette.primary.softActiveBg}`,
//               // },
//             }}
//           >
//             {/* Header */}
           

//             <Box
//              className="patient"
                  
//                     sx={{
//                     flex: 1,
//                     display: "flex",
//                     flexDirection: "column",
//                     // px: 1.5,
//                     gap: 0.5,
//                     zIndex: 2,
//                     backgroundColor: item.bed?.patient
//                   ? palette.primary.softBg
//                   : palette.neutral.softBg,
//                    pointerEvents: mode === "build" ? "none" : "auto",   // <-- key line
//                     cursor: mode === "move" ? "grab" : "default",
//                     }}
//                   >
//             <Box
//              data-bed-id={id}
//               sx={{
//                 display: "flex",
//                 flexDirection: "column",
//                 px: 1.5,
//                 py: 0.8,
//                 backgroundColor: palette.background.level2,
//                 borderBottom: `1px solid ${palette.divider}`,
//                 width: "100%",
//                 height: "100%",
//               }}
//             >
//               <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 0.8}}>
//                 <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
//                   <LocalHospitalIcon
//                   sx={{ color: palette.primary.solidBg, fontSize: "1.2rem" }}
//                 />
//                 <Typography level="title-sm" fontWeight={600}>
//                   {item.bed?.patient?.name ?? ""}
//                 </Typography>
//                 </Box>
                
          
//               </Box>
//               <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
//                 <Typography level="body-sm"  fontWeight={700}>
//                     入所者No. 
//                 </Typography>
//                 <Typography level="body-sm" >
//                   {item.bed?.patient?.id}
//                 </Typography>
//               </Box>
//               <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
//                                {
//                     item.bed?.patient ? (
//                     (() => {
//                       // Calculate age from birth_day (assumed format: YYYY-MM-DD)
//                       const birthDay = item.bed.patient.birth_day;
//                       let age = "";
//                       if (birthDay) {
//                       const birthDate = new Date(birthDay);
//                       const today = new Date();
//                       age = today.getFullYear() - birthDate.getFullYear();
//                       const m = today.getMonth() - birthDate.getMonth();
//                       if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
//                         age--;
//                       }
//                       }
//                       return (
//                       <>
                        
//                         <Typography level="body-sm"  fontWeight={700}>
//                         年齢:
//                         </Typography>
//                         <Typography level="body-sm">
//                           {age ? `${age}歳` : ""}
//                         </Typography>
//                       </>
//                       );
//                     })()
//                     ) : (
//                     <Typography
//                       level="body-sm"
//                       sx={{
//                       textAlign: "center",
//                       color: palette.text.tertiary,
//                       opacity: 0.7,
//                       }}
//                     >
                      
//                     </Typography>
//                     )}
//                     </Box>
//             </Box>
     
//                   </Box>

//                   {/* Footer / status row */}
           
//           </Box>
//         )}
//       </Box>

//       {/* Context menu restored */}
//       {visibleMenuId === id && (
//         <Box
//           sx={{
//             position: "absolute",
//             left: pos.x + size.w + 8,
//             top: pos.y,
//             backgroundColor: palette.background.surface,
//             border: `1px solid ${palette.divider}`,
//             boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
//             p: 1,
//             zIndex: 100,
//             minWidth: "120px",
//             userSelect: "none",
//           }}
//         >
//           <Typography
//             level="body-sm"
//             sx={{ mb: 0.5, color: palette.text.secondary }}
//           >
//             Actions
//           </Typography>
//           <Box
//             component="button"
//             onClick={() => dispatch(deleteItem({ floor, id }))}
//             style={{
//               background: "none",
//               border: "none",
//               color: palette.danger.solidBg,
//               cursor: "pointer",
//               fontSize: "0.85rem",
//               padding: "4px 0",
//               width: "100%",
//               textAlign: "left",
//             }}
//           >
//             Delete
//           </Box>
//           <Box
//             component="button"
//             onClick={() => dispatch(setVisibleMenuId(null))}
//             style={{
//               background: "none",
//               border: "none",
//               color: palette.text.secondary,
//               cursor: "pointer",
//               fontSize: "0.85rem",
//               padding: "4px 0",
//               width: "100%",
//               textAlign: "left",
//             }}
//           >
//             Close
//           </Box>
//         </Box>
//       )}
//     </>
//   );
// };

// export default DraggableItem;
