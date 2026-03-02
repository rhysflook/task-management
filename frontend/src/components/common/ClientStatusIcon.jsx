import React, { useState, useEffect } from "react";
import { Box } from "@mui/joy";
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

const BLINK_INTERVAL_MS = import.meta.env.VITE_IS_ALIVE_WARNING_BLINK_RATE
  ? parseInt(import.meta.env.VITE_IS_ALIVE_WARNING_BLINK_RATE, 10)
  : 500;

/**
 * ClientStatusIcon Component
 * Displays warning icon when client is not alive
 * - Shows nothing when isAlive is true
 * - Shows blinking warning icon when isAlive is false
 * 
 * @param {boolean|null} isAlive - Connection status from parent component
 */
const ClientStatusIcon = ({ isAlive }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Blinking effect when disconnected
    if (isAlive === false) {
      const blinkInterval = setInterval(() => {
        setIsVisible((prev) => !prev);
      }, BLINK_INTERVAL_MS);

      return () => clearInterval(blinkInterval);
    } else {
      setIsVisible(true);
    }
  }, [isAlive]);

  // Don't render anything if isAlive is true or null
  if (isAlive !== false) {
    return null;
  }

  return (
    <Box
      sx={{
        position: "absolute",
        top: 8,
        right: 8,
        zIndex: 10,
        color: "#d32f2f",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.3s ease-in-out",
      }}
    >
      <WarningAmberIcon fontSize="medium" />
    </Box>
  );
};

export default ClientStatusIcon;