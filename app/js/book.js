document.addEventListener('DOMContentLoaded', function() {
    // Variables pour le suivi de l'état
    let currentDate = new Date(); // Date actuelle (aujourd'hui)
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let startDate = null;
    let endDate = null;
    let isSelectingStartDate = true;

    // Éléments DOM
    const calendarEl = document.getElementById('calendar');
    const currentMonthEl = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const reservationFormSection = document.getElementById('reservationFormSection');
    const selectedDateRangeEl = document.getElementById('selectedDateRange');
    const reservationForm = document.getElementById('reservationForm');
    const bookButton = document.getElementById('bookButton');
    const passwordInput = document.getElementById('password');
    const passwordError = document.getElementById('passwordError');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const gdprCheckbox = document.getElementById('gdpr');

    // Regex pour les validations
    const nameRegex = /^[A-Za-zÀ-ÿ\s'-]{2,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{12,}$/;

    // Noms des mois en français
    const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

    // Initialiser le calendrier
    generateCalendar(currentMonth, currentYear);
    updateMonthDisplay();
    validateForm();

    // Gestionnaires d'événements pour la navigation du calendrier
    prevMonthBtn.addEventListener('click', function() {
        navigateMonth(-1);
    });

    nextMonthBtn.addEventListener('click', function() {
        navigateMonth(1);
    });

    // Gestionnaires d'événements pour le formulaire
    reservationForm.addEventListener('input', validateForm);
    reservationForm.addEventListener('change', validateForm);

    reservationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        // Vérifier la validité du formulaire
        const errors = [];
        
        if (!firstNameInput.value.trim()) {
            errors.push('Prénom requis.');
        } else if (!nameRegex.test(firstNameInput.value)) {
            errors.push('Prénom invalide (minimum 2 caractères, lettres, espaces, apostrophes ou tirets).');
        }

        if (!lastNameInput.value.trim()) {
            errors.push('Nom requis.');
        } else if (!nameRegex.test(lastNameInput.value)) {
            errors.push('Nom invalide (minimum 2 caractères, lettres, espaces, apostrophes ou tirets).');
        }

        if (!emailInput.value.trim()) {
            errors.push('Adresse email requise.');
        } else if (!emailRegex.test(emailInput.value)) {
            errors.push('Adresse email invalide.');
        }

        if (!phoneInput.value.trim()) {
            errors.push('Numéro de téléphone requis.');
        } else if (!phoneRegex.test(phoneInput.value)) {
            errors.push('Numéro de téléphone invalide (ex. +1234567890).');
        }

        if (!passwordInput.value.trim()) {
            errors.push('Mot de passe requis.');
        } else if (!passwordRegex.test(passwordInput.value)) {
            errors.push('Mot de passe invalide (minimum 12 caractères, 1 majuscule, 1 chiffre, 1 symbole).');
        }

        if (!gdprCheckbox.checked) {
            errors.push('Vous devez accepter les conditions RGPD.');
        }

        if (errors.length > 0) {
            // Afficher une alerte avec les erreurs
            alert('Veuillez corriger les erreurs suivantes :\n- ' + errors.join('\n- '));
            validateForm(); // Mettre à jour les messages d'erreur sous les champs
        } else {
            // Stocker les données pour payment.html
            localStorage.setItem('reservation', JSON.stringify({
                room: 'Suite Deluxe',
                dates: selectedDateRangeEl.textContent,
                nights: calculateNights(startDate, endDate),
                price: calculateNights(startDate, endDate) * 120 // 120€ par nuit
            }));
            // Rediriger directement vers payment.html
            window.location.href = 'payment.html';
        }
    });

    // Fonction pour valider le formulaire
    function validateForm() {
        let isValid = true;

        // Réinitialiser les messages d'erreur
        reservationForm.querySelectorAll('.error-message').forEach(error => error.textContent = '');

        // Valider le prénom
        if (!firstNameInput.value.trim()) {
            isValid = false;
            document.getElementById('firstNameError').textContent = 'Veuillez entrer votre prénom.';
        } else if (!nameRegex.test(firstNameInput.value)) {
            isValid = false;
            document.getElementById('firstNameError').textContent = 'Le prénom doit contenir au moins 2 caractères (lettres, espaces, apostrophes ou tirets).';
        }

        // Valider le nom
        if (!lastNameInput.value.trim()) {
            isValid = false;
            document.getElementById('lastNameError').textContent = 'Veuillez entrer votre nom.';
        } else if (!nameRegex.test(lastNameInput.value)) {
            isValid = false;
            document.getElementById('lastNameError').textContent = 'Le nom doit contenir au moins 2 caractères (lettres, espaces, apostrophes ou tirets).';
        }

        // Valider l'email
        if (!emailInput.value.trim()) {
            isValid = false;
            document.getElementById('emailError').textContent = 'Veuillez entrer votre adresse email.';
        } else if (!emailRegex.test(emailInput.value)) {
            isValid = false;
            document.getElementById('emailError').textContent = 'Veuillez entrer un email valide.';
        }

        // Valider le téléphone
        if (!phoneInput.value.trim()) {
            isValid = false;
            document.getElementById('phoneError').textContent = 'Veuillez entrer votre numéro de téléphone.';
        } else if (!phoneRegex.test(phoneInput.value)) {
            isValid = false;
            document.getElementById('phoneError').textContent = 'Veuillez entrer un numéro de téléphone valide (ex. +1234567890).';
        }

        // Valider le mot de passe
        if (!passwordInput.value.trim()) {
            isValid = false;
            document.getElementById('passwordError').textContent = 'Veuillez entrer un mot de passe.';
        } else if (!passwordRegex.test(passwordInput.value)) {
            isValid = false;
            document.getElementById('passwordError').textContent = 'Le mot de passe doit contenir au moins 12 caractères, 1 majuscule, 1 chiffre et 1 symbole (!@#$%^&*).';
        }

        // Vérifier la case GDPR
        if (!gdprCheckbox.checked) {
            isValid = false;
            document.getElementById('gdprError').textContent = 'Vous devez accepter les conditions RGPD.';
        }

        // Activer ou désactiver le bouton
        bookButton.disabled = !isValid;
        bookButton.classList.toggle('disabled', !isValid);
    }

    // Calculer le nombre de nuits
    function calculateNights(start, end) {
        const diffTime = Math.abs(end - start);
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // Générer le calendrier
    function generateCalendar(month, year) {
        calendarEl.innerHTML = '';
        
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date(); // Date actuelle
        const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        
        // Ajouter des jours vides avant le début du mois
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day disabled';
            calendarEl.appendChild(emptyDay);
        }
        
        // Générer les jours du mois
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;
            dayEl.setAttribute('role', 'gridcell');
            dayEl.setAttribute('aria-label', `${day} ${monthNames[month]} ${year}`);
            
            const checkDate = new Date(year, month, day);
            // Désactiver les dates antérieures à aujourd'hui
            if (checkDate < todayDateOnly) {
                dayEl.className = 'calendar-day disabled';
                console.log(`Date ${day}/${month + 1}/${year} disabled`); // Débogage
            } else {
                // Marquer la date actuelle
                if (checkDate.getDate() === today.getDate() &&
                    checkDate.getMonth() === today.getMonth() &&
                    checkDate.getFullYear() === today.getFullYear()) {
                    dayEl.classList.add('today');
                }
                
                // Gérer les dates sélectionnées
                if (startDate && endDate) {
                    if (isSameDate(checkDate, startDate)) {
                        dayEl.classList.add('selected', 'start-date');
                    } else if (isSameDate(checkDate, endDate)) {
                        dayEl.classList.add('selected', 'end-date');
                    } else if (checkDate > startDate && checkDate < endDate) {
                        dayEl.classList.add('in-range');
                    }
                } else if (startDate && isSameDate(checkDate, startDate)) {
                    dayEl.classList.add('selected', 'start-date');
                }
                
                // Ajouter un gestionnaire d'événements pour la sélection
                dayEl.addEventListener('click', function() {
                    handleDateSelection(new Date(year, month, day));
                });
            }
            
            calendarEl.appendChild(dayEl);
        }
    }

    // Gérer la sélection de date
    function handleDateSelection(date) {
        if (isSelectingStartDate || !startDate || date < startDate) {
            startDate = date;
            endDate = null;
            isSelectingStartDate = false;
        } else {
            endDate = date;
            isSelectingStartDate = true;
            reservationFormSection.classList.remove('hidden');
        }
        
        generateCalendar(currentMonth, currentYear);
        updateDateRangeDisplay();
    }

    // Mettre à jour l'affichage de la plage de dates
    function updateDateRangeDisplay() {
        if (startDate && endDate) {
            selectedDateRangeEl.textContent = `Du ${formatDate(startDate)} au ${formatDate(endDate)}`;
        } else if (startDate) {
            selectedDateRangeEl.textContent = `Arrivée: ${formatDate(startDate)} - Veuillez sélectionner la date de départ`;
        } else {
            selectedDateRangeEl.textContent = 'Veuillez sélectionner des dates';
        }
    }

    // Formater la date
    function formatDate(date) {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }

    // Naviguer entre les mois
    function navigateMonth(direction) {
        currentMonth += direction;
        
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        } else if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        
        generateCalendar(currentMonth, currentYear);
        updateMonthDisplay();
    }

    // Mettre à jour l'affichage du mois et de l'année
    function updateMonthDisplay() {
        currentMonthEl.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }

    // Vérifier si deux dates sont identiques
    function isSameDate(date1, date2) {
        return date1.getDate() === date2.getDate() && 
               date1.getMonth() === date2.getMonth() && 
               date1.getFullYear() === date2.getFullYear();
    }
});