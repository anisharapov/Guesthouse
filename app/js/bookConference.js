document.addEventListener('DOMContentLoaded', () => {
    const calendar = document.getElementById('calendar');
    const currentMonthElement = document.getElementById('currentMonth');
    const prevMonthButton = document.getElementById('prevMonth');
    const nextMonthButton = document.getElementById('nextMonth');
    const reservationFormSection = document.getElementById('reservationFormSection');
    const selectedDateDisplay = document.getElementById('selectedDateRange');
    const bookButton = document.getElementById('bookButton');
    const addToCartButton = document.getElementById('addToCartButton');
    const form = document.getElementById('reservationForm');
    const cartCount = document.getElementById('cart-count');
    const inputs = {
        firstName: document.getElementById('firstName'),
        lastName: document.getElementById('lastName'),
        email: document.getElementById('email'),
        phone: document.getElementById('phone'),
        password: document.getElementById('password'),
        gdpr: document.getElementById('gdpr')
    };

    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let selectedDates = [];
    const pricePerNight = 149; // Fixed price per night in USD

    // Format date as YYYY-MM-DD for comparison
    const formatDate = (date) => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    // Get today's date for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = formatDate(today);

    // Regex for validations
    const nameRegex = /^[A-Za-zÀ-ÿ\s'-]{2,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?\d{10,15}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{12,}$/;

    // Validate form fields and display error messages in real-time
    function validateField(input, errorElement, validationFn, errorMessage) {
        const value = input.type === 'checkbox' ? input.checked : input.value.trim();
        const isValid = input.type === 'checkbox' ? value : validationFn(value);
        errorElement.textContent = isValid ? '' : errorMessage;
        return isValid;
    }

    // Check if form is valid
    function isFormValid() {
        const validations = [
            validateField(inputs.firstName, document.getElementById('firstNameError'), value => nameRegex.test(value), 'Please enter your first name'),
            validateField(inputs.lastName, document.getElementById('lastNameError'), value => nameRegex.test(value), 'Please enter your last name'),
            validateField(inputs.email, document.getElementById('emailError'), value => emailRegex.test(value), 'Please enter a valid email address'),
            validateField(inputs.phone, document.getElementById('phoneError'), value => phoneRegex.test(value.replace(/\s/g, '')), 'Please enter a valid phone number'),
            validateField(inputs.password, document.getElementById('passwordError'), value => passwordRegex.test(value), 'The password must contain at least 12 characters, 1 uppercase letter, 1 lowercase letter, and 1 special character'),
            validateField(inputs.gdpr, document.getElementById('gdprError'), value => value, 'Please accept the GDPR terms')
        ];
        return validations.every(isValid => isValid) && selectedDates.length === 2;
    }

    // Update Book and Add to Cart button states
    function updateButtonStates() {
        const isValid = isFormValid();
        bookButton.disabled = !isValid;
        addToCartButton.disabled = !isValid;
    }

    // Calculate total price based on selected dates
    function calculateTotalPrice(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const nights = Math.round((end - start) / (1000 * 60 * 60 * 24));
        return nights * pricePerNight;
    }

    // Get all dates between start and end (inclusive)
    function getDatesInRange(startDate, endDate) {
        const dates = [];
        let current = new Date(startDate);
        const end = new Date(endDate);
        while (current <= end) {
            dates.push(formatDate(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }

    // Update reservation form display
    function updateReservationDisplay() {
        if (selectedDates.length === 2) {
            selectedDates.sort();
            const totalPrice = calculateTotalPrice(selectedDates[0], selectedDates[1]);
            const nights = Math.round((new Date(selectedDates[1]) - new Date(selectedDates[0])) / (1000 * 60 * 60 * 24));
            const nightLabel = nights === 1 ? 'night' : 'nights';
            selectedDateDisplay.innerHTML = `${selectedDates[0]} to ${selectedDates[1]}<br><strong>Total ${nightLabel}:</strong> ${nights}<br><strong>Total Price:</strong> $${totalPrice}`;
            reservationFormSection.classList.remove('hidden');
            updateCalendarSelection();
        } else {
            selectedDateDisplay.textContent = 'Please select dates';
            reservationFormSection.classList.add('hidden');
        }
        updateButtonStates();
    }

    // Update calendar to highlight all dates in the selected range
    function updateCalendarSelection() {
        document.querySelectorAll('.calendar-day').forEach(cell => {
            cell.classList.remove('selected');
            if (selectedDates.length === 2) {
                const datesInRange = getDatesInRange(selectedDates[0], selectedDates[1]);
                if (datesInRange.includes(cell.dataset.date)) {
                    cell.classList.add('selected');
                }
            } else if (selectedDates.length === 1 && cell.dataset.date === selectedDates[0]) {
                cell.classList.add('selected');
            }
        });
    }

    // Generate calendar for the given month and year
    function generateCalendar(month, year) {
        calendar.innerHTML = '';
        currentMonthElement.textContent = `${new Date(year, month).toLocaleString('en-US', { month: 'long' })} ${year}`;

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let i = 0; i < firstDay; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'empty');
            calendar.appendChild(emptyCell);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateString = formatDate(date);
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            dayCell.dataset.date = dateString;

            const dayNumber = document.createElement('span');
            dayNumber.classList.add('day-number');
            dayNumber.textContent = day;

            const priceTag = document.createElement('span');
            priceTag.classList.add('price-tag');

            if (date < today) {
                dayCell.classList.add('disabled');
                dayCell.setAttribute('aria-disabled', 'true');
                priceTag.textContent = '';
            } else {
                priceTag.textContent = `$${pricePerNight}`;
                dayCell.addEventListener('click', () => selectDate(dateString, dayCell));
            }

            dayCell.appendChild(dayNumber);
            dayCell.appendChild(priceTag);
            calendar.appendChild(dayCell);
        }

        updateCalendarSelection();
    }

    // Handle date selection
    function selectDate(dateString, dayCell) {
        if (!selectedDates.includes(dateString)) {
            if (selectedDates.length < 2) {
                selectedDates.push(dateString);
                dayCell.classList.add('selected');
            } else {
                selectedDates = [dateString];
                document.querySelectorAll('.calendar-day.selected').forEach(cell => cell.classList.remove('selected'));
                dayCell.classList.add('selected');
            }
            updateReservationDisplay();
        }
    }

    // Reset selections
    function resetSelections() {
        selectedDates = [];
        updateReservationDisplay();
    }

    // Update cart count in header
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
        if (cartCount) {
            cartCount.textContent = totalItems;
        }
    }

    // Navigation: Previous month
    prevMonthButton.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        generateCalendar(currentMonth, currentYear);
        resetSelections();
    });

    // Navigation: Next month
    nextMonthButton.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        generateCalendar(currentMonth, currentYear);
        resetSelections();
    });

    // Form input event listeners for real-time validation
    Object.values(inputs).forEach(input => {
        input.addEventListener('input', () => {
            // Validate the specific field
            if (input === inputs.firstName) {
                validateField(input, document.getElementById('firstNameError'), value => nameRegex.test(value), 'Please enter your first name');
            } else if (input === inputs.lastName) {
                validateField(input, document.getElementById('lastNameError'), value => nameRegex.test(value), 'Please enter your last name');
            } else if (input === inputs.email) {
                validateField(input, document.getElementById('emailError'), value => emailRegex.test(value), 'Please enter a valid email address');
            } else if (input === inputs.phone) {
                validateField(input, document.getElementById('phoneError'), value => phoneRegex.test(value.replace(/\s/g, '')), 'Please enter a valid phone number');
            } else if (input === inputs.password) {
                validateField(input, document.getElementById('passwordError'), value => passwordRegex.test(value), 'The password must contain at least 12 characters, 1 uppercase letter, 1 lowercase letter, and 1 special character');
            } else if (input === inputs.gdpr) {
                validateField(input, document.getElementById('gdprError'), value => value, 'Please accept the GDPR terms');
            }
            updateButtonStates();
        });
        input.addEventListener('change', updateButtonStates);
    });

    // Form submission for Book button
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!bookButton.disabled && selectedDates.length === 2) {
            // Validate fields
            const isValid = isFormValid();

            if (isValid) {
                // Calculate reservation details
                selectedDates.sort();
                const totalPrice = calculateTotalPrice(selectedDates[0], selectedDates[1]);
                const nights = Math.round((new Date(selectedDates[1]) - new Date(selectedDates[0])) / (1000 * 60 * 60 * 24));

                // Create reservation object
                const reservation = {
                    type: 'reservation',
                    room: 'Standard Room',
                    dates: `${selectedDates[0]} to ${selectedDates[1]}`,
                    nights: nights,
                    price: totalPrice,
                    quantity: 1
                };

                // Store in localStorage as checkoutData for payment.html
                localStorage.setItem('checkoutData', JSON.stringify({
                    items: [reservation],
                    totalPrice: totalPrice
                }));

                // Redirect to payment.html
                window.location.href = 'payment.html';
            }
        }
    });

    // Add to Cart button click handler
    addToCartButton.addEventListener('click', () => {
        if (!addToCartButton.disabled && selectedDates.length === 2) {
            // Calculate reservation details
            selectedDates.sort();
            const totalPrice = calculateTotalPrice(selectedDates[0], selectedDates[1]);
            const nights = Math.round((new Date(selectedDates[1]) - new Date(selectedDates[0])) / (1000 * 60 * 60 * 24));

            // Get or initialize cart
            const cart = JSON.parse(localStorage.getItem('cart')) || [];

            // Add new reservation to cart
            cart.push({
                type: 'reservation',
                room: 'Standard Room',
                dates: `${selectedDates[0]} to ${selectedDates[1]}`,
                nights: nights,
                price: totalPrice,
                quantity: 1
            });

            // Save cart to localStorage
            localStorage.setItem('cart', JSON.stringify(cart));

            // Update cart count in header
            updateCartCount();

            // Optional: Alert user
            alert('Reservation added to cart!');
        }
    });

    // Initialize calendar, button states, and cart count
    generateCalendar(currentMonth, currentYear);
    updateButtonStates();
    updateCartCount();
});