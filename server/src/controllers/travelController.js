import { logError, logWarning } from "../util/logging.js";
import { getTransitRouteSummary } from "../services/googleMapsApi.js";

function formatAddress(address) {
  const streetParts = [];
  if (address?.homeStreet) streetParts.push(address.homeStreet);
  if (address?.homeHouseNumber) streetParts.push(address.homeHouseNumber);
  if (address?.homeCity) streetParts.push(address.homeCity);

  const addressParts = [streetParts.join(" ")];
  if (address?.homeCountry) addressParts.push(address.homeCountry);
  return addressParts.join(", ");
}

const workPlacesSet = new Set([
  "Netherlands",
  "Drenthe, Netherlands",
  "Flevoland, Netherlands",
  "Friesland, Netherlands",
  "Gelderland, Netherlands",
  "Groningen, Netherlands",
  "Limburg, Netherlands",
  "Noord-Brabant, Netherlands",
  "Noord-Holland, Netherlands",
  "Overijssel, Netherlands",
  "Utrecht, Netherlands",
  "Zeeland, Netherlands",
  "Zuid-Holland, Netherlands",
]);

export default async function calculateBatchTravelTime(req, res) {
  try {
    const { homeAddress, workCities } = req.body || {};

    if (!homeAddress || !workCities || !Array.isArray(workCities)) {
      logWarning("Invalid request body for batch travel calculation");
      return res.status(400).json({
        success: false,
        msg: "Missing homeAddress or workCities array",
      });
    }

    const { homeCity } = homeAddress;
    const formattedHomeAddress = formatAddress(homeAddress);

    const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = homeCity
      ? new RegExp(escapeRegExp(" " + homeCity + " "), "i")
      : null;

    // Filter out non-string work cities and process
    const validWorkCities = workCities.filter(
      (city) => typeof city === "string",
    );

    const promises = validWorkCities.map((workCity) => {
      const normalizedWorkCity = workCity.replace(",", " ");
      if (
        (re && re.test(" " + normalizedWorkCity + " ")) ||
        workPlacesSet.has(workCity)
      ) {
        return Promise.resolve({
          workCity,
          travel_time: 0,
          least_transfers: 0,
        });
      }
      return getTransitRouteSummary(
        formattedHomeAddress,
        workCity,
        process.env.GOOGLE_MAPS_API_KEY,
      )
        .then((travelData) => {
          return {
            workCity,
            travel_time: Math.round(travelData.travel_time),
            least_transfers: travelData.least_transfers,
          };
        })
        .catch((error) => {
          logWarning(`Travel fetch failed for ${workCity}: ${error.message}`);
          return {
            workCity,
            error: error.message,
          };
        });
    });

    const results = await Promise.all(promises);
    return res.status(200).json({
      success: true,
      result: {
        homeAddress: formattedHomeAddress,
        travelDetails: results,
      },
    });
  } catch (error) {
    logError(`Batch travel calculation error: ${error}`);
    return res.status(500).json({
      success: false,
      msg: "An unexpected error occurred during travel calculation",
      error: error.message,
    });
  }
}
