document.addEventListener('DOMContentLoaded', () => {
    const carrousselContainer = document.querySelector('.carroussel-container');
    const items = document.querySelectorAll('.carroussel-item');
    let currentIndex = 0;

    function showNextItem() {
        currentIndex = (currentIndex + 1) % items.length;
        carrousselContainer.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    // Change slide every 5 seconds
    setInterval(showNextItem, 5000);
});

const form = document.getElementById('resetForm');
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
//find the element with block and verify//

function myFunction() {
    const element = document.getElementById("menu");
    if (element.classList.contains('visible')) {
        element.classList.remove("visible")
    } else {
        element.classList.add("visible");
    }
}
