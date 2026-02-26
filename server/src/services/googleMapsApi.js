/*
Google Maps Integration Details:
- Commute Calculations: Travel time and transfer information for public transit
- Batch Processing: Efficient calculation for multiple job locations
- User Location: Based on user profile address settings
- Cache Storage: Commute data persisted in user_favorites table
- Route Analysis: Multiple route comparison with duration and transfer calculations
- Error Handling: Comprehensive error handling for API failures and missing routes
- Performance: Optimized for transit mode with duration and transfer metrics
*/

import Holidays from "date-holidays";

const holidays = new Holidays("NL");

if (!process.env.GOOGLE_MAPS_API_KEY) {
  throw new Error(
    "GOOGLE_MAPS_API_KEY is not defined in environment variables. Please check your .env file.",
  );
}

export default async function getTransitRouteSummary(origin, destination) {
  let dateOffset = 44;
  const today = new Date();
  let arrivalDate = new Date();
  arrivalDate.setDate(today.getDate() + dateOffset);

  while (
    arrivalDate.getDay() === 0 ||
    arrivalDate.getDay() === 6 ||
    holidays.isHoliday(arrivalDate)
  ) {
    dateOffset -= 1;
    arrivalDate = new Date();
    arrivalDate.setDate(today.getDate() + dateOffset);
  }

  arrivalDate.setHours(9, 0, 0, 0);
  const arrivalTime = Math.floor(arrivalDate.getTime() / 1000);

  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(
    origin,
  )}&destination=${encodeURIComponent(
    destination,
  )}&mode=transit&arrival_time=${arrivalTime}&alternatives=true&key=${process.env.GOOGLE_MAPS_API_KEY}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch from Google Maps API");
  const data = await response.json();

  const routes = data.routes;

  if (!routes || routes.length === 0) throw new Error("No routes found");
  const durations = routes.map((r) => r.legs[0].duration.value / 60);
  const transfers = routes.map(
    (r) =>
      r.legs[0].steps.filter((s) => s.travel_mode === "TRANSIT").length - 1,
  );

  return {
    travel_time: durations.reduce((a, b) => a + b, 0) / durations.length,
    least_transfers: Math.min(...transfers),
  };
}
