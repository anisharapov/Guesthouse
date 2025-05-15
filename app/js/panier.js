document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    cart = cart.map(item => {
        if (item.type === 'reservation') {
            return {
                type: 'reservation',
                room: item.room,
                dates: item.dates,
                nights: item.nights,
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity, 10) || 1
            };
        } else if (item.type === 'subscription') {
            return {
                type: 'subscription',
                startDate: item.startDate,
                endDate: item.endDate,
                months: parseInt(item.months, 10) || 1,
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity, 10) || 1
            };
        } else {
            return {
                type: 'item',
                name: item.name,
                price: parseFloat(item.price) || 0,
                quantity: parseInt(item.quantity, 10) || 1
            };
        }
    });

    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    const updateCartCount = () => {
        const cartCountElements = document.querySelectorAll('#cart-count');
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
        });
    };

    const updateCartDisplay = () => {
        const cartItemsContainer = document.getElementById('cart-items');
        const totalPriceElement = document.getElementById('total-price');
        const checkoutButton = document.getElementById('checkout-btn');

        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
            totalPriceElement.textContent = '0';
            checkoutButton.disabled = true;
            updateCartCount();
            return;
        }

        const table = document.createElement('table');
        table.className = 'cart-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Item</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody></tbody>
        `;
        const tbody = table.querySelector('tbody');

        cart.forEach((item, index) => {
            const row = document.createElement('tr');
            if (item.type === 'reservation') {
                row.innerHTML = `
                    <td>
                        ${item.room}<br>
                        <small>Dates: ${item.dates}</small><br>
                        <small>Nights: ${item.nights}</small>
                    </td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td><button class="remove-btn" data-index="${index}" aria-label="Remove reservation from cart">Remove</button></td>
                `;
            } else if (item.type === 'subscription') {
                row.innerHTML = `
                    <td>
                        Gym Subscription<br>
                        <small>Period: ${item.startDate} to ${item.endDate}</small><br>
                        <small>Duration: ${item.months} month${item.months > 1 ? 's' : ''}</small>
                    </td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td><button class="remove-btn" data-index="${index}" aria-label="Remove gym subscription from cart">Remove</button></td>
                `;
            } else {
                row.innerHTML = `
                    <td>${item.name || 'Unknown Item'}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td><button class="remove-btn" data-index="${index}" aria-label="Remove ${item.name || 'item'} from cart">Remove</button></td>
                `;
            }
            tbody.appendChild(row);
        });

        cartItemsContainer.appendChild(table);

        const totalPrice = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
        totalPriceElement.textContent = totalPrice.toFixed(2);

        checkoutButton.disabled = cart.length === 0;

        document.querySelectorAll('.remove-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = parseInt(e.target.dataset.index);
                cart.splice(index, 1);
                saveCart();
                updateCartDisplay();
                updateCartCount();
            });
        });

        updateCartCount();
    };

    document.querySelectorAll('.add-to-card button').forEach(button => {
        button.addEventListener('click', () => {
            const name = button.dataset.name;
            const price = parseFloat(button.dataset.price) || 0;

            const existingItem = cart.find(item => item.type === 'item' && item.name === name);
            if (existingItem) {
                existingItem.quantity = (existingItem.quantity || 0) + 1;
            } else {
                cart.push({ type: 'item', name, price, quantity: 1 });
            }

            saveCart();
            updateCartCount();
            alert(`${name} added to cart!`);
        });
    });

    const checkoutButton = document.getElementById('checkout-btn');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', () => {
            if (!checkoutButton.disabled && cart.length > 0) {
                const totalPrice = cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
                localStorage.setItem('checkoutData', JSON.stringify({
                    items: cart,
                    totalPrice: totalPrice
                }));
                window.location.href = 'payment.html';
            }
        });
    }

    updateCartCount();
    updateCartDisplay();
});