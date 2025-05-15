document.addEventListener('DOMContentLoaded', () => {
    const calendar1 = document.getElementById('calendar1');
    const calendar2 = document.getElementById('calendar2');
    const calendar1Title = document.getElementById('calendar1-title');
    const calendar2Title = document.getElementById('calendar2-title');
    const prevMonth1 = document.getElementById('prevMonth1');
    const nextMonth1 = document.getElementById('nextMonth1');
    const prevMonth2 = document.getElementById('prevMonth2');
    const nextMonth2 = document.getElementById('nextMonth2');
    const selectedDateDisplay = document.getElementById('selectedDateRange');
    const reservationFormSection = document.getElementById('reservationFormSection');
    const bookButton = document.getElementById('bookButton');
    const addToCartButton = document.getElementById('addToCartButton');
    const reservationForm = document.getElementById('reservationForm');
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const password = document.getElementById('password');
    const gdpr = document.getElementById('gdpr');
    const cartCount = document.getElementById('cart-count');

    let selectedStartDate = null;
    let selectedEndDate = null;
    let currentMonth1 = new Date().getMonth();
    let currentYear1 = new Date().getFullYear();
    let currentMonth2 = currentMonth1 === 11 ? 0 : currentMonth1 + 1;
    let currentYear2 = currentMonth1 === 11 ? currentYear1 + 1 : currentYear1;
    const pricePerMonth = 39;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Initialiser les boutons comme désactivés
    bookButton.disabled = true;
    addToCartButton.disabled = true;

    // Mettre à jour le nombre d'éléments dans le panier
    function updateCartCount() {
        const totalItems = cart.length;
        cartCount.textContent = totalItems;
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Générer les calendriers
    function generateCalendars() {
        generateCalendar(calendar1, currentYear1, currentMonth1, calendar1Title);
        generateCalendar(calendar2, currentYear2, currentMonth2, calendar2Title);
        updateNavigationButtons();
    }

    // Générer un calendrier pour un mois et une année donnés
    function generateCalendar(container, year, month, titleElement) {
        container.innerHTML = '';

        const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        const dayNames = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

        titleElement.textContent = `${monthNames[month]} ${year}`;

        const daysHeader = document.createElement('div');
        daysHeader.classList.add('days');
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.classList.add('day-header');
            dayHeader.textContent = day;
            daysHeader.appendChild(dayHeader);
        });
        container.appendChild(daysHeader);

        const daysContainer = document.createElement('div');
        daysContainer.classList.add('days');

        const firstDay = new Date(year, month, 1).getDay();
        const lastDate = new Date(year, month + 1, 0).getDate();
        const prevLastDate = new Date(year, month, 0).getDate();

        const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;

        for (let i = adjustedFirstDay; i > 0; i--) {
            const day = document.createElement('div');
            day.classList.add('day', 'disabled');
            day.textContent = prevLastDate - i + 1;
            daysContainer.appendChild(day);
        }

        const today = new Date();
        for (let i = 1; i <= lastDate; i++) {
            const day = document.createElement('div');
            day.classList.add('day');
            day.textContent = i;
            day.dataset.date = new Date(year, month, i).toISOString().split('T')[0];

            const currentDate = new Date(year, month, i);
            if (container === calendar1 && currentDate < today.setHours(0, 0, 0, 0)) {
                day.classList.add('disabled');
            } else {
                day.addEventListener('click', () => {
                    if (container === calendar1) {
                        selectStartDate(currentDate);
                    } else {
                        selectEndDate(currentDate);
                    }
                });
            }

            daysContainer.appendChild(day);
        }

        const totalDays = adjustedFirstDay + lastDate;
        const remainingDays = (7 - (totalDays % 7)) % 7;
        for (let i = 1; i <= remainingDays; i++) {
            const day = document.createElement('div');
            day.classList.add('day', 'disabled');
            day.textContent = i;
            daysContainer.appendChild(day);
        }

        container.appendChild(daysContainer);
    }

    function updateNavigationButtons() {
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        prevMonth1.disabled = currentYear1 === currentYear && currentMonth1 === currentMonth;
        nextMonth1.disabled = false;
        prevMonth2.disabled = currentYear2 === currentYear1 && currentMonth2 <= currentMonth1 + 1;
        nextMonth2.disabled = false;
    }

    function selectStartDate(startDate) {
        selectedStartDate = startDate;
        selectedEndDate = new Date(startDate);
        selectedEndDate.setDate(startDate.getDate() + 29);

        const endMonth = selectedEndDate.getMonth();
        const endYear = selectedEndDate.getFullYear();
        currentMonth2 = endMonth;
        currentYear2 = endYear;

        updateCalendars();
        updateSelectedDateDisplay();
        reservationFormSection.classList.remove('hidden');
        updateButtonState();
    }

    function selectEndDate(endDate) {
        if (endDate < selectedStartDate) {
            return;
        }

        const diffDays = Math.round((endDate - selectedStartDate) / (1000 * 60 * 60 * 24));
        const months = Math.ceil(diffDays / 30);
        selectedEndDate = new Date(selectedStartDate);
        selectedEndDate.setDate(selectedStartDate.getDate() + months * 30 - 1);

        updateCalendars();
        updateSelectedDateDisplay();
        updateButtonState();
    }

    function updateCalendars() {
        generateCalendars();
        const allDays = document.querySelectorAll('.calendar-grid .day:not(.disabled)');
        allDays.forEach(day => {
            const dayDate = new Date(day.dataset.date);
            day.classList.remove('selected');
            if (selectedStartDate && selectedEndDate && dayDate >= selectedStartDate && dayDate <= selectedEndDate) {
                day.classList.add('selected');
            }
        });
    }

    function updateSelectedDateDisplay() {
        if (selectedStartDate && selectedEndDate) {
            const options = { day: 'numeric', month: 'long', year: 'numeric' };
            const startStr = selectedStartDate.toLocaleDateString('fr-FR', options);
            const endStr = selectedEndDate.toLocaleDateString('fr-FR', options);
            const diffDays = Math.round((selectedEndDate - selectedStartDate) / (1000 * 60 * 60 * 24)) + 1;
            const months = Math.ceil(diffDays / 30);
            const totalPrice = months * pricePerMonth;
            selectedDateDisplay.textContent = `${startStr} au ${endStr} (${months} mois, Total : ${totalPrice} $)`;
        } else {
            selectedDateDisplay.textContent = 'Veuillez sélectionner une date';
        }
    }

    function updateButtonState() {
        const isFormValid = validateForm(true); // Validation sans affichage des erreurs
        const isDateSelected = selectedStartDate !== null && selectedEndDate !== null;
        bookButton.disabled = !(isFormValid && isDateSelected);
        addToCartButton.disabled = !(isFormValid && isDateSelected);
    }

    [firstName, lastName, email, phone, password, gdpr].forEach(input => {
        input.addEventListener('input', () => {
            updateButtonState();
        });
        if (input.type === 'checkbox') {
            input.addEventListener('change', () => {
                updateButtonState();
            });
        }
    });

    // Gérer la navigation
    prevMonth1.addEventListener('click', () => {
        if (currentMonth1 === 0) {
            currentMonth1 = 11;
            currentYear1--;
        } else {
            currentMonth1--;
        }
        updateCalendars();
    });

    nextMonth1.addEventListener('click', () => {
        if (currentMonth1 === 11) {
            currentMonth1 = 0;
            currentYear1++;
        } else {
            currentMonth1++;
        }
        updateCalendars();
    });

    prevMonth2.addEventListener('click', () => {
        if (currentMonth2 === 0) {
            currentMonth2 = 11;
            currentYear2--;
        } else {
            currentMonth2--;
        }
        updateCalendars();
    });

    nextMonth2.addEventListener('click', () => {
        if (currentMonth2 === 11) {
            currentMonth2 = 0;
            currentYear2++;
        } else {
            currentMonth2++;
        }
        updateCalendars();
    });

    // Gérer la soumission du formulaire
    reservationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm()) {
            alert('Réservation effectuée avec succès !');
            reservationForm.reset();
            selectedStartDate = null;
            selectedEndDate = null;
            updateButtonState();
            reservationFormSection.classList.add('hidden');
        }
    });

    // Gérer l'ajout au panier
    addToCartButton.addEventListener('click', () => {
        if (validateForm()) {
            const subscription = {
                type: 'subscription',
                startDate: selectedStartDate.toISOString().split('T')[0],
                endDate: selectedEndDate.toISOString().split('T')[0],
                months: Math.ceil((Math.round((selectedEndDate - selectedStartDate) / (1000 * 60 * 60 * 24)) + 1) / 30),
                price: Math.ceil((Math.round((selectedEndDate - selectedStartDate) / (1000 * 60 * 60 * 24)) + 1) / 30) * pricePerMonth,
                quantity: 1
            };
            cart.push(subscription);
            updateCartCount();
            alert('Abonnement ajouté au panier !');
            reservationForm.reset();
            selectedStartDate = null;
            selectedEndDate = null;
            updateButtonState();
            reservationFormSection.classList.add('hidden');
        }
    });

    // Valider le formulaire
    function validateForm(showErrors = false) {
        let isValid = true;
        const fields = [
            { id: 'firstName', errorId: 'firstNameError', message: 'Veuillez entrer votre prénom' },
            { id: 'lastName', errorId: 'lastNameError', message: 'Veuillez entrer votre nom' },
            { id: 'email', errorId: 'emailError', message: 'Veuillez entrer une adresse email valide', type: 'email' },
            { id: 'phone', errorId: 'phoneError', message: 'Veuillez entrer un numéro de téléphone valide', type: 'tel' },
            {
                id: 'password',
                errorId: 'passwordError',
                message: 'Le mot de passe doit contenir au moins 12 caractères, 1 majuscule, 1 minuscule et 1 caractère spécial',
                type: 'password'
            },
            { id: 'gdpr', errorId: 'gdprError', message: 'Vous devez accepter les conditions RGPD', type: 'checkbox' }
        ];

        fields.forEach(field => {
            const input = document.getElementById(field.id);
            const error = document.getElementById(field.errorId);
            if (showErrors) {
                error.textContent = '';
            }

            if (field.type === 'checkbox') {
                if (!input.checked) {
                    if (showErrors) error.textContent = field.message;
                    isValid = false;
                }
            } else if (field.type === 'email') {
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!input.value.trim() || !emailPattern.test(input.value)) {
                    if (showErrors) error.textContent = field.message;
                    isValid = false;
                }
            } else if (field.type === 'tel') {
                const phonePattern = /^\+?\d{10,15}$/;
                if (!input.value.trim() || !phonePattern.test(input.value)) {
                    if (showErrors) error.textContent = field.message;
                    isValid = false;
                }
            } else if (field.type === 'password') {
                const passwordPattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*(),.?":{}|<>]).{12,}$/;
                if (!input.value || !passwordPattern.test(input.value)) {
                    if (showErrors) error.textContent = field.message;
                    isValid = false;
                }
            } else {
                if (!input.value.trim()) {
                    if (showErrors) error.textContent = field.message;
                    isValid = false;
                }
            }
        });

        return isValid;
    }

    // Initialiser le panier et les calendriers
    updateCartCount();
    generateCalendars();
});