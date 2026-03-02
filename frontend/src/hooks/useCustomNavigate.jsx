// hooks/useCustomNavigate.js
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { getClearRedirectActions } from "../stores/helpers/navigationHelper";

/**
 * Custom navigate hook that clears all form redirect states after navigation
 * @returns {Function} customNavigate function
 */
export default function useCustomNavigate() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const customNavigate = useCallback(
    (to, options) => {
      navigate(to, options);
      
      // Clear redirect state for all form slices
      const clearActions = getClearRedirectActions();
      clearActions.forEach(action => dispatch(action));
    },
    [navigate, dispatch]
  );
  
  return customNavigate;
}