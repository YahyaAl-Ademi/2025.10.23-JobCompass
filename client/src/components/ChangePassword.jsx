import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { gif } from "../assets/index.js";

function getPasswordFieldState(current, next, confirm) {
  const hasAnyPassword = Boolean(
    current.trim() || next.trim() || confirm.trim(),
  );
  const hasAllPasswords = Boolean(
    current.trim() && next.trim() && confirm.trim(),
  );
  return { hasAnyPassword, hasAllPasswords };
}

export default function ChangePassword({
  onKeyDown,
  clearAlert,
  currentPassword,
  newPassword,
  confirmPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  isLoading,
}) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmationPassword, setShowConfirmationPassword] =
    useState(false);

  function dispatchPasswordEdit(nextCurrent, nextNew, nextConfirm, applyValue) {
    const { hasAnyPassword, hasAllPasswords } = getPasswordFieldState(
      nextCurrent,
      nextNew,
      nextConfirm,
    );
    if (hasAnyPassword || !hasAllPasswords) {
      clearAlert();
    }
    applyValue();
  }

  function handleCurrentPasswordChange(value) {
    dispatchPasswordEdit(value, newPassword, confirmPassword, () =>
      onCurrentPasswordChange(value),
    );
  }

  function handleNewPasswordChange(value) {
    dispatchPasswordEdit(currentPassword, value, confirmPassword, () =>
      onNewPasswordChange(value),
    );
  }

  function handleConfirmPasswordChange(value) {
    dispatchPasswordEdit(currentPassword, newPassword, value, () =>
      onConfirmPasswordChange(value),
    );
  }

  return (
    <div className="profile-section">
      <h3 className="profile-section-title">
        Change password{" "}
        {isLoading && (
          <img src={gif.spinner} alt="Loading..." className="spinner" />
        )}
      </h3>
      <div className="profile-password-single">
        <label className="profile-field-label">
          Type your current password
        </label>
        <div className="profile-input-wrapper">
          <input
            id="currentPasswordInput"
            type={showCurrentPassword ? "text" : "password"}
            value={currentPassword}
            placeholder="Type 8 characters or more"
            className="profile-input profile-input-with-icon"
            onKeyDown={onKeyDown}
            onChange={(e) => handleCurrentPasswordChange(e.target.value)}
          />
          {showCurrentPassword ? (
            <EyeOff
              size={18}
              className="profile-input-icon"
              onClick={() => setShowCurrentPassword(false)}
            />
          ) : (
            <Eye
              size={18}
              className="profile-input-icon"
              onClick={() => setShowCurrentPassword(true)}
            />
          )}
        </div>
      </div>
      <div className="profile-fields-grid">
        <div>
          <label className="profile-field-label">Set new password</label>
          <div className="profile-input-wrapper">
            <input
              id="newPasswordInput"
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              placeholder="Type 8 characters or more"
              className="profile-input profile-input-with-icon"
              onKeyDown={onKeyDown}
              onChange={(e) => handleNewPasswordChange(e.target.value)}
            />
            {showNewPassword ? (
              <EyeOff
                size={18}
                className="profile-input-icon"
                onClick={() => setShowNewPassword(false)}
              />
            ) : (
              <Eye
                size={18}
                className="profile-input-icon"
                onClick={() => setShowNewPassword(true)}
              />
            )}
          </div>
        </div>

        <div>
          <label className="profile-field-label">Confirm password</label>
          <div className="profile-input-wrapper">
            <input
              id="confirmPasswordInput"
              type={showConfirmationPassword ? "text" : "password"}
              value={confirmPassword}
              placeholder="Write the same password again"
              className="profile-input profile-input-with-icon"
              onKeyDown={onKeyDown}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
            />
            {showConfirmationPassword ? (
              <EyeOff
                size={18}
                className="profile-input-icon"
                onClick={() => setShowConfirmationPassword(false)}
              />
            ) : (
              <Eye
                size={18}
                className="profile-input-icon"
                onClick={() => setShowConfirmationPassword(true)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
