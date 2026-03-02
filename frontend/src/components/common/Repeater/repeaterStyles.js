// components/Repeater/repeaterStyles.js

/**
 * Default field shell styles for the repeater
 * Can be overridden by passing custom styles
 */
export const defaultFieldShellStyles = {
    display: "flex",
    flexDirection: "column",
    gap: 0.5,
    "& > label, & .field-label": {
      fontSize: "0.875rem",
      color: "text.secondary",
      fontWeight: 600,
    },
    "& .MuiInput-root, & .MuiSelect-root, & .MuiInputBase-root": {
      borderRadius: "10px",
      bgcolor: "background.level1",
      transition: "box-shadow .15s ease, background-color .15s ease",
    },
    "& .MuiInput-root:focus-within, & .MuiInputBase-root:focus-within": {
      boxShadow: "0 0 0 3px var(--joy-palette-primary-softActiveBg)",
      bgcolor: "background.surface",
    },
  };