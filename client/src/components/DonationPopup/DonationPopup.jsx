import { useNavigate } from "react-router-dom";
import "./DonationPopup.css";
import { ExternalLink, HelpingHand } from "lucide-react";
import handleKeyDown from "../../util/handleKeyDown";
import { UseUser } from "../../context/UserContext.jsx";

export default function DonationPopup({ onClose }) {
  const { user } = UseUser();
  const donationUrl = user.time_to_donate;
  const navigate = useNavigate();

  function handleUnderstood() {
    window.open(donationUrl, "_blank", "noopener,noreferrer");
    onClose();
    navigate("/");
  }

  return (
    <div className="popup-overlay">
      <div className="donation-popup-card">
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
            <HelpingHand size={16} />
            <ExternalLink size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
