document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailInput = document.getElementById('email');
            if (emailInput && emailInput.value) {
                localStorage.setItem('queueFlowUser', emailInput.value.trim());
            }
            window.location.href = 'dashboard.html';
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('queueFlowUser');
            window.location.href = 'login.html';
        });
    }

    const userGreeting = document.getElementById('userGreeting');
    if (userGreeting) {
        const savedUser = localStorage.getItem('queueFlowUser');
        if (savedUser) {
            const displayName = savedUser.split('@')[0];
            const formattedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
            userGreeting.textContent = `Welcome back, ${formattedName}!`;
        }
    }

    const placeholderButtons = document.querySelectorAll('.placeholder-btn');
    placeholderButtons.forEach((button) => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            alert('Feature will be implemented in a future practical.');
        });
    });

});
