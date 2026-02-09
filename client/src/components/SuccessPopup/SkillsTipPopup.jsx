import "./SkillsTipPopup.css";

export default function SkillsTipPopup({ onClose }) {
  return (
    <div
      className="skills-tip-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="skills-tip-title"
    >
      <div className="skills-tip-card">
        <button
          className="skills-tip-close"
          type="button"
          onClick={onClose}
          aria-label="Close tips"
        >
          X
        </button>
        <h4 className="skills-tip-title" id="skills-tip-title">
          Skill matching tips
        </h4>
        <ul className="skills-tip-list">
          <li>
            {`Our algorithm is case-insensitive and treats letters and symbols as 
            meaningful, punctuation marks and spaces between words as a single 
            separator. As a result, "data analysis" will match "Data / Analysis" 
            and "RESTful" will not be marked as corresponding to "REST". Thus,
            choose your skills carefully, perhaps adding a few to cover a variety
            of word forms.`}
          </li>
          <li>
            {`As a rule, use short, separate words for each skill, thereby
            increasing the likelihood of a match, unless such separation leads
            to a loss of context, as in the case of "Google Maps" or
            "Supply-Chain Management."`}
          </li>
          <li>
            {`We recommend excluding "soft skills". They may or may not be present
            in job descriptions, and many of them are self-evident. This makes
            their search useless in most cases, especially for technically
            oriented roles where knowledge of technology plays a crucial role in
            making the first decision in the HR department.`}
          </li>
          <li>
            {`Incorrect matches are possible, for example, the verb "react" may be
            mistaken for the "React" (framework). The number of such
            misidentified skills is considered insignificant.`}
          </li>
        </ul>
      </div>
    </div>
  );
}
