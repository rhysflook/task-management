// components/common/Repeater/RepeaterHeader.jsx

import { Box, Typography } from "@mui/joy";

/**
 * Header component for the repeater
 * Displays title and item count
 * 
 * @param {Object} props
 * @param {string} props.title - The title to display
 * @param {number} props.itemCount - The current number of items
 */
const RepeaterHeader = ({ title, itemCount }) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Typography level="h4" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      <Typography level="body-sm" sx={{ color: "text.tertiary" }}>
        合計{itemCount}件
      </Typography>
    </Box>
  );
};

export default RepeaterHeader;