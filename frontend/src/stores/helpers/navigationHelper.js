/**
 * Navigation helper to clear redirect states across all form slices
 * Keeps navigation logic centralized and avoids circular dependencies
 */

/**
 * List of all slice names that use redirect functionality
 * Add new slices here as needed
 */
export const SLICES_WITH_REDIRECT = [
    'patients',
    // Add more as needed
  ];
  
  /**
   * Creates clear redirect actions for all registered slices
   * @returns {Array} Array of action objects to dispatch
   */
  export const getClearRedirectActions = () => {
    return SLICES_WITH_REDIRECT.map(sliceName => ({
      type: `${sliceName}/clearRedirectAfterSave`
    }));
  };