const currentDate = new Date();

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const currentDay = daysOfWeek[currentDate.getDay()];

const dayElement = document.getElementById('current-day');

dayElement.textContent = currentDay;
