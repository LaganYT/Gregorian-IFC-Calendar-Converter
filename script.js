// Gregorian to IFC Calendar Converter
// Traditional Calendar Grid Layout

const IFC_MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'Sol', 'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

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

// Convert IFC date (month index 0-12, day 1-28) to Gregorian Date for the same year
function ifcToGregorian(ifcYear, ifcMonthIndex, ifcDay) {
    const dayOfYear = (ifcMonthIndex * 28) + ifcDay; // 1..364
    const gregorianDate = new Date(ifcYear, 0, 1);
    gregorianDate.setDate(dayOfYear);
    return gregorianDate;
}

// Generate calendar grid for a given month/year
function generateCalendarGrid(year, month, selectedDate = null, isIFC = false) {
    if (isIFC) {
        // Fixed 4-week × 7-day grid (28 days) with weeks starting on Sunday
        const grid = [];
        // Determine which IFC date is selected and today
        const selectedIfc = selectedDate ? gregorianToIFC(selectedDate) : null;
        const todayIfc = gregorianToIFC(new Date());

        for (let i = 1; i <= 28; i++) {
            const dayOfWeek = (i - 1) % 7; // 0..6
            const cell = {
                date: i,
                month: month, // IFC month index (0..12)
                year: year,
                isCurrentMonth: true,
                isToday: !todayIfc.special && todayIfc.month === IFC_MONTHS[month] && todayIfc.day === i,
                isSelected: selectedIfc && !selectedIfc.special && selectedIfc.month === IFC_MONTHS[month] && selectedIfc.day === i,
                dayOfWeek: dayOfWeek,
                ifcInfo: { month: IFC_MONTHS[month], day: i, year: year, special: null }
            };
            grid.push(cell);
        }
        return grid;
    } else {
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay()); // Start from Sunday

        const grid = [];

        // Generate 6 weeks × 7 days = 42 cells
        for (let week = 0; week < 6; week++) {
            for (let day = 0; day < 7; day++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (week * 7) + day);

                const cellDate = {
                    date: currentDate.getDate(),
                    month: currentDate.getMonth(),
                    year: currentDate.getFullYear(),
                    isCurrentMonth: currentDate.getMonth() === month,
                    isToday: isToday(currentDate),
                    isSelected: selectedDate && datesEqual(currentDate, selectedDate),
                    dayOfWeek: currentDate.getDay()
                };

                // Add IFC information if this is an IFC calendar (not used here)
                grid.push(cellDate);
            }
        }

        return grid;
    }
}

// Helper functions
function isToday(date) {
    const today = new Date();
    return datesEqual(date, today);
}

function datesEqual(date1, date2) {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
}

// Format month and year for display
function formatMonthYear(date) {
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options).toUpperCase();
}

