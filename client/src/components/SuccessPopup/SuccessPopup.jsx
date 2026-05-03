import "./SuccessPopup.css";

export default function SuccessPopup({ children }) {
  return (
    <div className="popup-overlay">
      <div className="popup-card">{children}</div>
    </div>
  );
}
