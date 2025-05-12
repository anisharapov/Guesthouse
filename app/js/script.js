document.addEventListener('DOMContentLoaded', () => {
    // Initialisation du carrousel
    const carrousselContainer = document.querySelector('.carroussel-container');
    const items = document.querySelectorAll('.carroussel-item');
    let currentIndex = 0;

    function showNextItem() {
        currentIndex = (currentIndex + 1) % items.length;
        carrousselContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    setInterval(showNextItem, 5000);

    // Validation du formulaire de réinitialisation
    const form = document.getElementById('resetForm');
    if (form) {
        const emailInput = document.getElementById('email');
        const emailError = document.getElementById('emailError');

        form.addEventListener('submit', (e) => {
            let valid = true;
            const emailValue = emailInput.value.trim();

            if (!emailValue || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
                emailError.style.display = 'block';
                valid = false;
            } else {
                emailError.style.display = 'none';
            }

            if (!valid) {
                e.preventDefault();
            }
        });
    }

    // Gestion du panier
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    function updateCartDisplay() {
        const cartItems = document.getElementById('cartItems');
        const cartCount = document.getElementById('cartCount');
        cartCount.textContent = cart.length;
        cartItems.innerHTML = cart.length ? cart.map(item => `
            <li>
                ${item.type} - ${item.date}
                <button class="book-button" onclick="removeFromCart(${item.id})">Supprimer</button>
            </li>
        `).join('') : '<li>Panier vide</li>';
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    // Ajouter au panier
    window.addToCart = function(type, date) {
        if (!date) {
            alert('Veuillez sélectionner une date.');
            return;
        }
        const item = { id: Date.now(), type, date };
        cart.push(item);
        updateCartDisplay();
    };

    // Supprimer du panier
    window.removeFromCart = function(id) {
        cart = cart.filter(item => item.id !== id);
        updateCartDisplay();
    };

    // Vider le panier
    const clearCartBtn = document.getElementById('clearCart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            cart = [];
            updateCartDisplay();
        });
    }

    // Afficher/masquer le panier
    const cartToggle = document.getElementById('cartToggle');
    const cartContent = document.getElementById('cartContent');
    const closeCart = document.getElementById('closeCart');
    if (cartToggle && cartContent && closeCart) {
        cartToggle.addEventListener('click', () => {
            cartContent.classList.toggle('hidden');
        });
        closeCart.addEventListener('click', () => {
            cartContent.classList.add('hidden');
        });
    }

    // Initialiser Flatpickr pour les sélecteurs de date
    flatpickr('.date-picker', {
        dateFormat: 'Y-m-d',
        minDate: 'today'
    });

    // Mettre à jour l'affichage du panier au chargement
    updateCartDisplay();
});

// Fonction pour le menu burger
function myFunction() {
    const element = document.getElementById('menu');
    if (element.classList.contains('visible')) {
        element.classList.remove('visible');
    } else {
        element.classList.add('visible');
    }
}