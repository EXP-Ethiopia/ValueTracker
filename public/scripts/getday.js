
const currentDate = new Date();


const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];


const currentDay = daysOfWeek[currentDate.getDay()];

const currentFormattedDate = `${currentDate.getFullYear()}/${currentDate.getMonth() + 1}/${currentDate.getDate()}`;

const dayElement = document.getElementById('current-day');


// dayElement.textContent = `${currentDay}, ${currentFormattedDate}`;



let DaySelection = document.getElementById("dayComboBox");
let MonthSelection = document.getElementById("monthComboBox");
let YearSelection = document.getElementById("yearComboBox");

const Months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function PopulateMonths() {
    for(let i =0; Months.length > i; i++) {
        let option = document.createElement("option");

        option.value = i +1;
        option.text = Months[i];

        option.selected = Months[i] === Months[currentDate.getMonth()] ? true : false;
        MonthSelection.appendChild(option);
        console.log(`Month: ${Months[i]} ==> ${option.value} `);

    }
}

function populateYear() {
    let currentYear = new Date().getFullYear();
    for(let i = 0; i < 100; i++) {
        let option = document.createElement("option");
        option.text = currentYear - i;
        option.selected = currentYear - i === currentDate.getFullYear() ? true : false;
        YearSelection.appendChild(option);
    }

}

function popualteDays (months) {

    let days = 31;



    if(months === "February") {

        days = 28;
    } else if (months === "April" || months === "June" || months === "September" || months === "November") {

        days = 30;
    }

    DaySelection.innerHTML = "";

    for(let i = 1; i <= days; i++) {
        let option = document.createElement("option");
        option.text = i;
        option.selected = i === currentDate.getDate() ? true : false;
        DaySelection.appendChild(option);
        
    }
}

MonthSelection.addEventListener("change", () => {
    popualteDays(MonthSelection.options[MonthSelection.selectedIndex].text);
});



const dt = new Date();

PopulateMonths();
populateYear();
popualteDays(Months);
