import { useState } from "react";
import useFetch from "../../hooks/useFetch";
import { gif } from "../../assets/index.js";
import AlertMessage from "../AlertMessage/AlertMessage";
import { DELAYED_CLEAR_INTERVAL } from "../../util/constants";

export default function AIPopup({ onClose, onSkillsReceived }) {
  const [aiInputText, setAiInputText] = useState("");
  const [alert, setAlert] = useState({ type: "", message: "" });

  function handleClearAlert() {
    setAlert({ type: "", message: "" });
  }
  function delayedClearAlert() {
    setTimeout(() => {
      handleClearAlert();
    }, DELAYED_CLEAR_INTERVAL);
  }

  let { isLoading, error, performFetch } = useFetch(
    "/ai/assist-skills",
    (result) => {
      if (onSkillsReceived) {
        if (
          result.skills &&
          Array.isArray(result.skills) &&
          result.skills.length > 0
        ) {
          onSkillsReceived(result.skills);
        } else {
          setAlert({
            type: "error",
            message:
              "AI failed to generate skills based on the provided prompt.",
          });
          delayedClearAlert();
        }
      }
    },
  );

  if (error) {
    setAlert({
      type: "error",
      message: error?.message || "AI service returned an error.",
    });
    delayedClearAlert();
  }

  async function handleGetSkills(type) {
    handleClearAlert();
    performFetch({
      method: "POST",
      body: JSON.stringify({ type, prompt: aiInputText }),
    });
  }

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
          {alert.message && (
            <AlertMessage type={alert.type} message={alert.message} />
          )}
          <div className="ai-popup-buttons">
            <button
              className="ai-popup-btn primary"
              onClick={() => handleGetSkills("CV")}
              disabled={isLoading || !aiInputText.trim()}
            >
              {isLoading ? "Extracting..." : "Get CV skills"}
              {isLoading && (
                <img src={gif.spinner} alt="Loading..." className="spinner" />
              )}
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
