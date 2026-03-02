import { use, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addToIncallPatients, deleteFloor, removeFromIncallPatients, selectFloor } from "../../stores/reducers/unitMapSlice";
import { useGetUnitMapQuery, useSaveUnitMapMutation } from "../../services/unitMap";
import {
  Box, Button, Checkbox, Typography, IconButton, Dropdown,
  Menu, MenuButton, MenuItem, Tooltip, Divider, Modal, ModalDialog, DialogContent, DialogTitle,
} from "@mui/joy";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SaveIcon from "@mui/icons-material/Save";
import QrCode2Icon from "@mui/icons-material/QrCode2";
import FacilityPaletteButton from '../../features/floorMap/FacilityPaletteButton';
import ModeToggles from "./ModeToggles";
import FloorSelect from "./FloorSelect";
import AddRoom from "./Menu/AddRoom";
import AddBed from "./Menu/AddBed";
import MoveFloor from "./Menu/MoveFloor";
import AddFloor from "./Menu/AddFloor";
import { Delete } from "@mui/icons-material";
import DeleteFloor from "./Menu/DeleteFloor";
import SetSnap from "./Menu/SetSnap";
import { useEcho, useEchoPublic } from "@laravel/echo-react";
import Room from "../../features/floorMap/Room";
import Bed from "../../features/floorMap/Bed";
import Facility from "../../features/floorMap/Facility";
import Patient from "../../features/floorMap/Patient";
import { setBedTransferRules, setStagingTransferRules } from "../../features/floorMap/editing/bedEditing";
import { useGetAllClientsIsAliveQuery } from "../../services/client";
import { useGetStagedPatientsQuery } from "../../services/patient";
import { useGetInCallPatientsQuery } from "../../services/patient";
import { usePannable } from "../../hooks/usePannable";
import { useLocation } from "react-router-dom";
import { inTypes, UserType } from "../../stores/reducers/authSlice";

const GRID_SIZE = 20;
const IS_ALIVE_POLLING_INTERVAL = 5000; // 5 seconds

