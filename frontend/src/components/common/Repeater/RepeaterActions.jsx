// components/common/Repeater/RepeaterActions.jsx

import { Box, Button, Typography } from "@mui/joy";
import { Add as AddIcon } from "@mui/icons-material";

/**
 * Actions component for the repeater
 * Displays add button and limit warnings
 * 
 * @param {Object} props
 * @param {Function} props.onAdd - Callback when add button is clicked
 * @param {string} props.addButtonLabel - Label for the add button
 * @param {boolean} props.canAdd - Whether new items can be added
 * @param {number} [props.maxItems] - Maximum number of items allowed
 * @param {number} props.currentCount - Current number of items
 */
const RepeaterActions = ({
  onAdd,
  addButtonLabel,
  canAdd,
  maxItems,
  currentCount,
}) => {
  const isAtMaxLimit = maxItems && currentCount >= maxItems;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      {/* Add button */}
      <Button
        startDecorator={<AddIcon />}
        variant="outlined"
        onClick={onAdd}
        disabled={!canAdd}
        sx={{
          alignSelf: "flex-start",
          borderStyle: "dashed",
          "&:hover": {
            borderStyle: "dashed",
          },
        }}
      >
        {addButtonLabel}
      </Button>

      {/* Helper text for limits */}
      {isAtMaxLimit && (
        <Typography level="body-sm" sx={{ color: "warning.500" }}>
          最大{maxItems}件まで追加できます
        </Typography>
      )}
    </Box>
  );
};

export default RepeaterActions;