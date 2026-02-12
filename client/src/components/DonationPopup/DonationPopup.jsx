import { useNavigate } from "react-router-dom";
import "./DonationPopup.css";
import { ExternalLink } from "lucide-react";
import handleKeyDown from "../../util/handleKeyDown";

export default function DonationPopup({ onClose }) {
  const donationUrl = import.meta.env.VITE_DONATION_URL;
  const navigate = useNavigate();

  function handleUnderstood() {
    window.open(donationUrl, "_blank", "noopener,noreferrer");
    onClose();
    navigate("/");
  }

  return (
    <div className="popup-overlay">
      <div className="donation-popup-card">
        <div className="donation-icon-container">
          <div className="heart-icon">❤️</div>
        </div>
        <h2>Support Our Mission</h2>
        <p className="donation-message">
          {`You successfully logged in, and we are glad that our application
          turned out to be useful for you. We will be grateful for your support,
          as it currently only brings costs: we need to pay data providers
          ~€70/month, and our customer base is practically non-existent.`}
        </p>
        <div className="popup-buttons">
          <button
            className="btn-donation"
            autoFocus
            onClick={handleUnderstood}
            onKeyDown={(e) => handleKeyDown(e, handleUnderstood)}
          >
            <span>Understood</span>
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
