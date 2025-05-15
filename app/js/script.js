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

       // Initialize cart
       let cart = [];

       // Get all "Add to Cart" buttons
       const addToCartButtons = document.querySelectorAll('.add-to-cart button');
       const cartItemsList = document.getElementById('cart-items');
       const cartTotalElement = document.getElementById('cart-total');
       const cartCountElement = document.getElementById('cart-count');

       // Add event listener to each button
       addToCartButtons.forEach(button => {
           button.addEventListener('click', () => {
               // Get item details from data attributes
               const name = button.getAttribute('data-name');
               const price = parseFloat(button.getAttribute('data-price'));

               // Add item to cart
               cart.push({ name, price });

               // Update cart display
               updateCart();
           });
       });

       // Function to update cart display
       function updateCart() {
           // Clear current cart display
           cartItemsList.innerHTML = '';

           // Add each item to the cart display
           cart.forEach(item => {
               const li = document.createElement('li');
               li.textContent = `${item.name} - $${item.price}`;
               cartItemsList.appendChild(li);
           });

           // Calculate and display total
           const total = cart.reduce((sum, item) => sum + item.price, 0);
           cartTotalElement.textContent = total.toFixed(2);

           // Update cart count in header
           cartCountElement.textContent = cart.length;
       }    // Initialiser Flatpickr pour les sélecteurs de date
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

