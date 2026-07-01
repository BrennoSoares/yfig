// Validador completo del formulario adaptado para España
document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const emailInput = document.querySelector('input[name="email"]');
    const fullNameInput = document.querySelector('input[name="fullName"]');
    const phoneInput = document.querySelector('input[name="phone"]');
    const documentInput = document.querySelector('input[name="document"]');
    const cepInput = document.querySelector('input[name="cep"]');
    const numberInput = document.querySelector('input[name="number"]');
    const streetInput = document.querySelector('input[name="street"]');
    const cityInput = document.querySelector('input[name="city"]');
    const noNumberCheckbox = document.getElementById('noNumber');

    function showError(input, message) {
        removeError(input);
        const errorSpan = document.createElement('span');
        errorSpan.className = 'text-destructive error-message';
        errorSpan.style.cssText = 'display: block; margin-top: 0.25rem; font-size: 0.875rem;';
        errorSpan.textContent = message;
        const parent = input.closest('.flex.flex-col') || input.parentElement;
        parent.appendChild(errorSpan);
        input.style.borderColor = 'var(--destructive)';
    }

    function removeError(input) {
        const parent = input.closest('.flex.flex-col') || input.parentElement;
        const errorSpan = parent.querySelector('.error-message');
        if (errorSpan) errorSpan.remove();
        input.style.borderColor = '';
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function validateFullName(name) {
        const words = name.trim().split(/\s+/).filter(w => w.length > 0);
        return words.length >= 2;
    }

    function validatePhone(phone) {
        const cleaned = phone.replace(/\D/g, '');
        return cleaned.length >= 9;
    }

    function validateDNI(dni) {
        const regex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i;
        return regex.test(dni.trim());
    }

    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value.trim() && !validateEmail(this.value)) showError(this, 'Correo electrónico inválido');
            else removeError(this);
        });
    }

    if (fullNameInput) {
        fullNameInput.addEventListener('blur', function() {
            if (this.value.trim() && !validateFullName(this.value)) showError(this, 'Introduce nombre y apellidos');
            else removeError(this);
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', function() {
            this.value = this.value.replace(/\D/g, '').substring(0, 12);
            removeError(this);
        });
    }

    if (documentInput) {
        documentInput.addEventListener('blur', function() {
            // Validación simple o skip si es flexible
            if (this.value.trim().length < 5) showError(this, 'DNI/NIE inválido');
            else removeError(this);
        });
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            let isValid = true;
            if (fullNameInput && !validateFullName(fullNameInput.value)) {
                showError(fullNameInput, 'Introduce nombre y apellidos');
                isValid = false;
            }
            if (emailInput && !validateEmail(emailInput.value)) {
                showError(emailInput, 'Correo electrónico inválido');
                isValid = false;
            }
            if (!isValid) e.preventDefault();
        });
    }
});