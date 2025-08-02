const FDATEPICKER_DEFAULT_MESSAGES = {
    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    daysShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    daysMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
    months: ['January','February','March','April','May','June', 'July','August','September','October','November','December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    today: 'Today',
    clear: 'Clear',
    close: 'Close',
    format: 'm/d/Y h:i a',
    firstDayOfWeek: 0,
    noDatesSelected: 'No dates selected',
    datesSelected: 'Selected dates ({0}):'
}

class FDatepicker {
    static setMessages(customMessages) {
        Object.assign(FDATEPICKER_DEFAULT_MESSAGES, customMessages);
    }

    constructor(input, options = {}) {
        this.input = input;

        // Wrap input so popup can be positioned correctly
        this.wrapper = this.wrapInput();

        this.currentDate = new Date();
        this.selectedDate = null;
        this.selectedEndDate = null;
        this.selectedDates = [];
        this.isOpen = false;
        this.view = 'days';
        this.currentYear = new Date().getFullYear();
        this.focusedElement = null;

        // Read options from input's dataset
        this.options = {
            format: input.dataset.format || '',
            startView: input.dataset.startView || 'days',
            minDate: input.dataset.minDate ? new Date(input.dataset.minDate) : null,
            maxDate: input.dataset.maxDate ? new Date(input.dataset.maxDate) : null,
            disabledDates: input.dataset.disabledDates ?  input.dataset.disabledDates.split(',').map(d => d.trim()) : [],
            altField: input.dataset.altField || null,
            altFormat: input.dataset.altFormat || 'Y-m-d',
            range: input.dataset.range === 'true',
            multiple: input.dataset.multiple === 'true',
            multipleSeparator: input.dataset.multipleSeparator || ',',
            altFieldMultipleDatesSeparator: input.dataset.altFieldMultipleDatesSeparator || ',',
            multipleDisplaySelector: input.dataset.multipleDisplaySelector || '.selected-dates-display',
            timepicker: input.dataset.timepicker === 'true',
            ampm: input.dataset.ampm === 'false',
            firstDayOfWeek: parseInt(input.dataset.firstDayOfWeek) || 0, // 0 = Sunday, 1 = Monday, etc.
            timepickerDefaultNow: input.dataset.timepickerDefaultNow !== 'false', // default true
            todayButton: input.dataset.todayButton !== 'false',
            clearButton: input.dataset.clearButton !== 'false',
            closeButton: input.dataset.closeButton !== 'false',
            ...options
        };

        this.locale = FDATEPICKER_DEFAULT_MESSAGES;

        if (!this.input.dataset.format && !this.options.format) {
            this.options.format = this.locale.format || 'm/d/Y';
        }
        if (this.options.format.includes('a') || this.options.format.includes('A')) {
            this.options.ampm = true;
        }

        // Create popup and attach it
        this.popup = this.createPopup();
        this.wrapper.appendChild(this.popup);

        // Now query elements inside popup
        this.title = this.popup.querySelector('.fdatepicker-title');
        this.content = this.popup.querySelector('.fdatepicker-content');
        this.grid = this.popup.querySelector('.fdatepicker-grid');
        this.timepicker = this.popup.querySelector('.fdatepicker-timepicker');
        this.hoursInput = this.popup.querySelector('[data-time="hours"]');
        this.minutesInput = this.popup.querySelector('[data-time="minutes"]');

        this.init();
    }

    isDateDisabled(date) {
        const time = date.getTime();
        const dateString = this.formatDate(date,'Y-m-d');

        // Check min/max
        if (this.options.minDate && time < this.options.minDate.setHours(0,0,0,0)) return true;
        if (this.options.maxDate && time > this.options.maxDate.setHours(23,59,59,999)) return true;

        // Check disabled dates
        if (this.options.disabledDates.includes(dateString)) return true;

        return false;
    }

    wrapInput() {
        const wrapper = document.createElement('div');
        wrapper.style.position = 'relative';
        wrapper.style.display = 'inline-block';
        wrapper.style.width = '100%';

        // Wrap the input
        this.input.parentNode.insertBefore(wrapper, this.input);
        wrapper.appendChild(this.input);

        return wrapper;
    }

    init() {
        // Handle pre-filled dates
        this.initializePrefilledDates();

        // Setup timepicker
        if (this.options.timepicker) {
            this.timepicker.classList.add('active');
            if (this.options.ampm) {
                this.setupAmPm();
            }
        }
        this.view = this.options.startView === 'years' ? 'years' :
            this.options.startView === 'months' ? 'months' : 'days';
        this.render();
        this.bindEvents();
        this.bindKeyboard();
        this.updateInput();
    }

    initializePrefilledDates() {
        if (this.options.multiple && this.input.dataset.dates) {
            // Multiple dates
            const dates = this.input.dataset.dates.split(',');
            this.selectedDates = dates.map(dateStr => new Date(dateStr.trim())).filter(date => !isNaN(date));
            if (this.selectedDates.length > 0) {
                this.currentDate = new Date(this.selectedDates[0]);
            }
        } else if (this.input.dataset.date) {
            // Single date
            const date = new Date(this.input.dataset.date);
            if (!isNaN(date)) {
                this.selectedDate = date;
                this.currentDate = new Date(date);
            }
        }
    }

    getInitialTimeValues() {
        let hours = 12;
        let minutes = 0;
        let isAM = true;

        // If we have a selected date, use its time
        if (this.selectedDate) {
            hours = this.selectedDate.getHours();
            minutes = this.selectedDate.getMinutes();
            isAM = hours < 12;
        } else if (this.options.timepickerDefaultNow) {
            // Use current time if timepickerDefaultNow is true
            const now = new Date();
            hours = now.getHours();
            minutes = now.getMinutes();
            isAM = hours < 12;
        }

        // Convert to 12-hour format if needed
        let displayHours = hours;
        if (this.options.ampm) {
            displayHours = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
        }

        return { hours: displayHours, minutes, isAM };
    }

    createPopup() {
        const popup = document.createElement('div');
        popup.className = 'fdatepicker-popup';

        popup.innerHTML = `
        <div class="fdatepicker-header">
            <button class="fdatepicker-nav" data-action="prev" tabindex="0">‹</button>
            <div class="fdatepicker-title" tabindex="0"></div>
            <button class="fdatepicker-nav" data-action="next" tabindex="0">›</button>
        </div>
        <div class="fdatepicker-content">
            <div class="fdatepicker-grid">
                <!-- Days headers will be added dynamically -->
            </div>
        </div>
        `;

        // Add timepicker if needed
        if (this.options.timepicker) {
            const initialTime = this.getInitialTimeValues();
            const is24Hour = !this.options.ampm;

            const timeInputHtml = is24Hour ? `
            <input type="number" class="fdatepicker-time-input" data-time="hours" min="0" max="23" value="${String(initialTime.hours).padStart(2, '0')}">
        ` : `
            <input type="number" class="fdatepicker-time-input" data-time="hours" min="1" max="12" value="${String(initialTime.hours).padStart(2, '0')}">
            <div class="fdatepicker-time-ampm ${initialTime.isAM ? 'active' : ''}" data-ampm="AM">AM</div>
            <div class="fdatepicker-time-ampm ${!initialTime.isAM ? 'active' : ''}" data-ampm="PM">PM</div>
            `;

            const timepicker = document.createElement('div');
            timepicker.className = 'fdatepicker-timepicker';
            timepicker.innerHTML = `
            <div class="fdatepicker-time-inputs">
                ${timeInputHtml}
                <span class="fdatepicker-time-separator">:</span>
                <input type="number" class="fdatepicker-time-input" data-time="minutes" min="0" max="59" value="${String(initialTime.minutes).padStart(2, '0')}">
            </div>
            `;
            popup.appendChild(timepicker);
        }

        if (this.options.todayButton || this.options.clearButton || this.options.closeButton) {
            const buttonRow = document.createElement('div');
            buttonRow.className = 'fdatepicker-buttons';

            if (this.options.todayButton) {
                const todayBtn = document.createElement('button');
                todayBtn.type = 'button';
                todayBtn.className = 'fdatepicker-button-text';
                todayBtn.textContent = this.locale.today || 'Today';
                todayBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const today = new Date();
                    this.selectDate(today.getDate());
                    this.currentDate = new Date(today);
                    this.render();
                });
                buttonRow.appendChild(todayBtn);
            }

            if (this.options.clearButton) {
                const clearBtn = document.createElement('button');
                clearBtn.type = 'button';
                clearBtn.className = 'fdatepicker-button-text';
                clearBtn.textContent = this.locale.clear || 'Clear';
                clearBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectedDate = null;
                    this.selectedEndDate = null;
                    this.selectedDates = [];
                    this.updateInput();
                    this.render();
                });
                buttonRow.appendChild(clearBtn);
            }

            if (this.options.closeButton) {
                const closeBtn = document.createElement('button');
                closeBtn.type = 'button';
                closeBtn.className = 'fdatepicker-button-text';
                closeBtn.textContent = this.locale.close || 'Close';
                closeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.close();
                });
                buttonRow.appendChild(closeBtn);
            }

            popup.appendChild(buttonRow);
        }

        return popup;
    }

    setupAmPm() {
        const ampmElements = this.popup.querySelectorAll('[data-ampm]');
        ampmElements.forEach(el => {
            el.addEventListener('click', () => {
                ampmElements.forEach(e => e.classList.remove('active'));
                el.classList.add('active');
                this.updateSelectedTime();
            });
        });
    }

    bindKeyboard() {
        // Handle keyboard events on input
        this.input.addEventListener('keydown', (e) => {
            if (!this.isOpen && e.key !== 'Escape') {
                if (['ArrowDown', ' ', 'Enter'].includes(e.key)) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.open();
                }
                return;
            }

            // Prevent scrolling for navigation keys when popup is open
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
                e.preventDefault();
                e.stopPropagation();
            }

            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    e.stopPropagation();
                    this.close();
                    this.input.focus();
                    break;

                case 'Tab':
                    // Allow normal tab behavior within popup
                    if (!this.popup.contains(e.target)) {
                        this.close();
                    }
                    break;

                case 'ArrowLeft':
                    this.navigate(-1, 'horizontal');
                    break;

                case 'ArrowRight':
                    this.navigate(1, 'horizontal');
                    break;

                case 'ArrowUp':
                    this.navigate(-1, 'vertical');
                    break;

                case 'ArrowDown':
                    this.navigate(1, 'vertical');
                    break;

                case 'PageUp':
                    if (this.view === 'days') {
                        if (e.shiftKey) {
                            this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
                        } else {
                            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                        }
                        this.render();
                        this.setInitialFocus();
                    }
                    break;

                case 'PageDown':
                    if (this.view === 'days') {
                        if (e.shiftKey) {
                            this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
                        } else {
                            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                        }
                        this.render();
                        this.setInitialFocus();
                    }
                    break;

                case 'Home':
                    if (this.view === 'days') {
                        this.currentDate.setDate(1);
                        this.render();
                        this.focusCurrentDay();
                    }
                    break;

                case 'End':
                    if (this.view === 'days') {
                        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0).getDate();
                        this.currentDate.setDate(lastDay);
                        this.render();
                        this.focusCurrentDay();
                    }
                    break;

                case 'Enter':
                case ' ':
                    this.handleSelection();
                    break;
            }
        });

        // Handle keyboard navigation within popup - prevent event bubbling to avoid double handling
        this.popup.addEventListener('keydown', (e) => {
            if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Enter', 'Escape'].includes(e.key)) {
                e.preventDefault();
                e.stopPropagation();

                // Dispatch to input handler
                const syntheticEvent = new KeyboardEvent('keydown', {
                    key: e.key,
                    shiftKey: e.shiftKey,
                    ctrlKey: e.ctrlKey,
                    altKey: e.altKey,
                    bubbles: false,
                    cancelable: true
                });
                this.input.dispatchEvent(syntheticEvent);
            }
        });

        // Prevent scrolling on document level when datepicker is open
        document.addEventListener('keydown', (e) => {
            if (this.isOpen && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(e.key)) {
                // Only prevent if the event target is within our datepicker
                if (this.input === e.target || this.popup.contains(e.target)) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }
        });
    }

    navigate(direction, orientation) {
        if (this.view === 'days') {
            if (orientation === 'horizontal') {
                this.currentDate.setDate(this.currentDate.getDate() + direction);
            } else {
                this.currentDate.setDate(this.currentDate.getDate() + (direction * 7));
            }
            this.render();
            this.focusCurrentDay();
        } else if (this.view === 'months') {
            const currentMonth = this.currentDate.getMonth();
            let newMonth;
            if (orientation === 'horizontal') {
                newMonth = currentMonth + direction;
            } else {
                newMonth = currentMonth + (direction * 3);
            }

            if (newMonth < 0) {
                this.currentDate.setFullYear(this.currentDate.getFullYear() - 1);
                this.currentDate.setMonth(11 + newMonth + 1);
            } else if (newMonth > 11) {
                this.currentDate.setFullYear(this.currentDate.getFullYear() + 1);
                this.currentDate.setMonth(newMonth - 12);
            } else {
                this.currentDate.setMonth(newMonth);
            }
            this.render();
            this.focusCurrentMonth();
        } else if (this.view === 'years') {
            if (orientation === 'horizontal') {
                this.currentYear += direction;
            } else {
                this.currentYear += direction * 3;
            }
            this.render();
            this.focusCurrentYear();
        }
    }

    handleSelection() {
        if (this.view === 'days') {
            const focusedDay = this.popup.querySelector('.fdatepicker-day:focus, .fdatepicker-day.focus');
            if (focusedDay && !focusedDay.classList.contains('other-month') && !focusedDay.classList.contains('disabled')) {
                this.selectDate(parseInt(focusedDay.textContent));
            }
        } else if (this.view === 'months') {
            const focusedMonth = this.popup.querySelector('.fdatepicker-month:focus, .fdatepicker-month.focus');
            if (focusedMonth) {
                this.selectMonth(parseInt(focusedMonth.dataset.month));
            }
        } else if (this.view === 'years') {
            const focusedYear = this.popup.querySelector('.fdatepicker-year:focus, .fdatepicker-year.focus');
            if (focusedYear) {
                this.selectYear(parseInt(focusedYear.dataset.year));
            }
        }
    }

    setInitialFocus() {
        setTimeout(() => {
            if (this.view === 'days') {
                this.focusCurrentDay();
            } else if (this.view === 'months') {
                this.focusCurrentMonth();
            } else if (this.view === 'years') {
                this.focusCurrentYear();
            }
        }, 0);
    }

    focusCurrentDay() {
        if (this.view !== 'days') return;

        // Remove existing focus
        this.clearFocus();

        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const day = this.currentDate.getDate();

        // Find the day element that matches current date and is not from other month
        const dayElements = Array.from(this.popup.querySelectorAll('.fdatepicker-day:not(.other-month)'));
        const targetDay = dayElements.find(el => parseInt(el.textContent) === day);

        if (targetDay) {
            this.setFocus(targetDay);
        }
    }

    focusCurrentMonth() {
        if (this.view !== 'months') return;

        this.clearFocus();

        const month = this.currentDate.getMonth();
        const monthElement = this.popup.querySelector(`[data-month="${month}"]`);

        if (monthElement) {
            this.setFocus(monthElement);
        }
    }

    focusCurrentYear() {
        if (this.view !== 'years') return;

        this.clearFocus();

        const year = this.currentDate.getFullYear();
        const yearElement = this.popup.querySelector(`[data-year="${year}"]`);

        if (yearElement) {
            this.setFocus(yearElement);
        }
    }

    setFocus(element) {
        if (this.focusedElement) {
            this.focusedElement.setAttribute('tabindex', '-1');
            this.focusedElement.classList.remove('focus');
        }

        this.focusedElement = element;
        element.setAttribute('tabindex', '0');
        element.classList.add('focus');
        element.focus();
    }

    clearFocus() {
        this.popup.querySelectorAll('.fdatepicker-day, .fdatepicker-month, .fdatepicker-year').forEach(el => {
            el.classList.remove('focus');
            el.setAttribute('tabindex', '-1');
        });
        this.focusedElement = null;
    }

    bindEvents() {
        // Input click to toggle
        this.input.addEventListener('click', () => this.toggle());

        // Mouse interactions
        this.popup.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('fdatepicker-day') && !e.target.classList.contains('other-month')) {
                this.setFocus(e.target);
            } else if (e.target.classList.contains('fdatepicker-month')) {
                this.setFocus(e.target);
            } else if (e.target.classList.contains('fdatepicker-year')) {
                this.setFocus(e.target);
            }
        });

        this.popup.addEventListener('click', (e) => {
            e.stopPropagation();
            const action = e.target.dataset.action;
            if (action === 'prev') {
                this.navigateView(-1);
                this.setInitialFocus();
            }
            if (action === 'next') {
                this.navigateView(1);
                this.setInitialFocus();
            }

            if (e.target === this.title) {
                if (this.view === 'days') this.view = 'months';
                else if (this.view === 'months') this.view = 'years';
                this.render();
                this.setInitialFocus();
            }
            if (e.target.classList.contains('fdatepicker-day') && !e.target.classList.contains('other-month')) {
                this.selectDate(parseInt(e.target.textContent));
            }

            if (e.target.classList.contains('fdatepicker-month')) {
                this.selectMonth(parseInt(e.target.dataset.month));
            }

            if (e.target.classList.contains('fdatepicker-year')) {
                this.selectYear(parseInt(e.target.dataset.year));
            }
        });

        // Time inputs
        if (this.options.timepicker) {
            [this.hoursInput, this.minutesInput].forEach(input => {
                if (input) {
                    input.addEventListener('change', () => this.updateSelectedTime());
                }
            });
        }

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (e.target !== this.input && !this.popup.contains(e.target)) {
                this.close();
            }
        });
    }

    navigateView(direction) {
        if (this.view === 'days') {
            this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        } else if (this.view === 'months') {
            this.currentDate.setFullYear(this.currentDate.getFullYear() + direction);
        } else if (this.view === 'years') {
            this.currentYear += direction * 12;
        }
        this.render();
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }

    open() {
        this.isOpen = true;
        this.render();

        this.popup.classList.add('active');

        // Set initial focus after render
        this.setInitialFocus();

        // --- Smart Positioning ---
        this.popup.classList.remove('fdatepicker-popup-top');

        const inputRect = this.input.getBoundingClientRect();
        const spaceBelow = window.innerHeight - inputRect.bottom;
        const spaceAbove = inputRect.top;
        const popupHeight = 350;

        if (spaceBelow < popupHeight && spaceAbove > spaceBelow) {
            this.popup.classList.add('fdatepicker-popup-top');
        }

    }

    close() {
        this.isOpen = false;
        this.popup.classList.remove('active');
        this.clearFocus();
    }

    selectDate(day) {
        const selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);

        if (this.isDateDisabled(selectedDate)) {
            return;
        }

        if (this.options.multiple) {
            // Multiple selection
            const existingIndex = this.selectedDates.findIndex(date => 
                date.toDateString() === selectedDate.toDateString()
            );

            if (existingIndex >= 0) {
                // Remove if already selected
                this.selectedDates.splice(existingIndex, 1);
            } else {
                // Add to selection
                this.selectedDates.push(selectedDate);
                this.selectedDates.sort((a, b) => a - b);
            }

            this.updateInput();
            this.render();
            this.updateMultipleDisplay();
            this.focusCurrentDay();

        } else if (this.options.range) {
            // Range selection - fixed to stay open
            if (!this.selectedDate || this.selectedEndDate) {
                // Start new range
                this.selectedDate = selectedDate;
                this.selectedEndDate = null;
                this.render();
                this.focusCurrentDay();
            } else {
                // Complete range
                if (selectedDate < this.selectedDate) {
                    this.selectedEndDate = this.selectedDate;
                    this.selectedDate = selectedDate;
                } else {
                    this.selectedEndDate = selectedDate;
                }
                this.updateInput();
                if (!this.options.timepicker) {
                    this.close();
                } else {
                    this.render();
                    this.focusCurrentDay();
                }
            }
        } else {
            // Single selection
            this.selectedDate = selectedDate;
            this.updateInput();
            if (!this.options.timepicker) {
                this.close();
            } else {
                this.render();
                this.focusCurrentDay();
            }
        }
    }

    selectMonth(month) {
        this.currentDate.setMonth(month);
        this.view = 'days';
        this.render();
        this.setInitialFocus();
    }

    selectYear(year) {
        this.currentDate.setFullYear(year);
        this.currentYear = year;
        this.view = 'months';
        this.render();
        this.setInitialFocus();
    }

    updateSelectedTime() {
        const targets = this.options.multiple ? this.selectedDates : 
            (this.selectedEndDate ? [this.selectedDate, this.selectedEndDate] : 
                this.selectedDate ? [this.selectedDate] : []);

        if (targets.length === 0) return;

        let hours = parseInt(this.hoursInput?.value) || 0;
        const minutes = parseInt(this.minutesInput?.value) || 0;

        // Handle AM/PM conversion
        if (this.options.ampm) {
            const isAM = this.popup.querySelector('[data-ampm].active')?.dataset.ampm === 'AM';
            if (isAM && hours === 12) hours = 0;
            else if (!isAM && hours !== 12) hours += 12;
        }

        targets.forEach(date => {
            if (date) {
                date.setHours(hours, minutes);
            }
        });

        this.updateInput();
    }

    updateMultipleDisplay() {
        const display = document.querySelector(this.options.multipleDisplaySelector);
        if (display && this.options.multiple) {
            if (this.selectedDates.length === 0) {
                display.textContent = this.locale.noDatesSelected || 'No dates selected';
            } else {
                const dateStrings = this.selectedDates.map(date => this.formatDate(date));
                const selectedString = this.locale.datesSelected || 'Selected dates ({0}):';
                display.innerHTML = "<strong>" + selectedString.replace(/\{0\}/g, this.selectedDates.length) + `</strong><br>${dateStrings.join(', ')}`;
            }
        }
    }

    formatDate(date, format = null) {
        if (!date) return '';
        format = format || this.options.format;
        return FDatepicker.formatDate(date, format, this.locale);
    }

    static formatDate(date, format = 'm/d/Y', locale = null) {
        if (!date) return '';
        const loc = locale || FDATEPICKER_DEFAULT_MESSAGES;
        const formatMap = {
            'd': String(date.getDate()).padStart(2, '0'),
            'j': date.getDate(),
            'l': loc.days[date.getDay()],
            'D': loc.daysShort[date.getDay()],
            'S': FDatepicker.getOrdinalSuffix(date.getDate()),
            'm': String(date.getMonth() + 1).padStart(2, '0'),
            'n': date.getMonth() + 1,
            'F': loc.months[date.getMonth()],
            'M': loc.monthsShort[date.getMonth()],
            'Y': date.getFullYear(),
            'y': String(date.getFullYear()).slice(-2),
            'H': String(date.getHours()).padStart(2, '0'),
            'G': date.getHours(),
            'i': String(date.getMinutes()).padStart(2, '0'),
            's': String(date.getSeconds()).padStart(2, '0'),
            'A': date.getHours() >= 12 ? 'PM' : 'AM',
            'a': date.getHours() >= 12 ? 'pm' : 'am'
        };
        return format.replace(/d|j|l|D|S|m|n|F|M|Y|y|H|G|i|s|A|a/g, match => formatMap[match] || '');
    }

    static getOrdinalSuffix(day) {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    updateInput() {
        let value = '';

        if (this.options.multiple) {
            if (this.selectedDates.length > 0) {
                if (this.options.altField) {
                    // we have an altField, so we can be pretty here
                    value = `${this.selectedDates.length} date${this.selectedDates.length !== 1 ? 's' : ''} selected`;
                } else {
                    value = this.selectedDates.map(date => this.formatDate(date)).join(this.options.multipleSeparator);
                }
            }
        } else if (this.options.range && this.selectedDate && this.selectedEndDate) {
            if (this.options.altField) {
                // we have an altField, so we can be pretty here
                value = `${this.formatDate(this.selectedDate)} - ${this.formatDate(this.selectedEndDate)}`;
            } else {
                value = this.formatDate(this.selectedDate) + this.options.multipleSeparator + this.formatDate(this.selectedEndDate);
            }
        } else if (this.selectedDate) {
            value = this.formatDate(this.selectedDate);
        }

        this.input.value = value;

        // Update alt field
        if (this.options.altField) {
            const altField = document.getElementById(this.options.altField);
            if (altField) {
                let altValue = '';
                if (this.options.multiple) {
                    altValue = this.selectedDates.map(date => this.formatDate(date, this.options.altFormat)).join(this.options.altFieldMultipleDatesSeparator);
                } else if (this.options.range && this.selectedDate && this.selectedEndDate) {
                    altValue = this.formatDate(this.selectedDate, this.options.altFormat) + this.options.altFieldMultipleDatesSeparator + this.formatDate(this.selectedEndDate, this.options.altFormat);
                } else if (this.selectedDate) {
                    altValue = this.formatDate(this.selectedDate, this.options.altFormat);
                }
                altField.value = altValue;
            }
        }

        // Update time inputs
        if (this.options.timepicker && this.selectedDate) {
            let hours = this.selectedDate.getHours();
            const minutes = this.selectedDate.getMinutes();

            if (this.options.ampm) {
                const isAM = hours < 12;
                const displayHours = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);

                if (this.hoursInput) {
                    this.hoursInput.value = String(displayHours).padStart(2, '0');
                }

                // Update AM/PM buttons
                const ampmButtons = this.popup.querySelectorAll('[data-ampm]');
                ampmButtons.forEach(btn => {
                    btn.classList.toggle('active', btn.dataset.ampm === (isAM ? 'AM' : 'PM'));
                });
            } else {
                if (this.hoursInput) {
                    this.hoursInput.value = String(hours).padStart(2, '0');
                }
            }

            if (this.minutesInput) {
                this.minutesInput.value = String(minutes).padStart(2, '0');
            }
        }

        // Update multiple display
        if (this.options.multiple) {
            this.updateMultipleDisplay();
        }

        // Trigger change event
        this.input.dispatchEvent(new Event('change'));
    }

    render() {
        this.renderTitle();
        if (this.view === 'days') {
            this.renderDays();
        } else if (this.view === 'months') {
            this.renderMonths();
        } else if (this.view === 'years') {
            this.renderYears();
        }
    }

    renderTitle() {
        let title = '';
        if (this.view === 'days') {
            title = `${this.locale.months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        } else if (this.view === 'months') {
            title = this.currentDate.getFullYear();
        } else if (this.view === 'years') {
            title = `${this.currentYear} - ${this.currentYear + 11}`;
        }
        this.title.textContent = title;
    }

    renderDays() {
        this.grid.className = 'fdatepicker-grid';

        // Build day headers based on first day of week
        let headerHtml = '';
        for (let i = 0; i < 7; i++) {
            const dayIndex = (this.options.firstDayOfWeek + i) % 7;
            headerHtml += `<div class="fdatepicker-day-header">${this.locale.daysMin[dayIndex]}</div>`;
        }
        this.grid.innerHTML = headerHtml;

        const firstDayOfWeek = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const today = new Date();

        // Calculate days from previous month based on first day of week setting
        let prevMonthDays = (firstDayOfWeek.getDay() - this.options.firstDayOfWeek + 7) % 7;
        const prevMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 0);

        for (let i = prevMonthDays - 1; i >= 0; i--) {
            const day = document.createElement('div');
            day.className = 'fdatepicker-day other-month';
            day.textContent = prevMonth.getDate() - i;
            day.setAttribute('tabindex', '-1');
            this.grid.appendChild(day);
        }

        // Days of current month
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'fdatepicker-day';
            dayEl.textContent = day;
            dayEl.setAttribute('tabindex', '-1');

            const dayDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);

            // Add weekend class based on first day of week setting
            const dayOfWeek = dayDate.getDay();
            const adjustedDayOfWeek = (dayOfWeek - this.options.firstDayOfWeek + 7) % 7;
            if (adjustedDayOfWeek === 5 || adjustedDayOfWeek === 6) { // Saturday and Sunday relative to first day
                dayEl.classList.add('weekend');
            }

            // Add today class
            if (dayDate.toDateString() === today.toDateString()) {
                dayEl.classList.add('today');
            }

            if (this.isDateDisabled(dayDate)) {
                dayEl.classList.add('disabled');
            }

            // Handle different selection modes
            if (this.options.multiple) {
                // Multiple selection
                const isSelected = this.selectedDates.some(date => 
                    date.toDateString() === dayDate.toDateString()
                );
                if (isSelected) {
                    dayEl.classList.add('multi-selected');
                }
            } else {
                // Single or range selection
                if (this.selectedDate && dayDate.toDateString() === this.selectedDate.toDateString()) {
                    dayEl.classList.add(this.options.range ? 'range-start' : 'selected');
                }

                if (this.options.range && this.selectedEndDate && dayDate.toDateString() === this.selectedEndDate.toDateString()) {
                    dayEl.classList.add('range-end');
                }

                if (this.options.range && this.selectedDate && this.selectedEndDate && 
                    dayDate > this.selectedDate && dayDate < this.selectedEndDate) {
                    dayEl.classList.add('in-range');
                }
            }

            this.grid.appendChild(dayEl);
        }

        // Days from next month
        const totalCells = this.grid.children.length - 7;
        const remainingCells = 42 - totalCells;

        for (let day = 1; day <= remainingCells; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'fdatepicker-day other-month';
            dayEl.textContent = day;
            dayEl.setAttribute('tabindex', '-1');
            this.grid.appendChild(dayEl);
        }
    }

    renderMonths() {
        this.grid.className = 'fdatepicker-grid months';
        this.grid.innerHTML = '';

        for (let month = 0; month < 12; month++) {
            const monthEl = document.createElement('div');
            monthEl.className = 'fdatepicker-month';
            monthEl.textContent = this.locale.monthsShort[month];
            monthEl.dataset.month = month;
            monthEl.setAttribute('tabindex', '-1');

            if (month === new Date().getMonth() && this.currentDate.getFullYear() === new Date().getFullYear()) {
                monthEl.classList.add('current');
            }

            if (this.selectedDate && month === this.selectedDate.getMonth() && 
                this.currentDate.getFullYear() === this.selectedDate.getFullYear()) {
                monthEl.classList.add('selected');
            }

            this.grid.appendChild(monthEl);
        }
    }

    renderYears() {
        this.grid.className = 'fdatepicker-grid years';
        this.grid.innerHTML = '';

        for (let year = this.currentYear; year < this.currentYear + 12; year++) {
            const yearEl = document.createElement('div');
            yearEl.className = 'fdatepicker-year';
            yearEl.textContent = year;
            yearEl.dataset.year = year;
            yearEl.setAttribute('tabindex', '-1');

            if (year === new Date().getFullYear()) {
                yearEl.classList.add('current');
            }

            if (this.selectedDate && year === this.selectedDate.getFullYear()) {
                yearEl.classList.add('selected');
            }

            this.grid.appendChild(yearEl);
        }
    }
}
