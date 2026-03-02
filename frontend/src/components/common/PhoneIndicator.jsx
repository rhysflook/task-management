import React, { useState, useEffect } from "react";
import { Box } from "@mui/joy";
import PhoneInTalkIcon from '@mui/icons-material/PhoneInTalk';
import { useSelector } from "react-redux";

const BLINK_INTERVAL_MS = import.meta.env.VITE_IS_ALIVE_WARNING_BLINK_RATE
  ? parseInt(import.meta.env.VITE_IS_ALIVE_WARNING_BLINK_RATE, 10)
  : 500;


const PhoneIndicator = ({ patientId }) => {
  const [isVisible, setIsVisible] = useState(true);
  const { inCallPatients } = useSelector((state) => state.unitMaps);

  useEffect(() => {
    // Blinking effect when disconnected
    if (inCallPatients[patientId]) {
      const blinkInterval = setInterval(() => {
        setIsVisible((prev) => !prev);
      }, BLINK_INTERVAL_MS);

      return () => clearInterval(blinkInterval);
    } else {
      setIsVisible(true);
    }
  }, [inCallPatients]);
  if (!inCallPatients[patientId]) {
    return null;
  }

  return (
    <Box
      sx={{
        zIndex: 10,
        color: "#0087e0ff",
        opacity: isVisible ? 1 : 0,
        transition: "opacity 0.3s ease-in-out",
      }}
    >
      <PhoneInTalkIcon fontSize="medium" />
    </Box>
  );
};

export default PhoneIndicator;