document.addEventListener('DOMContentLoaded', () => {
    // Afficher le récapitulatif de la réservation
    const reservation = JSON.parse(localStorage.getItem('reservation'));
    if (reservation) {
        document.querySelector('.reservation-summary').innerHTML = `
            <p><strong>Room:</strong> ${reservation.room}</p>
            <p><strong>Dates:</strong> ${reservation.dates}</p>
            <p><strong>Number of nights:</strong> ${reservation.nights}</p>
            <p><strong>Price per night:</strong> ${(reservation.price / reservation.nights).toFixed(2)}€</p>
            <p><strong>Total:</strong> ${reservation.price}€</p>
        `;
    } else {
        document.querySelector('.reservation-summary').innerHTML = '<p>No reservation found.</p>';
    }

    // Initialiser Stripe
    const stripe = Stripe('votre_clé_publique'); // Remplacez par votre clé publique
    const elements = stripe.elements();
    const cardElement = elements.create('card');
    cardElement.mount('#card-element');

    const form = document.getElementById('payment-form');
    const confirmationModal = document.getElementById('confirmation');
    const cardErrors = document.getElementById('card-errors');
    const payButton = document.getElementById('payButton');

    // Gérer la langue
    function changeLanguage() {
        const language = document.getElementById('languageSelect').value;
        const modalTitle = document.getElementById('confirmation-heading');
        const modalMessage = document.querySelector('#confirmation .modal-content p');

        if (language === 'en') {
            modalTitle.textContent = 'Your reservation has been confirmed!';
            modalMessage.textContent = 'Your reservation has been confirmed. You will receive the confirmation by e-mail.';
        } else if (language === 'fr') {
            modalTitle.textContent = 'Votre réservation est confirmée !';
            modalMessage.textContent = 'Merci pour votre réservation. Un e-mail de confirmation a été envoyé à votre adresse.';
        } else if (language === 'ru') {
            modalTitle.textContent = 'Ваше бронирование подтверждено!';
            modalMessage.textContent = 'Спасибо за бронирование. Подтверждение отправлено на ваш e-mail.';
        }
    }

    document.getElementById('languageSelect').addEventListener('change', changeLanguage);
    changeLanguage(); // Initialiser la langue

    // Obtenir le client_secret
    async function getClientSecret() {
        const response = await fetch('/create-payment-intent.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: reservation ? reservation.price * 100 : 1000, currency: 'eur' })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);
        return data.clientSecret;
    }

    // Gérer la soumission du formulaire
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        payButton.disabled = true;

        const cardholderName = document.getElementById('cardholder-name').value;
        if (!cardholderName.trim()) {
            cardErrors.textContent = 'Please enter the cardholder name.';
            payButton.disabled = false;
            console.log(1)
            return;
        }

        try {
            const clientSecret = await getClientSecret();
            const { paymentIntent, error } = await stripe.
            confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        name: cardholderName,
                    },
                },
            });
            console.log(2)

            if (error) {
                cardErrors.textContent = error.message;
                payButton.disabled = false;
                console.log(3)
            } else if (paymentIntent.status === 'succeeded') {
                confirmationModal.showModal();
                form.reset();
                cardElement.clear();
                localStorage.removeItem('reservation');
                console.log(4)
            }
        } catch (err) {
            cardErrors.textContent = 'An error occurred. Please try again.';
            payButton.disabled = false;
        }
    });

    // Fermer la modale
    confirmationModal.querySelector('.close').addEventListener('click', () => {
        confirmationModal.close();
    });

    // Gérer les erreurs de validation en temps réel
    cardElement.addEventListener('change', (event) => {
        cardErrors.textContent = event.error ? event.error.message : '';
    });
});