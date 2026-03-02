import { Box, Typography, Menu, MenuItem } from "@mui/joy";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { useTheme } from "@emotion/react";
import { useEffect, useRef, useState } from "react";
import { setStagingTransferRules } from "./editing/bedEditing";
import { useDispatch, useSelector } from "react-redux";
import { setRedirectAfterSave } from "../../stores/reducers/patientSlice";
import { useNavigate } from "react-router-dom";
import PhoneIndicator from "../../components/common/PhoneIndicator";
const Patient = ({mode, item, id, staged=false}) => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { currentFloor, inCallPatients } = useSelector((state) => state.unitMaps);
    const ref = useRef(null);
    const palette = theme.vars.palette;
    
    const [menuOpen, setMenuOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    if (staged) {
      // console.log("rendering staged patient:", item);
    }
    
    useEffect(() => {
        if (!ref.current) return;
          const el = ref.current;
          let interactable;
      if (mode === "move" && staged) {
        // console.log("setting staging transfer rules");
            if (el) {
              interactable =  setStagingTransferRules(
                el,
                dispatch,
                id,
                currentFloor,
              );
            }
          }
          return () => interactable?.unset();
    }, [mode])

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setAnchorEl(e.currentTarget);
        setMenuOpen(prev => !prev);
    };

    const handleEdit = () => {
      dispatch(setRedirectAfterSave({
        targetPage: 'unitMaps',
        contextData: {
            unitId: currentFloor,
          }
      }));
      navigate(`/patients/${item?.id}/edit`);
      setMenuOpen(false);
    };

    const handleCloseMenu = () => {
        setMenuOpen(false);
    };

    return (
      <>
        <Box
          key={id}
          className="patient-card"
          sx={{ 
            // We remove 4px compared to staging area width to make border appeared
            width: staged ? '166px' : "calc(100% - 1rem)",
            height: staged ? '50px' : "60px",
            zIndex: 1 
          }}
          ref={ref}
          onContextMenu={handleContextMenu}
        >
          <Box      
              sx={{
                position: staged ? 'block' : "absolute",
                top: "0%",
                left: "1rem",
                width: staged ? '100%' : "calc(100% - 1rem)",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                backgroundColor: item
                  ? palette?.primary.softBg
                  : palette?.neutral.softBg,
                color: palette?.text.primary,
                boxShadow: "inset 0 0 2px rgba(0,0,0,0.06)",
                cursor: mode === "move" ? "grab" : "default",
                userSelect: "none",
                overflow: "hidden",
                transition: "box-shadow 0.2s ease",
                borderBottom: staged ? "2px dashed #aaa" : '',
                // "&:hover": {
                //   boxShadow: `0 0 0 3px ${palette.primary.softActiveBg}`,
                // },
              }}
            >

            {/* Header */}
            <Box
                className="patient"
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  // px: 1.5,
                  gap: 0.5,
                  zIndex: 2,
                  backgroundColor: item
                ?  palette?.primary.softBg
                : palette?.neutral.softBg,
                  pointerEvents: mode === "build" ? "none" : "auto",
                  cursor: mode === "move" ? "grab" : "default",
                }}
            >
              <Box
                data-bed-id={id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  px: 0.5,
                  py: 0.8,
                  backgroundColor: item.section == "3" ? "#f5e7b2ff" : palette?.background.level2,
                  borderBottom: `1px solid ${palette?.divider}`,
                  width: "100%",
                  height: "100%",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 0.8}}>
                  {/* <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <LocalHospitalIcon
                      sx={{ color: palette?.primary.solidBg, fontSize: "1.2rem" }}
                    />
                    <Typography level="title-sm" fontWeight={600}>
                      {item?.name ?? ""}
                    </Typography>
                  </Box> */}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography level="body-sm" >
                    {item?.name?.substring(0, 6)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {
                      item ? (
                      (() => {
                        // Calculate age from birth_day (assumed format: YYYY-MM-DD)
                        const birthDay = item.birth_day;
                        let age = "";
                        if (birthDay) {
                          const birthDate = new Date(birthDay);
                          const today = new Date();
                          age = today.getFullYear() - birthDate.getFullYear();
                          const m = today.getMonth() - birthDate.getMonth();
                          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                            age--;
                          }
                        }
                        return (
                        <>
                          <Typography level="body-sm">
                          <strong>№</strong>{item?.patient_no} {age ? `${age}歳` : ""}
                          </Typography>
                        </>
                        );
                      })()
                      ) : (
                      <Typography
                        level="body-sm"
                        sx={{
                        textAlign: "center",
                        color: palette?.text.tertiary,
                        opacity: 0.7,
                        }}
                      >
                        
                      </Typography>
                      )}
                </Box>
            <PhoneIndicator patientId={item?.id} />
              </Box>
            </Box>
          </Box>
        </Box>

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
            onClick={handleEdit}
            sx={{
              color: palette.primary.solidBg,
              // fontSize: "0.85rem",
              py: '4px',
              px: 0,
              minHeight: 'auto',
              // '&:hover': {
              //   backgroundColor: 'transparent',
              // }
            }}
          >
            編集
          </MenuItem>
          <MenuItem 
            onClick={handleCloseMenu}
            sx={{
              color: palette.text.secondary,
              // fontSize: "0.85rem",
              py: '4px',
              px: 0,
              minHeight: 'auto',
              // '&:hover': {
              //   backgroundColor: 'transparent',
              // }
            }}
          >
            閉じる
          </MenuItem>
        </Menu>
      </>
    );
}

export default Patient;