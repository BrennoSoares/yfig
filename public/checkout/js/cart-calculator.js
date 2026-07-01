// Calculadora do carrinho - Atualiza subtotal, frete e total
document.addEventListener('DOMContentLoaded', function() {
    
    // ==================== CONFIGURAÇÃO ====================
    const CART_CONFIG = {
        // Valor do subtotal (você pode pegar de uma API ou calcular dos produtos)
        subtotal: 0, // Será calculado automaticamente dos produtos
        
        // Seletores dos elementos
        selectors: {
            subTotal: '#subTotal',
            shipping: '.flex.items-center.justify-between.text-sm.text-muted-foreground span:last-child', // Onde mostra o frete
            total: '#total'
        }
    };
    
    // ==================== ELEMENTOS ====================
    const subTotalElements = document.querySelectorAll(CART_CONFIG.selectors.subTotal);
    const totalElements = document.querySelectorAll(CART_CONFIG.selectors.total);
    
    console.log('📊 Elementos encontrados:');
    console.log('- Subtotais:', subTotalElements.length);
    console.log('- Totais:', totalElements.length);
    
    // Encontrar o elemento de frete de forma mais precisa
    let shippingElement = null;
    let shippingValueNode = null;
    
    // Procurar pelo container que tem "Frete:" como primeiro span
    const allFlexContainers = document.querySelectorAll('.flex.items-center.justify-between.text-sm.text-muted-foreground');
    
    allFlexContainers.forEach(container => {
        const firstSpan = container.querySelector('span:first-child');
        if (firstSpan && firstSpan.textContent.trim().toLowerCase().includes('frete')) {
            shippingElement = container;
            
            // O valor do frete é o último nó de texto ou o segundo elemento
            const children = Array.from(container.childNodes);
            
            // Procurar pelo "-" ou criar um span para o valor
            children.forEach(child => {
                if (child.nodeType === Node.TEXT_NODE && child.textContent.trim() === '-') {
                    shippingValueNode = child;
                }
            });
            
            // Se não encontrou o "-", procurar por um span
            if (!shippingValueNode) {
                const spans = container.querySelectorAll('span');
                if (spans.length > 1) {
                    shippingValueNode = spans[1];
                } else {
                    // Criar um novo span para o valor
                    shippingValueNode = document.createElement('span');
                    shippingValueNode.className = 'text-muted-foreground';
                    container.appendChild(shippingValueNode);
                }
            }
        }
    });
    
    if (subTotalElements.length === 0 || totalElements.length === 0) {
        console.error('❌ Elementos de preço não encontrados');
        return;
    }
    
    if (!shippingElement) {
        console.error('❌ Elemento de frete não encontrado');
        console.log('Containers encontrados:', allFlexContainers);
        return;
    }
    
    console.log('✅ Calculadora do carrinho inicializada');
    console.log('Elemento de frete:', shippingElement);
    console.log('Nó de valor do frete:', shippingValueNode);
    
    // ==================== VARIÁVEIS ====================
    let currentSubtotal = 0;
    let currentShipping = 0;
    let cepFilled = false; // Flag para saber se o CEP foi preenchido
    
    // ==================== FUNÇÕES ====================
    
    // Formatar valor para moeda euros
    function formatCurrency(value) {
        return `€ ${value.toFixed(2).replace('.', ',')}`;
    }
    
    // Formatar valor para moeda euros com &nbsp;
    function formatCurrencyWithNbsp(value) {
        return `€\u00A0${value.toFixed(2).replace('.', ',')}`;
    }
    
    // Calcular subtotal dos produtos no carrinho
    function calculateSubtotal() {
        // Tentar pegar do primeiro elemento #subTotal
        const subTotalText = subTotalElements[0].textContent;
        console.log('📊 Texto do subtotal:', subTotalText);
        
        // Remover "€" e espaços, depois converter
        const cleanText = subTotalText.replace(/[€$\s]/g, '').replace(',', '.');
        const match = cleanText.match(/[\d.]+/);
        
        if (match) {
            const value = parseFloat(match[0]);
            console.log('📊 Subtotal calculado:', value);
            
            if (!isNaN(value) && value > 0) {
                return value;
            }
        }
        
        // Se não encontrou no elemento, tentar pegar de variáveis globais
        if (window.cartSubtotal && window.cartSubtotal > 0) {
            console.log('📊 Subtotal da variável global:', window.cartSubtotal);
            return window.cartSubtotal;
        }
        
        // Se ainda for 0, tentar calcular dos produtos na página
        const productPrices = document.querySelectorAll('[data-product-price]');
        if (productPrices.length > 0) {
            let total = 0;
            productPrices.forEach(el => {
                const price = parseFloat(el.getAttribute('data-product-price'));
                if (!isNaN(price)) total += price;
            });
            if (total > 0) {
                console.log('📊 Subtotal calculado dos produtos:', total);
                return total;
            }
        }
        
        console.log('⚠️ Subtotal não encontrado, usando 0');
        console.log('💡 Dica: Defina window.cartSubtotal = VALOR ou adicione data-product-price nos produtos');
        return 0;
    }
    
    // Atualizar valores na tela
    function updateCartValues() {
        // Se o OrderbumpHandler existir, deixar ele gerenciar os totais
        if (window.OrderbumpHandler) {
            console.log('✅ OrderbumpHandler detectado, pulando atualização do CartCalculator');
            return;
        }
        
        const total = currentSubtotal + currentShipping;
        
        console.log('🔄 Atualizando valores:', {
            subtotal: currentSubtotal,
            shipping: currentShipping,
            total: total,
            cepFilled: cepFilled
        });
        
        // Atualizar TODOS os subtotais (só se for maior que 0)
        if (currentSubtotal > 0) {
            subTotalElements.forEach(el => {
                el.textContent = formatCurrency(currentSubtotal);
            });
        }
        
        // Atualizar frete APENAS se o CEP foi preenchido
        if (cepFilled && shippingValueNode) {
            const shippingText = currentShipping === 0 ? 'Gratis' : formatCurrency(currentShipping);
            
            if (shippingValueNode.nodeType === Node.TEXT_NODE) {
                shippingValueNode.textContent = shippingText;
            } else {
                shippingValueNode.textContent = shippingText;
            }
            
            console.log('📦 Frete atualizado para:', shippingText);
        } else if (!cepFilled) {
            console.log('⏳ CEP não preenchido ainda, mantendo "-"');
        }
        
        // Atualizar TODOS os totais (SEMPRE, mesmo se subtotal for 0)
        totalElements.forEach((el, index) => {
            const formattedTotal = formatCurrencyWithNbsp(total);
            el.innerHTML = formattedTotal;
            console.log(`💰 Total ${index + 1} atualizado para:`, formattedTotal);
            console.log(`💰 Total ${index + 1} DOM após update:`, el.innerHTML);
        });
        
        console.log('✅ Valores atualizados com sucesso');
    }
    
    // Atualizar frete selecionado
    function updateShipping(shippingPrice) {
        currentShipping = shippingPrice;
        updateCartValues();
    }
    
    // ==================== INICIALIZAÇÃO ====================
    
    // Calcular subtotal inicial
    currentSubtotal = calculateSubtotal();
    
    // Se o subtotal for 0, tentar pegar de um atributo data ou variável global
    if (currentSubtotal === 0 && window.cartSubtotal) {
        currentSubtotal = window.cartSubtotal;
    }
    
    // Atualizar valores iniciais
    updateCartValues();
    
    // ==================== EVENT LISTENERS ====================
    
    // Escutar mudanças no frete
    document.addEventListener('shippingChanged', function(e) {
        console.log('📦 Frete alterado:', e.detail);
        updateShipping(e.detail.price);
    });
    
    // Escutar quando o CEP for preenchido e as opções de frete aparecerem
    document.addEventListener('cepFilled', function() {
        console.log('📍 CEP preenchido detectado');
        cepFilled = true; // Marcar que o CEP foi preenchido
        
        // Verificar se há um frete pré-selecionado
        if (window.ShippingOptions) {
            const selected = window.ShippingOptions.getSelected();
            if (selected) {
                console.log('📦 Frete pré-selecionado detectado:', selected);
                updateShipping(selected.price);
            }
        }
    });
    
    // ==================== API PÚBLICA ====================
    window.CartCalculator = {
        updateSubtotal: function(value) {
            currentSubtotal = value;
            updateCartValues();
        },
        updateShipping: updateShipping,
        getTotal: function() {
            return currentSubtotal + currentShipping;
        },
        getSubtotal: function() {
            return currentSubtotal;
        },
        getShipping: function() {
            return currentShipping;
        }
    };
    
    console.log('✅ API pública disponível: window.CartCalculator');
});
