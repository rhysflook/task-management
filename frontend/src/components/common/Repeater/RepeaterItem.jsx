/**
 * @file RepeaterItem.jsx
 * @description Single repeater item component - Redux connected
 * Renders all fields for one repeated entry
 */

import { Box, IconButton } from "@mui/joy";
import { Delete as DeleteIcon } from "@mui/icons-material";
import { getFieldComponent } from "../../../helpers/formFieldMap";
import { useSelector } from "react-redux";

/**
 * Single repeater item component
 * 
 * @param {Object} props
 * @param {Object} props.fields - Field definitions
 * @param {string} props.feature - Feature name (e.g., "rooms")
 * @param {string} props.repeaterName - Repeater name (e.g., "beds")
 * @param {number} props.index - Item index in the array
 * @param {Function} props.onRemove - Remove callback
 * @param {boolean} props.canRemove - Whether removal is allowed
 * @param {Object} props.fieldShellStyles - Custom field styles
 * @param {Object} props.itemData - Current item data from Redux
 */
const RepeaterItem = ({
  fields,
  feature,
  repeaterName,
  index,
  onRemove,
  canRemove,
  fieldShellStyles,
  itemData,
}) => {
  const handleRemove = () => {
    onRemove(index);
  };

  const errors = useSelector((state) => 
    state[feature]?.form?.errors || {}
  );
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: "8px",
        bgcolor: "background.level1",
        border: "1px solid",
        borderColor: "divider",
        position: "relative",
        transition: "all 0.2s ease",
        "&:hover": {
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* Remove button */}
      {canRemove && (
        <IconButton
          size="sm"
          variant="plain"
          color="danger"
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            opacity: 0.7,
            transition: "opacity 0.2s ease",
            "&:hover": { opacity: 1 },
          }}
          onClick={handleRemove}
          aria-label={`Remove item ${index + 1}`}
        >
          <DeleteIcon />
        </IconButton>
      )}

      {/* Render all fields for this item */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }} className="repeater-item">
        {Object.entries(fields)
          .filter(([key]) => !key.match(/_\d+$/))
          .map(([key, field]) => {
            const value = itemData?.[key] ?? field.value ?? "";
            return (
              <Box key={`${index}-${key}`} sx={fieldShellStyles} className={`field-shell ${key}`}>
                {getFieldComponent(
                  field.type,
                  {
                    ...field,
                    id: `${field.id}_${index}`,
                    // Pass Redux context for repeater fields
                    repeaterContext: {
                      repeater: repeaterName,
                      index,
                      fieldKey: key,
                    },
                    errors: errors[`${repeaterName}.${index}.${field.id}`] || [],
                    // Pass current value for display
                    controlledValue: value,
                  },
                  feature
                )}
              </Box>
            );
          })}
      </Box>
    </Box>
  );
};

export default RepeaterItem;