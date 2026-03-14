import { useState, useCallback } from "react";
import { DELAYED_CLEAR_INTERVAL } from "../util/constants";

/**
 * Unified alert state and helpers. Use in place of local alert state + handleClearAlert + delayedClearAlert.
 * @returns {{ alert: { type: string, message: string }, setAlert: function, clearAlert: function, delayedClearAlert: function }}
 */
export default function useAlert() {
  const [alert, setAlert] = useState({ type: "", message: "" });

  const clearAlert = useCallback(() => {
    setAlert({ type: "", message: "" });
  }, []);

  const delayedClearAlert = useCallback(() => {
    const id = setTimeout(() => {
      setAlert({ type: "", message: "" });
    }, DELAYED_CLEAR_INTERVAL);
    return () => clearTimeout(id);
  }, []);

  return { alert, setAlert, clearAlert, delayedClearAlert };
}
