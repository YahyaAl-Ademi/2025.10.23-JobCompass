import handleKeyDown from "../../util/handleKeyDown";
import SuccessPopup from "./SuccessPopup";

export default function PopupForSave({
  title = "Want to save your settings?",
  message = "Log in to hop on board!",
  handleLoginRedirect,
  setShowSavePopup,
}) {
  return (
    <SuccessPopup>
      <h2>{title}</h2>
      <p>{message}</p>
      <div className="popup-buttons">
        <button
          className="btn-primary"
          onClick={handleLoginRedirect}
          onKeyDown={(e) => handleKeyDown(e, handleLoginRedirect)}
        >
          Log in
        </button>
        <button
          className="btn-secondary"
          onClick={() => setShowSavePopup(false)}
          onKeyDown={(e) => handleKeyDown(e, () => setShowSavePopup(false))}
        >
          Cancel
        </button>
      </div>
    </SuccessPopup>
  );
}
