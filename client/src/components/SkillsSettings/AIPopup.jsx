import { useState } from "react";

export default function AIPopup({ onClose }) {
  const [aiInputText, setAiInputText] = useState("");

  return (
    <div className="ai-popup-overlay">
      <div className="ai-popup">
        <div className="ai-popup-header">
          <h2>AI Assistance</h2>
          <button
            className="ai-popup-close"
            onClick={onClose}
            aria-label="Close AI assistance popup"
          >
            <svg
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              width="24"
              height="24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="ai-popup-content">
          <p className="ai-popup-cta">
            Paste your CV here, or type a job title of your preferred vacancy
          </p>
          <textarea
            className="ai-popup-textarea"
            value={aiInputText}
            onChange={(e) => setAiInputText(e.target.value)}
            placeholder="Enter your CV text or job title here..."
            rows="8"
          />
          <div className="ai-popup-buttons">
            <button
              className="ai-popup-btn primary"
              onClick={() => {
                // TODO: Implement Get CV skills functionality
                console.log("Get CV skills clicked");
              }}
            >
              Get CV skills
            </button>
            <button
              className="ai-popup-btn secondary"
              onClick={() => {
                // TODO: Implement Get vacancy skills functionality
                console.log("Get vacancy skills clicked");
              }}
            >
              Get vacancy skills
            </button>
            <button
              className="ai-popup-btn proceed"
              onClick={() => {
                // TODO: Implement Proceed functionality
                console.log("Proceed clicked");
                onClose();
              }}
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
