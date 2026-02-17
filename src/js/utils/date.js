export function getMonthFromIndex(index) {
	const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
	return months[index];
}
export function getDayFromIndex(index) {
	const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
	return days[index];
}
export function checkIfDateIsBeforeMax(givenDate, maxDate) {
	const maxYear = maxDate.getFullYear();
	const maxMonth = maxDate.getMonth();
	const maxDay = maxDate.getDate();
	const givenDateYear = givenDate.getFullYear();
	const givenDateMonth = givenDate.getMonth();
	const givenDateDay = givenDate.getDate();
	if (givenDateYear < maxYear) return true;
	if (givenDateYear === maxYear && givenDateMonth < maxMonth) return true;
	if (givenDateYear === maxYear && givenDateMonth === maxMonth && givenDateDay < maxDay) return true;
	return false;
}
export function checkIfDateIsBeforeToday(givenDate) {
	const today = new Date();
	const todaysYear = today.getFullYear();
	const todaysMonth = today.getMonth();
	const todaysDay = today.getDate();
	const givenDateYear = givenDate.getFullYear();
	const givenDateMonth = givenDate.getMonth();
	const givenDateDay = givenDate.getDate();
	if (givenDateYear < todaysYear) return true;
	if (givenDateYear === todaysYear && givenDateMonth < todaysMonth) return true;
	if (givenDateYear === todaysYear && givenDateMonth === todaysMonth && givenDateDay < todaysDay) return true;
	return false;
}
export function checkIfDatesMatch(firstDate, secondDate) {
	if (firstDate instanceof Date && secondDate instanceof Date) {
		return firstDate.getFullYear() === secondDate.getFullYear() && firstDate.getMonth() === secondDate.getMonth() && firstDate.getDate() === secondDate.getDate();
	} else {
		return false;
	}
}
export function padTo2Digits(num) {
	return num.toString().padStart(2, "0");
}
