/**
 * Resolve display value for a table cell
 * Handles both static valueMap and dynamic options
 * 
 * @param {*} value - Raw value from database (e.g., 1, "uuid-123")
 * @param {Object} column - Column definition
 * @param {Object} formData - Form data containing dynamic options
 * @returns {string} Display value
 */
export const resolveDisplayValue = (value, column, formData) => {
    // Case 1: Static valueMap
    if (column.valueMap && value !== null && value !== undefined) {
      const result = column.valueMap[value] ?? value;
      return result;
    }
    
    // Case 2: Dynamic options
    // if (column.type === 'select') {
    //   const options = formData?.data?.options?.[column.key] || formData?.[column.key];
      
    //   if (options && Array.isArray(options)) {
    //     const option = options.find(
    //       opt => String(opt.id) === String(value)
    //     );
        
    //     const result = option?.name ?? value;
    //     return result;
    //   }
    // }
    
    // Case 3: Regular value
    return value;
  };