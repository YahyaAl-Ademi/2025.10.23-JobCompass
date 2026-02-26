import Holidays from "date-holidays";
const holidays = new Holidays("NL");

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

  arrivalDate.setHours(9, 0, 0, 0);
  return Math.floor(arrivalDate.getTime() / 1000);
}
