import "./AddressSettings.css";

export default function AddressSettings({
  street,
  houseNumber,
  city,
  country,
  onStreetChange,
  onHouseNumberChange,
  onCityChange,
  onCountryChange,
  onKeyDown,
  clearAlert,
}) {
  return (
    <div className="mb-6">
      <div className="address-fields-grid">
        <div>
          <label className="address-label">Street</label>
          <input
            id="streetInput"
            type="text"
            value={street}
            className="address-input"
            onKeyDown={onKeyDown}
            onChange={(e) => {
              clearAlert();
              onStreetChange(e.target.value);
            }}
          />
        </div>
        <div>
          <label className="address-label">House no.</label>
          <input
            id="houseInput"
            type="text"
            value={houseNumber}
            className="address-input"
            onKeyDown={onKeyDown}
            onChange={(e) => {
              clearAlert();
              onHouseNumberChange(e.target.value);
            }}
          />
        </div>
        <div>
          <label className="address-label">
            City <span className="text-red-500">*</span>
          </label>
          <input
            id="cityInput"
            type="text"
            value={city}
            aria-required="true"
            className="address-input"
            onKeyDown={onKeyDown}
            onChange={(e) => {
              clearAlert();
              onCityChange(e.target.value);
            }}
          />
        </div>
        <div>
          <label className="address-label">Country</label>
          <input
            id="countryInput"
            type="text"
            value={country}
            className="address-input"
            onKeyDown={onKeyDown}
            onChange={(e) => {
              clearAlert();
              onCountryChange(e.target.value);
            }}
          />
        </div>
      </div>
    </div>
  );
}
