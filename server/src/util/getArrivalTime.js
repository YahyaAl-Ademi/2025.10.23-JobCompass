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

  const nlUtcOffsetHours = getNetherlandsUtcOffsetHours(arrivalDate);
  arrivalDate = new Date(
    Date.UTC(
      arrivalDate.getFullYear(),
      arrivalDate.getMonth(),
      arrivalDate.getDate(),
      9 - nlUtcOffsetHours,
      0,
      0,
      0,
    ),
  );
  return Math.floor(arrivalDate.getTime() / 1000);
}
