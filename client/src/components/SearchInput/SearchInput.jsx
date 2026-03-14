import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { UseJobs } from "../../context/JobsContext";
import AlertMessage from "../AlertMessage/AlertMessage";
import validateJobInput from "../../util/searchValidation";
import useAlert from "../../hooks/useAlert";
import "./SearchInput.css";
import cleanUpText from "../../util/cleanUpText";

export default function SearchInput() {
  const { setSearchString, setAllJobs, performJobFetch } = UseJobs();
  const { alert, setAlert } = useAlert();
  const inputRef = useRef(null);
  const navigate = useNavigate();

  async function handleSearch() {
    const inputValue = cleanUpText(inputRef.current?.value ?? "");
    const validationError = validateJobInput({ text: inputValue });
    if (validationError) {
      setAlert(validationError);
      return;
    }

    setAllJobs([]);
    setAlert({ type: "info", message: `Searching for "${inputValue}"...` });
    setSearchString(inputValue);
    performJobFetch({
      method: "POST",
      body: { search_string: inputValue },
      credentials: "include",
    });
    navigate("/jobs");
    // clear the visible input field while keeping `searchString` in context
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="search-input">
      <label htmlFor="job-search" className="search-label">
        Enter job title
      </label>
      <div className="input-group">
        <input
          ref={inputRef}
          id="job-search"
          type="text"
          placeholder="e.g. web developer"
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          aria-describedby="search-alert"
        />
        <button onClick={handleSearch}>Search</button>
      </div>
      {alert.message && (
        <AlertMessage type={alert.type} message={alert.message} />
      )}
    </div>
  );
}
