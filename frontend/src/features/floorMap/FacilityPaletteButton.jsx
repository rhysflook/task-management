// src/features/floorMap/FacilityPaletteButton.jsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import Box from '@mui/joy/Box';
import { addItem } from '../../stores/reducers/unitMapSlice';
import { FACILITY_KINDS } from './facilityConfig';

export default function FacilityPaletteButton() {
  const dispatch = useDispatch();
  const currentFloor = useSelector((s) => s.unitMaps.currentFloor);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handlePick = (kind) => {
    const conf = FACILITY_KINDS[kind];
    if (!conf) return;

    const { w, h } = conf.defaultSize || { w: 80, h: 80 };

    dispatch(
      addItem({
        floor: currentFloor,
        item: {
          type: 'facility',
          kind,
          x: 60,
          y: 40,
          w,
          h,
          is_utility: true,
          icon: kind, // or conf.icon, depending on how you use it on the map
        },
      }),
    );

    handleClose();
  };

  return (
    <>
      <Tooltip title="設備を追加">
        <IconButton color="inherit" onClick={handleOpen} aria-label="add facility">
          <AddCircleOutlineIcon />
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        keepMounted
        slotProps={{
          paper: {
            sx: {
              p: 1.25,
              borderRadius: 2,
              boxShadow: '0 10px 24px rgba(0,0,0,0.12)',
            },
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 44px)',
            gap: 1,
            p: 0.25,
          }}
        >
          {Object.entries(FACILITY_KINDS).map(([kind, conf]) => (
            <Tooltip key={kind} title={conf.label} placement="top">
              <IconButton
                size="small"
                onClick={() => handlePick(kind)}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '12px',
                  bgcolor: 'background.paper',
                  boxShadow: 'inset 0 0 0 1px var(--mui-palette-divider)',
                  '&:hover': {
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2)',
                    bgcolor: 'background.default',
                  },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  component="img"
                  src={conf.icon}           // ← ここが PNG パス
                  alt={conf.label}
                  sx={{
                    width: 24,
                    height: 24,
                    objectFit: 'contain',
                    // 必要なら色付き背景など
                    // filter: conf.color ? `drop-shadow(0 0 2px ${conf.color})` : undefined,
                  }}
                />
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Popover>
    </>
  );
}
