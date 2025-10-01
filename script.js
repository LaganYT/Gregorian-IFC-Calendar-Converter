// IFC Calendar Converter
// International Fixed Calendar (IFC) conversion logic

const IFC_MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'Sol', 'July', 'August', 'September', 'October', 'November', 'December'
];

// Check if a year is a leap year
function isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

// Get the day of the year for a Gregorian date
function getDayOfYear(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Days in each month (non-leap year)
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Add leap day if it's a leap year and we're past February
    if (isLeapYear(year) && month > 1) {
        daysInMonth[1] = 29;
    }

    // Calculate day of year
    let dayOfYear = 0;
    for (let i = 0; i < month; i++) {
        dayOfYear += daysInMonth[i];
    }
    dayOfYear += day;

    return dayOfYear;
}

// Convert Gregorian date to IFC date
function gregorianToIFC(gregorianDate) {
    const year = gregorianDate.getFullYear();
    const dayOfYear = getDayOfYear(gregorianDate);

    // Handle special cases
    if (dayOfYear === 366 && isLeapYear(year)) {
        return {
            month: null,
            day: null,
            year: year,
            special: 'Leap Day'
        };
    }

    if (dayOfYear === 365 || (dayOfYear === 366 && !isLeapYear(year))) {
        return {
            month: null,
            day: null,
            year: year,
            special: 'Year Day'
        };
    }

    // Calculate IFC month and day
    // IFC has 13 months of 28 days each = 364 days
    const monthIndex = Math.floor((dayOfYear - 1) / 28);
    const dayOfMonth = ((dayOfYear - 1) % 28) + 1;

    return {
        month: IFC_MONTHS[monthIndex],
        day: dayOfMonth,
        year: year,
        special: null
    };
}

// Format the IFC date for display
function formatIFCDate(ifcDate) {
    if (ifcDate.special) {
        return `${ifcDate.special}, ${ifcDate.year}`;
    }
    return `${ifcDate.month} ${ifcDate.day}, ${ifcDate.year}`;
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('gregorian-date');
    const convertBtn = document.getElementById('convert-btn');
    const resultDisplay = document.getElementById('ifc-result');

    // Set default date to today
    const today = new Date();
    dateInput.value = today.toISOString().split('T')[0];

    // Initial conversion
    updateConversion();

    // Convert button click
    convertBtn.addEventListener('click', updateConversion);

    // Date input change
    dateInput.addEventListener('change', updateConversion);

    function updateConversion() {
        const selectedDate = new Date(dateInput.value + 'T00:00:00');

        if (isNaN(selectedDate.getTime())) {
            resultDisplay.textContent = 'Please select a valid date';
            return;
        }

        const ifcDate = gregorianToIFC(selectedDate);
        const formattedDate = formatIFCDate(ifcDate);

        resultDisplay.textContent = formattedDate;

        // Add some visual feedback
        resultDisplay.style.background = ifcDate.special ? '#fff3cd' : '#d4edda';
        resultDisplay.style.borderColor = ifcDate.special ? '#ffeaa7' : '#c3e6cb';
    }
});