// Render calendar grid
function renderCalendar(calendarElement, year, month, selectedDate = null, isIFC = false, onDateClick = null, specialLabel = null) {
    const monthYearElement = calendarElement.parentElement.querySelector(isIFC ? '#ifc-month-year' : '#gregorian-month-year');
    if (isIFC) {
        monthYearElement.textContent = `${IFC_MONTHS[month] || 'SPECIAL'} ${year}`;
    } else {
        monthYearElement.textContent = formatMonthYear(new Date(year, month, 1));
    }

    // Special IFC view (Year Day / Leap Day)
    if (isIFC && specialLabel) {
        calendarElement.innerHTML = '';
        const daysHeader = document.createElement('div');
        daysHeader.className = 'calendar-days';
        DAY_NAMES.forEach(d => {
            const el = document.createElement('div');
            el.className = 'day-header';
            el.textContent = d;
            daysHeader.appendChild(el);
        });
        calendarElement.appendChild(daysHeader);

        const special = document.createElement('div');
        special.className = 'calendar-dates';
        const cell = document.createElement('div');
        cell.className = 'date-cell selected';
        const lbl = document.createElement('div');
        lbl.className = 'date-number';
        lbl.textContent = specialLabel;
        cell.appendChild(lbl);
        special.appendChild(cell);
        calendarElement.appendChild(special);
        return;
    }

    const grid = generateCalendarGrid(year, month, selectedDate, isIFC);

    // Clear existing grid
    calendarElement.innerHTML = '';

    // Add days header
    const daysHeader = document.createElement('div');
    daysHeader.className = 'calendar-days';

    DAY_NAMES.forEach(day => {
        const dayElement = document.createElement('div');
        dayElement.className = 'day-header';
        dayElement.textContent = day;
        daysHeader.appendChild(dayElement);
    });

    calendarElement.appendChild(daysHeader);

    // Add dates grid
    const datesContainer = document.createElement('div');
    datesContainer.className = 'calendar-dates';

    grid.forEach(cell => {
        const dateElement = document.createElement('div');
        dateElement.className = 'date-cell';

        if (!cell.isCurrentMonth) {
            dateElement.classList.add('other-month');
        }

        if (cell.isToday) {
            dateElement.classList.add('today');
        }

        if (cell.isSelected) {
            dateElement.classList.add('selected');
        }

        // Add date number
        const dateNumber = document.createElement('div');
        dateNumber.className = 'date-number';
        dateNumber.textContent = cell.date;
        dateElement.appendChild(dateNumber);

        // IFC grid does not include special days inside months

        // Click to select and sync calendars
        if (typeof onDateClick === 'function') {
            dateElement.addEventListener('click', function() {
                let clickedDate;
                if (isIFC) {
                    // Convert IFC cell to Gregorian date
                    clickedDate = ifcToGregorian(year, month, cell.date);
                } else {
                    clickedDate = new Date(cell.year, cell.month, cell.date);
                }
                onDateClick(clickedDate);
            });
            dateElement.style.cursor = 'pointer';
        }

        datesContainer.appendChild(dateElement);
    });

    calendarElement.appendChild(datesContainer);
}

// Main application
document.addEventListener('DOMContentLoaded', function() {
    const dateInput = document.getElementById('gregorian-date');
    const gregorianGrid = document.getElementById('gregorian-grid');
    const ifcGrid = document.getElementById('ifc-grid');
    const gregorianFooter = document.getElementById('gregorian-footer');
    const ifcFooter = document.getElementById('ifc-footer');

    // Initialize with current date
    const today = new Date();
    let currentMonth = today.getMonth();
    let currentYear = today.getFullYear();
    let selectedDate = new Date(today);

    // Set initial date input value
    dateInput.value = today.toISOString().split('T')[0];

    // Initial render
    updateCalendars();

    // Date input change handler
    dateInput.addEventListener('change', function() {
        const newDate = new Date(this.value + 'T00:00:00');
        if (!isNaN(newDate.getTime())) {
            selectedDate = newDate;
            currentMonth = selectedDate.getMonth();
            currentYear = selectedDate.getFullYear();
            updateCalendars();
        }
    });

    function updateCalendars() {
        // Render Gregorian calendar for current month
        renderCalendar(gregorianGrid, currentYear, currentMonth, selectedDate, false, handleDateClick);

        // For IFC calendar, we need to determine which IFC month/year corresponds to the selected Gregorian date
        const ifcDate = gregorianToIFC(selectedDate);

        if (ifcDate.special) {
            // Special days are not in any month; show a special label view
            renderCalendar(ifcGrid, ifcDate.year, 0, selectedDate, true, handleDateClick, ifcDate.special);
        } else {
            // Find the IFC month index for the converted date
            const ifcMonthIndex = IFC_MONTHS.indexOf(ifcDate.month);
            renderCalendar(ifcGrid, ifcDate.year, ifcMonthIndex, selectedDate, true, handleDateClick);
        }

        // Update footers
        if (ifcDate.special) {
            gregorianFooter.textContent = `${ifcDate.special}, ${ifcDate.year}`;
        } else {
            gregorianFooter.textContent = `${ifcDate.month} ${ifcDate.day}, ${ifcDate.year}`;
        }

        // Convert back for IFC footer: show the Gregorian date nicely
        const gregMonthName = selectedDate.toLocaleString('en-US', { month: 'long' });
        ifcFooter.textContent = `${gregMonthName} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
    }

    // Shared click handler for both calendars
    function handleDateClick(newDate) {
        if (isNaN(newDate.getTime())) return;
        selectedDate = newDate;
        currentMonth = selectedDate.getMonth();
        currentYear = selectedDate.getFullYear();
        dateInput.value = selectedDate.toISOString().split('T')[0];
        updateCalendars();
    }
});
