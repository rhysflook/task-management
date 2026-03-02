/**
 * @file FieldRepeater.jsx
 * @description Redux-connected repeater component for managing dynamic field arrays.
 * Single source of truth: all data stored in Redux.
 * 
 * Usage:
 * <FieldRepeater
 *   fields={bedFields}
 *   feature="rooms"
 *   repeaterName="beds"
 *   title="Beds"
 * />
 */

import { Box } from "@mui/joy";
import { useDispatch, useSelector } from "react-redux";
import RepeaterItem from "./RepeaterItem";
import RepeaterHeader from "./RepeaterHeader";
import RepeaterActions from "./RepeaterActions";
import { defaultFieldShellStyles } from "./repeaterStyles";
import { FeatureContext } from "../../../context/FeatureContext";
import { fieldShell } from "../../../helpers/display/fields";

/**
 * Field Repeater Component
 * 
 * @param {Object} props
 * @param {Object} props.fields - Field definitions for repeated items
 * @param {string} props.feature - Feature name (e.g., "rooms")
 * @param {string} props.repeaterName - Name of this repeater (e.g., "beds")
 * @param {string} [props.title] - Display title above repeater
 * @param {string} [props.addButtonLabel="Add Item"] - Add button text
 * @param {number} [props.minItems=1] - Minimum items (cannot remove below this)
 * @param {number} [props.maxItems] - Maximum items (cannot add above this)
 * @param {Object} [props.fieldShellStyles={}] - Custom styles for field containers
 * @param {string|Object} [props.gridColumns] - Grid layout config
 *   - String: "1fr 1fr" or "repeat(3, 1fr)"
 *   - Object: { xs: "1fr", md: "1fr 1fr", lg: "repeat(3, 1fr)" }
 * @param {number|string} [props.gridGap=2] - Gap between grid items
 * 
 * @example
 * // Simple 2-column grid
 * <FieldRepeater
 *   fields={bedFields}
 *   feature="rooms"
 *   repeaterName="beds"
 *   title="Beds"
 *   gridColumns="1fr 1fr"
 * />
 * 
 * @example
 * // Responsive grid
 * <FieldRepeater
 *   fields={bedFields}
 *   feature="rooms"
 *   repeaterName="beds"
 *   title="Beds"
 *   gridColumns={{ xs: "1fr", md: "1fr 1fr", lg: "repeat(3, 1fr)" }}
 * />
 */
const FieldRepeater = ({
  fields,
  feature,
  repeaterName,
  title,
  addButtonLabel = "Add Item",
  minItems = 1,
  maxItems,
  fieldShellStyles = {},
  gridColumns,
  gridGap = 2,
}) => {
  const dispatch = useDispatch();
  const items = useSelector((state) =>{ 
    return state[feature]?.repeaters?.[repeaterName] || []
  });
  const itemCount = items.length;
  const canAdd = !maxItems || itemCount < maxItems;
  const canRemove = itemCount > minItems;

  const errors = useSelector((state) =>
    state[feature]?.form?.errors?.[repeaterName] || []
  );

  // Context for feature and repeater name
  const featureContext = { feature, repeaterName };
  /**
   * Add a new empty item to the repeater
   * Dispatches addRepeaterItem action to Redux
   */
  const handleAddItem = () => {
    if (canAdd) {
      dispatch({
        type: `${feature}/addRepeaterItem`,
        payload: { repeater: repeaterName }
      });
    }
  };

  /**
   * Remove an item by index
   * Dispatches removeRepeaterItem action to Redux
   * 
   * @param {number} index - Index of item to remove
   */
  const handleRemoveItem = (index) => {
    if (canRemove) {
      dispatch({
        type: `${feature}/removeRepeaterItem`,
        payload: { repeater: repeaterName, index }
      });
    }
  };

  // Merge default field shell styles with custom ones
  const mergedFieldShellStyles = {
    ...defaultFieldShellStyles,
    ...fieldShell,
  };

  /**
   * Determine container layout style
   * Returns grid or flex layout based on gridColumns prop
   * 
   * @returns {Object} CSS-in-JS style object
   */
  const getContainerStyles = () => {
    if (!gridColumns) {
      // Default: flex column layout
      return {
        display: "flex",
        flexDirection: "column",
        gap: gridGap,
      };
    }

    if (typeof gridColumns === "string") {
      // Simple string: "1fr 1fr" or "repeat(3, 1fr)"
      return {
        display: "grid",
        gridTemplateColumns: gridColumns,
        gap: gridGap,
      };
    }

    if (typeof gridColumns === "object") {
      // Responsive object: { xs: "1fr", md: "1fr 1fr" }
      return {
        display: "grid",
        gridTemplateColumns: gridColumns,
        gap: gridGap,
      };
    }

    // Fallback to flex
    return {
      display: "flex",
      flexDirection: "column",
      gap: gridGap,
    };
  };

  return (
    <FeatureContext.Provider value={{ feature, repeaterName }}>
      {/* <Box sx={{ borderTop: "1px solid", borderColor: "divider", pt: 3 }}> */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Optional title header */}
          {title && <RepeaterHeader title={title} itemCount={itemCount} />}
          { errors && errors.length > 0 && (
            <Box sx={{ color: 'red', mb: 2 }}>
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Box>
          )}
          {/* Repeated items container with grid or flex layout */}
          <Box sx={getContainerStyles()}>
            {items.map((item, index) => (
              <RepeaterItem
                key={index}
                fields={fields}
                feature={feature}
                repeaterName={repeaterName}
                index={index}
                onRemove={handleRemoveItem}
                canRemove={canRemove}
                fieldShellStyles={mergedFieldShellStyles}
                itemData={item}
              />
            ))}
          </Box>

            {/* Add button and actions */}
            <RepeaterActions
              onAdd={handleAddItem}
              addButtonLabel={addButtonLabel}
              canAdd={canAdd}
              maxItems={maxItems}
              currentCount={itemCount}
            />
        </Box>
      {/* </Box> */}
    </FeatureContext.Provider>
  );
};

export default FieldRepeater;