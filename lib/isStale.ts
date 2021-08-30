const dayjs = require("dayjs");

// Check if date in the past
function isStale(dateString: string, minutesAgo: number = 30) {
  let now = dayjs();
  let date = dayjs(dateString);
  let diff = now.diff(date, "minute");
  return diff > minutesAgo;
}

export default isStale;
