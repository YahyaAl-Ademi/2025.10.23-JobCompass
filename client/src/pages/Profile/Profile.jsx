import { useState, useRef, useEffect } from "react";
import SkillsSettings from "../../components/SkillsSettings/SkillsSettings";
import AddressSettings from "../../components/AddressSettings/AddressSettings";
import AlertMessage from "../../components/AlertMessage/AlertMessage";
import ChangePassword from "../../components/ChangePassword";
import cleanUpText from "../../util/cleanUpText";
import validateAddressTextInputs from "../../util/addressTextsValidation";
import validateHouseNoInput from "../../util/addressHouseNoValidation";
import {
  validatePassword,
  validatePasswordMatch,
} from "../../util/AuthValidation";
import { UseUser } from "../../context/UserContext";
import useFetch from "../../hooks/useFetch";
import AvatarUploader from "../../components/AvatarUploader/AvatarUploader";
import DeleteProfilePopup from "../../components/DeleteProfilePopup/DeleteProfilePopup";
import { DELAYED_CLEAR_INTERVAL } from "../../util/constants";
import "./Profile.css";
import { gif } from "../../assets/index.js";

export default function Profile() {
  const [alert, setAlert] = useState({ type: "", message: "" });
  const first_nameInputRef = useRef("");
  const last_nameInputRef = useRef("");
  const streetInputRef = useRef("");
  const houseInputRef = useRef("");
  const cityInputRef = useRef("");
  const countryInputRef = useRef("");
  const currentPasswordInputRef = useRef("");
  const newPasswordInputRef = useRef("");
  const confirmPasswordInputRef = useRef("");
  const { user, dispatch } = UseUser();
  const [showDeletePopup, setShowDeletePopup] = useState(false);

  function handleClearAlert() {
    setAlert({ type: "", message: "" });
  }

  function delayedClearAlert() {
    setTimeout(() => {
      handleClearAlert();
    }, DELAYED_CLEAR_INTERVAL);
  }

  useEffect(() => {
    if (!user) return;

    if (first_nameInputRef.current)
      first_nameInputRef.current.value = user.first_name ?? "";
    if (last_nameInputRef.current)
      last_nameInputRef.current.value = user.last_name ?? "";
    if (streetInputRef.current)
      streetInputRef.current.value = user.street ?? "";
    if (houseInputRef.current)
      houseInputRef.current.value = user.house_number ?? "";
    if (cityInputRef.current) cityInputRef.current.value = user.city ?? "";
    if (countryInputRef.current)
      countryInputRef.current.value = user.country ?? "";

    if (currentPasswordInputRef.current)
      currentPasswordInputRef.current.value = "";
    if (newPasswordInputRef.current) newPasswordInputRef.current.value = "";
    if (confirmPasswordInputRef.current)
      confirmPasswordInputRef.current.value = "";
  }, [user]);

  const { error, isLoading, performFetch } = useFetch(
    "/users/profile",
    (data) => {
      dispatch({
        type: "UPDATE_USER",
        payload: {
          ...data.user,
          skills: Array.isArray(data.user.skills) ? data.user.skills : [],
        },
      });
      setAlert({ type: "success", message: "Profile updated successfully!" });
      delayedClearAlert();
    },
  );

  useEffect(() => {
    if (error) setAlert({ type: "error", message: String(error) });
    delayedClearAlert();
  }, [error]);

  function handleDeleteClick() {
    setShowDeletePopup(true);
  }

  function getPasswordChangeValues() {
    const currentPassword = currentPasswordInputRef?.current?.value;
    const newPassword = newPasswordInputRef?.current?.value;
    const confirmPassword = confirmPasswordInputRef?.current?.value;

    let result = {
      passwordValidationError: null,
      currentPassword: null,
      newPassword: null,
    };

    if (currentPassword || newPassword || confirmPassword) {
      if (!(newPassword && confirmPassword && currentPassword)) {
        result.passwordValidationError = {
          type: "error",
          message: "To change your password, please fill in all fields.",
        };
      } else if (!validatePassword(newPassword)) {
        result.passwordValidationError = {
          type: "error",
          message:
            "Password must be at least 8 characters and meet at least 2 complexity rules.",
        };
      } else {
        const matchCheck = validatePasswordMatch(newPassword, confirmPassword);
        if (!matchCheck.valid) {
          result.passwordValidationError = {
            type: "error",
            message: matchCheck.message,
          };
        } else {
          result.currentPassword = currentPassword;
          result.newPassword = newPassword;
        }
      }
    }

    return result;
  }

  function handleSaveClick() {
    handleClearAlert();

    const { passwordValidationError, currentPassword, newPassword } =
      getPasswordChangeValues();

    const updatedFields = {};

    const first_name = cleanUpText(first_nameInputRef?.current.value);
    const last_name = cleanUpText(last_nameInputRef?.current.value);
    const street = cleanUpText(streetInputRef?.current.value);
    const house_number = cleanUpText(houseInputRef?.current.value);
    const city = cleanUpText(cityInputRef?.current.value);
    const country = cleanUpText(countryInputRef?.current.value);

    const streetValidationError = validateAddressTextInputs({ text: street });
    const cityValidationError = validateAddressTextInputs({
      text: city,
      type: "city",
    });
    const countryValidationError = validateAddressTextInputs({
      text: country,
      type: "country",
    });
    const houseValidationError = validateHouseNoInput({ text: house_number });

    const validationError =
      streetValidationError ||
      cityValidationError ||
      countryValidationError ||
      houseValidationError ||
      passwordValidationError;

    if (validationError) {
      setAlert(validationError);
      delayedClearAlert();
    } else {
      if (first_name !== user.first_name) updatedFields.first_name = first_name;
      if (last_name !== user.last_name) updatedFields.last_name = last_name;
      if (street !== user.street) updatedFields.street = street;
      if (city !== user.city) updatedFields.city = city;
      if (country !== user.country) updatedFields.country = country;
      if (house_number !== user.house_number)
        updatedFields.house_number = house_number;
      if (currentPassword && newPassword) {
        updatedFields.currentPassword = currentPassword;
        updatedFields.newPassword = newPassword;
      }

      if (Object.keys(updatedFields).length === 0) {
        setAlert({ type: "info", message: "No changes detected." });
        delayedClearAlert();
      } else {
        performFetch({
          method: "PUT",
          body: JSON.stringify(updatedFields),
          credentials: "include",
        });
      }
    }
  }

  function pressEnterKey(e) {
    if (e.key === "Enter") handleSaveClick();
  }

  return (
    <div className="profile-container">
      <h1 className="profile-title">Profile</h1>

      <div className="profile-avatar-row">
        {/* <!-- Avatar with the editing/updating button --> */}
        <AvatarUploader setAlert={setAlert} />
        <div className="avatar-uploader-info">
          <h3 className="avatar-uploader-title">Profile photo</h3>
          <span className="avatar-uploader-subtitle">
            Upload a new profile picture
          </span>
        </div>
      </div>

      <div className="flex-grow">
        {/* <!-- First and Last Name --> */}
        <h3 className="basic-info-title">Basic information</h3>
        <div className="profile-fields">
          <div className="profile-info-left">
            <label className="profile-field-label">First name</label>
            <input
              ref={first_nameInputRef}
              type="text"
              defaultValue={user?.first_name || ""}
              className="profile-input"
              onKeyDown={pressEnterKey}
              onChange={handleClearAlert}
            />
          </div>
          <div className="profile-info">
            <label className="profile-field-label">Last name</label>
            <input
              ref={last_nameInputRef}
              type="text"
              defaultValue={user?.last_name || ""}
              className="profile-input"
              onKeyDown={pressEnterKey}
              onChange={handleClearAlert}
            />
          </div>
        </div>
      </div>

      <div className="profile-section">
        <h3 className="profile-section-title">Address</h3>
        <AddressSettings
          streetInputRef={streetInputRef}
          houseInputRef={houseInputRef}
          cityInputRef={cityInputRef}
          countryInputRef={countryInputRef}
          clearAlert={handleClearAlert}
        />
      </div>

      <ChangePassword
        onKeyDown={pressEnterKey}
        clearAlert={handleClearAlert}
        currentPasswordInputRef={currentPasswordInputRef}
        newPasswordInputRef={newPasswordInputRef}
        confirmPasswordInputRef={confirmPasswordInputRef}
        isLoading={isLoading}
      />
      {/* <!-- Save Button --> */}
      <div className="profile-save-row">
        {alert.message && (
          <div className="md:w-auto">
            <AlertMessage type={alert.type} message={alert.message} />
          </div>
        )}
        <div>
          <button
            id="saveBtn"
            onClick={handleSaveClick}
            className="profile-save-btn"
          >
            Save
            {isLoading && (
              <img src={gif.spinner} alt="Loading..." className="spinner" />
            )}
          </button>
        </div>
      </div>
      <SkillsSettings />
      {/* DELETE PROFILE */}
      <div className="profile-delete-row">
        <div>
          <h3 className="profile-delete-title">Delete profile</h3>
          <p className="profile-delete-desc">
            Permanently delete your account and data.
          </p>
        </div>
        <button onClick={handleDeleteClick} className="profile-delete-btn">
          Delete profile
        </button>
      </div>
      {showDeletePopup && (
        <DeleteProfilePopup setShowDeletePopup={setShowDeletePopup} />
      )}
    </div>
  );
}
