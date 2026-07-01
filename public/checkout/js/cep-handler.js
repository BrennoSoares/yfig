// Simplificación para códigos postales en España
document.addEventListener('DOMContentLoaded', function() {
    const cepInput = document.querySelector('input[name="cep"]');
    if (cepInput) {
        cepInput.placeholder = "Código Postal (ej: 28001)";
        cepInput.maxLength = 5;
        
        // Impedir caracteres não numéricos
        cepInput.addEventListener('input', function(e) {
            this.value = this.value.replace(/\D/g, '');
        });
    }
});