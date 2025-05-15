document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('payment-form');
    const cardholderNameInput = document.getElementById('cardholder-name');
    const cardNumberInput = document.getElementById('card-number');
    const cardExpiryInput = document.getElementById('card-expiry');
    const cardCvcInput = document.getElementById('card-cvc');
    const cardTypeSpan = document.getElementById('card-type');
    const payButton = document.getElementById('payButton');
    const summaryContent = document.getElementById('summary-content');

    const nameRegex = /^[A-Za-zÀ-ÿ\s'-]{2,}$/;
    const cardNumberRegexVisaMaster = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/;
    const cardNumberRegexAmex = /^\d{4}\s\d{6}\s\d{5}$/;
    const expiryRegex = /^(0[1-9]|1[0-2])\/[0-9]{2}$/;
    const cvcRegex = /^\d{3}$/;

    const checkoutData = JSON.parse(localStorage.getItem('checkoutData'));
    if (checkoutData && checkoutData.items && checkoutData.items.length > 0) {
        const itemsHtml = checkoutData.items.map(item => {
            if (item.type === 'reservation') {
                return `
                    <p><strong>Room:</strong> ${item.room}</p>
                    <p><strong>Dates:</strong> ${item.dates}</p>
                    <p><strong>Nights:</strong> ${item.nights}</p>
                    <p><strong>Price:</strong> $${item.price.toFixed(2)}</p>
                    <hr>
                `;
            } else {
                return `
                    <p><strong>Item:</strong> ${item.name}</p>
                    <p><strong>Price:</strong> $${item.price.toFixed(2)}</p>
                    <p><strong>Quantity:</strong> ${item.quantity}</p>
                    <hr>
                `;
            }
        }).join('');
        summaryContent.innerHTML = `
            ${itemsHtml}
            <p class="total-price"><strong>Total Price:</strong> $${checkoutData.totalPrice.toFixed(2)}</p>
        `;
    } else {
        summaryContent.innerHTML = '<p>No cart data found. Please return to the cart or reservation page.</p>';
    }

    function detectCardType(number) {
        const cleaned = number.replace(/\D/g, '');
        if (/^4/.test(cleaned)) return { type: 'Visa', length: 16, format: [4, 4, 4, 4] };
        if (/^5[1-5]/.test(cleaned)) return { type: 'Mastercard', length: 16, format: [4, 4, 4, 4] };
        if (/^3[47]/.test(cleaned)) return { type: 'Amex', length: 15, format: [4, 6, 5] };
        return { type: '', length: 16, format: [4, 4, 4, 4] };
    }

    cardNumberInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        const card = detectCardType(value);
        cardTypeSpan.textContent = card.type || 'Card';
        cardTypeSpan.className = `card-type ${card.type.toLowerCase() || 'unknown'}`;

        if (card.length === 15 && value.length > 15) value = value.slice(0, 15);
        if (card.length === 16 && value.length > 16) value = value.slice(0, 16);

        let formatted = '';
        let index = 0;
        for (let len of card.format) {
            if (index < value.length) {
                formatted += value.slice(index, index + len) + ' ';
                index += len;
            }
        }
        e.target.value = formatted.trim();
        validateForm();
    });

    cardExpiryInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);
        if (value.length >= 2) {
            e.target.value = value.slice(0, 2) + '/' + value.slice(2);
        } else {
            e.target.value = value;
        }
        validateForm();
    });

    cardCvcInput.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 3) value = value.slice(0, 3);
        e.target.value = value;
        validateForm();
    });

    function validateForm() {
        let isValid = true;

        form.querySelectorAll('.error-message').forEach(error => error.textContent = '');

        if (!cardholderNameInput.value.trim()) {
            isValid = false;
            document.getElementById('cardholder-name-error').textContent = 'Please enter the cardholder name.';
        } else if (!nameRegex.test(cardholderNameInput.value)) {
            isValid = false;
            document.getElementById('cardholder-name-error').textContent = 'Name must be at least 2 characters (letters, spaces, apostrophes, or hyphens).';
        }

        const card = detectCardType(cardNumberInput.value);
        if (!cardNumberInput.value.trim()) {
            isValid = false;
            document.getElementById('card-number-error').textContent = 'Please enter the card number.';
        } else if (card.type === 'Amex' && !cardNumberRegexAmex.test(cardNumberInput.value)) {
            isValid = false;
            document.getElementById('card-number-error').textContent = 'Amex card number must be 15 digits.';
        } else if ((card.type === 'Visa' || card.type === 'Mastercard') && !cardNumberRegexVisaMaster.test(cardNumberInput.value)) {
            isValid = false;
            document.getElementById('card-number-error').textContent = 'Visa/Mastercard number must be 16 digits.';
        }

        if (!cardExpiryInput.value.trim()) {
            isValid = false;
            document.getElementById('card-expiry-error').textContent = 'Please enter the expiration date.';
        } else if (!expiryRegex.test(cardExpiryInput.value)) {
            isValid = false;
            document.getElementById('card-expiry-error').textContent = 'Expiration date must be in MM/YY format.';
        } else {
            const [month, year] = cardExpiryInput.value.split('/').map(Number);
            const today = new Date();
            const expiryDate = new Date(2000 + year, month - 1, 1);
            if (expiryDate < today) {
                isValid = false;
                document.getElementById('card-expiry-error').textContent = 'Card has expired.';
            }
        }

        if (!cardCvcInput.value.trim()) {
            isValid = false;
            document.getElementById('card-cvc-error').textContent = 'Please enter the CVC.';
        } else if (!cvcRegex.test(cardCvcInput.value)) {
            isValid = false;
            document.getElementById('card-cvc-error').textContent = 'CVC must be 3 digits.';
        }

        payButton.disabled = !isValid;
        payButton.classList.toggle('disabled', !isValid);
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!payButton.disabled) {
            alert('Payment processed successfully!');
            localStorage.removeItem('reservation');
            localStorage.removeItem('checkoutData');
            localStorage.removeItem('cart');
            window.location.href = 'confirmation.html';
        }
    });

    validateForm();
});