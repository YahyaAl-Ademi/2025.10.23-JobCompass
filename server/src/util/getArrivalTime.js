import Holidays from "date-holidays";
const holidays = new Holidays("NL");

function getLastSundayOfMonthUTC(year, monthIndex) {
  const lastDay = new Date(Date.UTC(year, monthIndex + 1, 0));
  const dayOfWeek = lastDay.getUTCDay();
  lastDay.setUTCDate(lastDay.getUTCDate() - dayOfWeek);
  return lastDay;
}

function getNetherlandsUtcOffsetHours(date) {
  const year = date.getUTCFullYear();
  const summerStart = getLastSundayOfMonthUTC(year, 2);
  summerStart.setUTCHours(1, 0, 0, 0);

  const summerEnd = getLastSundayOfMonthUTC(year, 9);
  summerEnd.setUTCHours(1, 0, 0, 0);

  return date >= summerStart && date < summerEnd ? 2 : 1;
}

export default function getArrivalTime() {
  let dateOffset = 44;
  const now = new Date();
  const today = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
  let arrivalDate = new Date(today);
  arrivalDate.setUTCDate(today.getUTCDate() + dateOffset);

  while (
    arrivalDate.getDay() === 0 ||
    arrivalDate.getDay() === 6 ||
    holidays.isHoliday(arrivalDate)
  ) {
    dateOffset -= 1;
    arrivalDate = new Date(today);
    arrivalDate.setUTCDate(today.getUTCDate() + dateOffset);
  }

  const nlUtcOffsetHours = getNetherlandsUtcOffsetHours(arrivalDate);
  arrivalDate = new Date(
    Date.UTC(
      arrivalDate.getUTCFullYear(),
      arrivalDate.getUTCMonth(),
      arrivalDate.getUTCDate(),
      9 - nlUtcOffsetHours,
      0,
      0,
      0,
    ),
  );
  return Math.floor(arrivalDate.getTime() / 1000);
}
