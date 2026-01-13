import "./Pagination.css";
import { useState, useEffect } from "react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const safeTotal = Number.isFinite(totalPages)
    ? Math.max(0, Math.floor(totalPages))
    : 0;

  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(currentPage);

  // Sync internal state when prop changes, but avoid overwriting while editing
  useEffect(() => {
    if (!isEditing) {
      setInputValue(currentPage);
    }
  }, [currentPage, isEditing]);

  if (safeTotal === 0) return null;

  const submitPage = () => {
    let page = parseInt(inputValue, 10);

    if (isNaN(page)) {
      setInputValue(currentPage);
      setIsEditing(false);
      return;
    }

    // Clamp the value between 1 and safeTotal
    const validatedPage = Math.min(Math.max(page, 1), safeTotal);
    onPageChange(validatedPage);
    setIsEditing(false);
  };

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
        disabled={currentPage === 1}
        className="pagination-btn"
      >
        Prev
      </button>

      <div className="page-numbers">
        {isEditing ? (
          <input
            className="page-number-btn active"
            type="number"
            autoFocus
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            // Use onKeyDown to trigger submit
            onKeyDown={(e) => {
              if (e.key === "Enter") submitPage();
              if (e.key === "Escape") {
                setInputValue(currentPage);
                setIsEditing(false);
              }
            }}
            // If they click away, save the page or cancel
            onBlur={submitPage}
          />
        ) : (
          <button
            className="page-number-btn active"
            onClick={() => setIsEditing(true)}
          >
            {currentPage}
          </button>
        )}
      </div>

      <button
        onClick={() => onPageChange(Math.min(currentPage + 1, safeTotal))}
        disabled={currentPage === safeTotal}
        className="pagination-btn"
      >
        Next
      </button>

      <span className="ellipsis">out of {safeTotal}</span>
    </div>
  );
}
