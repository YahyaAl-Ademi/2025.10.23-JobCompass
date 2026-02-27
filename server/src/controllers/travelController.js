import { logError, logWarning } from "../util/logging.js";
import getTransitRouteSummary from "../services/googleMapsApi.js";
import formatAddress from "../../../shared/formatAddress.js";
import normalizeText from "../../../shared/normalizeText.js";

const workPlacesSet = new Set([
  "Brabantine City Row",
  "Drenthe, Netherlands",
  "Flevoland, Netherlands",
  "Friesland, Netherlands",
  "Gelderland, Netherlands",
  "Groningen, Netherlands",
  "Limburg, Netherlands",
  "Netherlands",
  "Noord-Brabant, Netherlands",
  "Noord-Holland, Netherlands",
  "Overijssel, Netherlands",
  "Utrecht, Netherlands",
  "Zeeland, Netherlands",
  "Zuid-Holland, Netherlands",
  "Amsterdam Area",
  "Utrecht Area",
  "Arnhem-Nijmegen Region",
  "The Randstad, Netherlands",
]);

export default async function calculateBatchTravelTime(req, res) {
  try {
    const { homeAddress, workCities } = req.body || {};
    if (
      !homeAddress ||
      !workCities ||
      !Array.isArray(workCities) ||
      workCities.some((city) => typeof city !== "string")
    ) {
      logWarning("Invalid request body for batch travel calculation");
      return res.status(400).json({
        success: false,
        msg: "Missing homeAddress or workCities text string array",
      });
    }

    const { city } = homeAddress;
    const formattedHomeAddress = formatAddress(homeAddress);
    const normalizedHomeCity = normalizeText(city);

    const promises = workCities.map(async (workCity) => {
      let result;
      if (workPlacesSet.has(workCity)) {
        result = {
          workCity,
          travel_time: null,
          least_transfers: null,
        };
      } else if (
        normalizedHomeCity &&
        normalizeText(workCity).includes(normalizedHomeCity)
      ) {
        result = {
          workCity,
          travel_time: 0,
          least_transfers: 0,
        };
      } else {
        try {
          const travelData = await getTransitRouteSummary(
            formattedHomeAddress,
            workCity,
          );
          result = {
            workCity,
            travel_time: Math.round(travelData.travel_time),
            least_transfers: travelData.least_transfers,
          };
        } catch (error) {
          logWarning(`Travel fetch failed for ${workCity}: ${error.message}`);
          result = {
            workCity,
            error: error.message,
          };
        }
      }

      return result;
    });

    const results = await Promise.all(promises);
    res.status(200).json({
      success: true,
      result: {
        homeAddress: formattedHomeAddress,
        travelDetails: results,
      },
    });
  } catch (error) {
    logError(`Batch travel calculation error: ${error}`);
    res.status(500).json({
      success: false,
      msg: "An unexpected error occurred during travel calculation",
      error: error.message,
    });
  }
}
