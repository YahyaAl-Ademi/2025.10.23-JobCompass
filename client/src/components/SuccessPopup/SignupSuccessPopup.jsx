import { UseUser } from "../../context/UserContext";
import handleKeyDown from "../../util/handleKeyDown";
import SuccessPopup from "./SuccessPopup";

export default function SignupSuccessPopup({ goToProfile }) {
  const { user } = UseUser();
  return (
    <SuccessPopup>
      <h2>Welcome {user?.first_name}</h2>
      <p>
        You successfully signed up and logged in! Manage your skill set and
        address in your profile to get the most relevant jobs.
      </p>
      <div className="popup-buttons">
        <button
          className="btn-primary"
          autoFocus
          onClick={goToProfile}
          onKeyDown={(e) => handleKeyDown(e, goToProfile)}
        >
          Go to Profile
        </button>
      </div>
    </SuccessPopup>
  );
}
