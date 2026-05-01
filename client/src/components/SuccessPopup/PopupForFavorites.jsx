import handleKeyDown from "../../util/handleKeyDown";
import SuccessPopup from "./SuccessPopup";

export default function PopupForFavorites({
  handleLoginRedirect,
  setShowPopup,
}) {
  return (
    <SuccessPopup>
      <h2>Want to save this job post for later?</h2>
      <p>Log in to hop on board!</p>
      <div className="popup-buttons">
        <button
          className="btn-primary"
          autoFocus
          onClick={handleLoginRedirect}
          onKeyDown={(e) => handleKeyDown(e, handleLoginRedirect)}
        >
          Log in
        </button>
        <button
          className="btn-secondary"
          onClick={() => setShowPopup(false)}
          onKeyDown={(e) => handleKeyDown(e, () => setShowPopup(false))}
        >
          Cancel
        </button>
      </div>
    </SuccessPopup>
  );
}
