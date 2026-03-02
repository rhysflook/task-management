// src/components/common/Repeater/index.js

/**
 * Barrel export for Repeater components
 * Provides clean imports for consumers
 */

// Import the main component
import FieldRepeater from "./FieldRepeater";

// Export as default
export default FieldRepeater;

// Also export named exports if needed
export { default as FieldRepeater } from "./FieldRepeater";
export { default as RepeaterItem } from "./RepeaterItem";
export { default as RepeaterHeader } from "./RepeaterHeader";
export { default as RepeaterActions } from "./RepeaterActions";
export { defaultFieldShellStyles } from "./repeaterStyles";