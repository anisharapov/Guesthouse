document.getElementById('signup-form').addEventListener('submit', function (e) {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const confirmError = document.getElementById('confirm-password-error');

    if (password !== confirmPassword) {
        e.preventDefault();
        confirmError.textContent = 'Les mots de passe ne correspondent pas.';
        confirmError.style.display = 'block';
    } else {
        confirmError.textContent = '';
        confirmError.style.display = 'none';
    }
});