const UnitMapDashboard = () => {
  const location = useLocation();
  const { isLoading } = useGetUnitMapQuery();
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [isApkQrOpen, setIsApkQrOpen] = useState(false);
  useGetStagedPatientsQuery();
  useGetInCallPatientsQuery();
  const { user } = useSelector((state) => state.auth);
  const { floors, currentFloor,stagedPatients, mode } = useSelector((state) => state.unitMaps);
  const dispatch = useDispatch();
  const [saveUnitMap] = useSaveUnitMapMutation();
  const bottomPadding = 50
  // Fetch all clients isAlive status with polling every 5 seconds

  useEchoPublic('patient.call', 'CallStarted', (e) => {
    const patientId = e.patientId;
    // Update the stagedPatients in the Redux store
    dispatch(addToIncallPatients(patientId));
  });

  useEchoPublic('patient.call', 'CallEnded', (e) => {
    const patientId = e.patientId;
    dispatch(removeFromIncallPatients(patientId));
  })

  const { data: clientsIsAlive = {} } = useGetAllClientsIsAliveQuery(undefined, {
    pollingInterval: IS_ALIVE_POLLING_INTERVAL,
  });
  const inferredBackendUrl = `${window.location.protocol}//${window.location.hostname}:8000`;
  const apiBaseUrl = (import.meta.env.VITE_API_URL || inferredBackendUrl).replace(/\/$/, "");
  const apkDownloadUrl = `${apiBaseUrl}/downloads/android-apk`;
  const apkQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&data=${encodeURIComponent(apkDownloadUrl)}`;

  const currentFloorObj = floors.find((f) => f.id === currentFloor);

  // Calculate bounds ONCE and memoize them
  const bounds = useMemo(() => {
    // Get viewport dimensions as baseline
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - bottomPadding; // Subtract header/padding

    if (!currentFloorObj?.rooms || currentFloorObj.rooms.length === 0) {
      return { maxX: viewportWidth, maxY: viewportHeight };
    }

    const maxX = Math.max(
      ...currentFloorObj.rooms.map(room => room.x + room.width)
    );
    const maxY = Math.max(
      ...currentFloorObj.rooms.map(room => room.y + room.height)
    );

    // Add padding for comfortable dragging space
    const padding = 300;
    
    // Use the LARGER of viewport size or content size + padding
    return { 
      maxX: Math.max(viewportWidth, maxX + padding),
      maxY: Math.max(viewportHeight, maxY + padding)
    };
  }, [currentFloorObj?.id]); // Only recalculate when floor changes

  const { mapRef, offset, isDragging, handlers } = usePannable(bounds);
  useEffect(() => {
    // Check if we have navigation state with floor info
    if (location.state?.unitId) {
      dispatch(selectFloor({ id: location.state.unitId }));
      // Clear the state to avoid re-triggering on refresh
      window.history.replaceState({}, document.title);
    } else if (user.unit_id) {
      dispatch(selectFloor({ id: user.unit_id }));
    }
  }, [isLoading, location.state]);
  
  if (isLoading) return <Typography>読み込み中...</Typography>;

  return (
    <Box
      sx={{
        width: "100%",
        height: "calc(100vh - 50px)", // give more vertical room to the map area
        mx: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        px: { xs: 1.5, md: 2 },
        pt: 1.5,
      }}
    >
      {/* ── Compact top bar: Mode + Floor + More menu ───────────── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          p: 1,
          borderRadius: "lg",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.surface",
        }}
      >
        
        <ModeToggles />
        {/* Spacer */}
        <Box sx={{ flex: 1 }} >
          <Typography level="h6" sx={{ width: "100%", textAlign:"right" }}>
            {`${user.staff_id}　${user.name}`}
          </Typography>
        </Box>

        {inTypes(user, [UserType.ADMIN, UserType.SUPERUSER]) && <FacilityPaletteButton />}
        {inTypes(user, [UserType.ADMIN, UserType.SUPERUSER]) && (
          <Button
            size="sm"
            variant="soft"
            color="primary"
            startDecorator={<QrCode2Icon />}
            onClick={() => setIsApkQrOpen(true)}
          >
            APK QR
          </Button>
        )}
        <FloorSelect />
      </Box>

      {/* ── Map area (expanded) ─────────────────────────────── */}
      <Box
        ref={mapRef}
        className="map-background"
        {...handlers}
        sx={{
          flex: 1,                 // <-- take the rest
          minHeight: 0,            // allow child to size inside flex
          position: "relative",
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: "lg",
          backgroundColor: "rgba(240, 244, 248, 0.8)",
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
          cursor: mode === "build" ? (isDragging ? 'grabbing' : 'grab') : 'default', // Add cursor
          userSelect: 'none', // Prevent text selection
        }}
      >
        {/* Background grid layer that moves with content */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${bounds.maxX}px`,  // Fixed width based on bounds
            height: `${bounds.maxY}px`, // Fixed height based on bounds
            backgroundImage:
              "linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), " +
              "linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)",
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            pointerEvents: 'none',
          }}
        />
        <Box
          data-pannable
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${bounds.maxX}px`,  // Fixed size based on bounds
            height: `${bounds.maxY}px`, // Fixed size based on bounds
            transform: `translate(${offset.x}px, ${offset.y}px)`,
            pointerEvents: isDragging ? 'none' : 'auto',
          }}
        >
          {currentFloorObj?.rooms?.map((item) => {
            return <Room
                    key={item.id}
                    id={item.id}
                    type={item.type}
                    floor={currentFloor}
                    snapEnabled={snapEnabled}
                  >
              {(() => {
                const beds = item.beds || [];
                const maxPos = beds.length
                  ? Math.max(...beds.map(b => b.position))
                  : 0;
                const bedMap = Object.fromEntries(
                  beds.map(bed => [bed.position, bed])
                );
                const slots = [];
                for (let pos = 1; pos <= maxPos; pos++) {
                  const bed = bedMap[pos];
                  if (bed) {
                    slots.push(
                      <Bed
                        key={bed.id}
                        id={bed.id}
                        type={bed.type}
                        floor={currentFloor}
                        item={bed}
                        snapEnabled={snapEnabled}
                        isAlive={bed.client?.id ? clientsIsAlive[bed.client.id] : null}
                      />
                    );
                  } else {
                    slots.push(
                      <Box key={`blank-${pos}`} position={pos} >  </Box>
                    );
                  }
                }
                return slots;
              })()}
            </Room>;
          })}
        </Box>
      </Box>
      <Box id="staging-area" className="staging-area"
        sx={{ 
            "position": "fixed",
            "right": "24px",
            "top": "80px",
            "width": "170px",
            "minHeight": "200px",
            "border": "2px dashed #aaa",
            "borderRadius": "8px",
            "background": "#fafafa",
         }}
      >
        {stagedPatients.map(p => (
  
          <Patient
           key={p.id} mode={mode} item={p} id={p.id} palette={p.palette} staged={true}
            />
        ))}
      </Box>
      {inTypes(user, [UserType.ADMIN, UserType.SUPERUSER]) && (
        <Modal
          open={isApkQrOpen}
          onClose={() => setIsApkQrOpen(false)}
          sx={{
            '--Modal-backdrop-filter': 'blur(2px)',
            '--Modal-backdrop-bg': 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <ModalDialog sx={{ maxWidth: 360, width: '92vw' }}>
            <DialogTitle>Android APK QR</DialogTitle>
            <DialogContent>
              <Typography level="body-sm" sx={{ mb: 1 }}>
                このQRコードをスキャンすると最新のAndroid APKをダウンロードできます。
              </Typography>
              <Box
                component="img"
                src={apkQrCodeUrl}
                alt="APK download QR code"
                sx={{
                  display: 'block',
                  width: 240,
                  height: 240,
                  mx: 'auto',
                  borderRadius: 'sm',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'white',
                  p: 1,
                }}
              />
              <Typography
                level="body-xs"
                sx={{ mt: 1.5, mb: 1.5, wordBreak: 'break-all', textAlign: 'center' }}
              >
                {apkDownloadUrl}
              </Typography>
              <Button
                component="a"
                href={apkDownloadUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                ダウンロード
              </Button>
            </DialogContent>
          </ModalDialog>
        </Modal>
      )}
    </Box>
  );
};

export default UnitMapDashboard;
