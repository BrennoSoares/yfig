// Sistema de opções de frete - Fácil de customizar
document.addEventListener('DOMContentLoaded', function() {
    
    // ==================== CONFIGURAÇÃO (FÁCIL DE CUSTOMIZAR) ====================
    const SHIPPING_CONFIG = {
        // Opções de frete disponíveis
        options: [
            {
                id: ' ',
                name: ' ',
                price: 0.00,
                deliveryTime: ' ',
                carrier: ' ',
                carrierLogo: '',
                selected: false
            },
            {
                id: 'sedex',
                name: 'Sedex',
                price: 0.00,
                deliveryTime: ' ',
                carrier: ' ',
                carrierLogo: ' ',
                selected: true 
            },
            {
                id: 'expresso',
                name: 'Envío Express',
                price: 0.00,
                deliveryTime: ' ',
                carrier: ' ',
                carrierLogo: ' ',
                selected: false
            }
        ],
        
        // Onde inserir as opções de frete (após qual elemento)
        insertAfter: 'input[name="complement"]',
        
        // Mostrar frete após CEP ser preenchido?
        showAfterCEP: true
    };
    
    // ==================== CÓDIGO (NÃO PRECISA MEXER) ====================
    
    const complementInput = document.querySelector(SHIPPING_CONFIG.insertAfter);
    const cepInput = document.querySelector('input[name="cep"]');
    let shippingContainer = null;
    let selectedShipping = SHIPPING_CONFIG.options.find(opt => opt.selected);
    
    if (!complementInput) {
        console.error('Campo de complemento não encontrado');
        return;
    }
    
    // Criar HTML das opções de frete
    function createShippingHTML() {
        const optionsHTML = SHIPPING_CONFIG.options.map(option => {
            const radioId = `shipping-${option.id}`;
            const priceFormatted = option.price === 0 ? 'Gratis' : `€ ${option.price.toFixed(2).replace('.', ',')}`;
            const isChecked = option.selected ? 'checked' : '';
            const borderClass = option.selected ? 'border-primary' : '';
            
            return `
                <li>
                    <button type="button" 
                            class="shipping-option flex items-center justify-between border border-border rounded-xl pl-2 pr-5 py-5 w-full text-left transition-all duration-400 hover:border-primary ${borderClass}" 
                            data-shipping-id="${option.id}"
                            data-shipping-price="${option.price}">
                        <div class="flex items-center gap-3 flex-1">
                            <div class="inline-flex items-center">
                                <label class="relative flex items-center p-3 rounded-full cursor-pointer" for="${radioId}">
                                    <input class="peer relative h-6 w-6 cursor-pointer appearance-none rounded-full border border-primary transition-all checked:border-primary checked:bg-primary hover:before:opacity-10 before:absolute before:top-2/4 before:left-2/4 before:block before:h-12 before:w-12 before:-translate-y-2/4 before:-translate-x-2/4 before:rounded-full before:bg-blue-gray-500 before:opacity-0 before:transition-opacity" 
                                           id="${radioId}" 
                                           type="radio" 
                                           value="${option.id}" 
                                           name="shipping"
                                           ${isChecked}>
                                    <span class="absolute text-primary-foreground transition-opacity opacity-0 pointer-events-none top-2/4 left-2/4 -translate-y-2/4 -translate-x-2/4 peer-checked:opacity-100">
                                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" stroke-width="1">
                                            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                                        </svg>
                                    </span>
                                </label>
                            </div>
                            <div class="flex flex-col flex-1 gap-1">
                                <div>
                                    <span class="text-foreground font-medium">${option.name}</span>
                                </div>
                                <div class="flex items-center gap-2 flex-wrap">
                                    <div>
                                        <span class="text-sm text-muted-foreground">${option.deliveryTime}</span>
                                    </div>
                                    <div style="display: none;">
                                        <img alt="${option.carrier}" 
                                             loading="lazy" 
                                             width="80" 
                                             height="20" 
                                             decoding="async" 
                                             src="${option.carrierLogo}" 
                                             style="color: transparent;">
                                    </div>
                                </div>
                            </div>
                        </div>
                        <span class="text-sm text-foreground font-semibold">${priceFormatted}</span>
                    </button>
                </li>
            `;
        }).join('');
        
        return `
            <div class="col-span-2 mt-4" id="shipping-options-container" style="display: none;">
                <span class="text-foreground font-medium">Elige el mejor envío para ti</span>
                <p class="text-destructive shipping-error"></p>
                <ul class="mt-2 flex flex-col gap-y-2">
                    ${optionsHTML}
                </ul>
            </div>
        `;
    }
    
    // Inserir HTML no DOM
    function insertShippingOptions() {
        const parentGrid = complementInput.closest('.mt-4.flex.flex-col.gap-4.sm\\:grid.sm\\:grid-cols-2.sm\\:gap-4');
        
        if (!parentGrid) {
            console.error('Grid pai não encontrado');
            return;
        }
        
        // Criar e inserir o container
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = createShippingHTML();
        shippingContainer = tempDiv.firstElementChild;
        
        parentGrid.appendChild(shippingContainer);
        
        console.log('✅ Opções de frete inseridas no DOM');
        
        // Adicionar event listeners
        setupEventListeners();
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        const shippingButtons = shippingContainer.querySelectorAll('.shipping-option');
        
        // Adicionar ícones de check aos radio buttons
        const radioInputs = shippingContainer.querySelectorAll('input[type="radio"]');
        radioInputs.forEach(radio => {
            // Verificar se já tem o span (para não duplicar)
            const existingSpan = radio.nextElementSibling;
            if (existingSpan && existingSpan.tagName === 'SPAN') {
                // Já existe, adicionar ícone se não tiver
                if (!existingSpan.querySelector('.radio-check-icon')) {
                    const checkIcon = document.createElement('span');
                    checkIcon.className = 'radio-check-icon';
                    checkIcon.innerHTML = '✓';
                    checkIcon.style.cssText = `
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        color: white;
                        font-size: 14px;
                        font-weight: bold;
                        line-height: 1;
                        opacity: ${radio.checked ? '1' : '0'};
                        transition: opacity 0.2s ease;
                        pointer-events: none;
                    `;
                    existingSpan.appendChild(checkIcon);
                }
            }
        });
        
        shippingButtons.forEach(button => {
            button.addEventListener('click', function() {
                const shippingId = this.getAttribute('data-shipping-id');
                const shippingPrice = parseFloat(this.getAttribute('data-shipping-price'));
                
                // Atualizar seleção visual
                shippingButtons.forEach(btn => btn.classList.remove('border-primary'));
                this.classList.add('border-primary');
                
                // Marcar o radio e atualizar ícones
                const radio = this.querySelector('input[type="radio"]');
                if (radio) {
                    // Desmarcar todos os outros
                    radioInputs.forEach(r => {
                        r.checked = false;
                        const span = r.nextElementSibling;
                        if (span) {
                            const icon = span.querySelector('.radio-check-icon');
                            if (icon) icon.style.opacity = '0';
                        }
                    });
                    
                    // Marcar este
                    radio.checked = true;
                    const span = radio.nextElementSibling;
                    if (span) {
                        const icon = span.querySelector('.radio-check-icon');
                        if (icon) icon.style.opacity = '1';
                    }
                }
                
                // Atualizar opção selecionada
                selectedShipping = SHIPPING_CONFIG.options.find(opt => opt.id === shippingId);
                
                console.log('📦 Frete selecionado:', selectedShipping);
                
                // Disparar evento customizado para outros scripts usarem
                document.dispatchEvent(new CustomEvent('shippingChanged', {
                    detail: {
                        id: shippingId,
                        price: shippingPrice,
                        option: selectedShipping
                    }
                }));
            });
        });
    }
    
    // Mostrar opções de frete
    function showShippingOptions() {
        if (shippingContainer) {
            shippingContainer.style.display = 'block';
            console.log('📦 Opções de frete exibidas');
        }
    }
    
    // Esconder opções de frete
    function hideShippingOptions() {
        if (shippingContainer) {
            shippingContainer.style.display = 'none';
            console.log('📦 Opções de frete escondidas');
        }
    }
    
    // Inserir opções de frete no DOM
    insertShippingOptions();
    
    // Verificar se há configuração pendente do postMessage
    if (window._pendingShippingConfig) {
        console.log('📦 Aplicando configuração de frete pendente');
        window.ShippingOptions.updateConfig(window._pendingShippingConfig);
        delete window._pendingShippingConfig;
    }
    
    // Se configurado para mostrar após CEP (España: 5 dígitos)
    if (SHIPPING_CONFIG.showAfterCEP && cepInput) {
        // Escutar quando o CEP for preenchido com sucesso
        document.addEventListener('cepFilled', function(e) {
            console.log('📍 CEP preenchido, mostrando opções de frete');
            showShippingOptions();
            
            // Disparar evento do frete pré-selecionado APENAS após CEP preenchido
            if (selectedShipping) {
                setTimeout(() => {
                    document.dispatchEvent(new CustomEvent('shippingChanged', {
                        detail: {
                            id: selectedShipping.id,
                            price: selectedShipping.price,
                            option: selectedShipping
                        }
                    }));
                }, 100);
            }
        });
        
        // Também verificar se já tem CEP válido (ES: 5 dígitos)
        cepInput.addEventListener('input', function() {
            const cep = this.value.replace(/\D/g, '');
            if (cep.length === 5) {
                setTimeout(() => {
                    showShippingOptions();
                    
                    // Disparar evento do frete pré-selecionado APENAS após CEP válido
                    if (selectedShipping) {
                        setTimeout(() => {
                            document.dispatchEvent(new CustomEvent('shippingChanged', {
                                detail: {
                                    id: selectedShipping.id,
                                    price: selectedShipping.price,
                                    option: selectedShipping
                                }
                            }));
                        }, 100);
                    }
                }, 500);
            }
        });
    } else {
        // Mostrar imediatamente se não depender do CEP
        showShippingOptions();
        
        // Disparar evento do frete pré-selecionado APENAS se não depender do CEP
        if (selectedShipping) {
            setTimeout(() => {
                document.dispatchEvent(new CustomEvent('shippingChanged', {
                    detail: {
                        id: selectedShipping.id,
                        price: selectedShipping.price,
                        option: selectedShipping
                    }
                }));
            }, 100);
        }
    }
    
    // API pública para outros scripts
    window.ShippingOptions = {
        getSelected: () => selectedShipping,
        show: showShippingOptions,
        hide: hideShippingOptions,
        getAll: () => SHIPPING_CONFIG.options,
        updateConfig: (newOptions) => {
            console.log('🔄 Atualizando configuração de frete com:', newOptions);
            
            // Atualizar opções
            SHIPPING_CONFIG.options = newOptions;
            
            // Encontrar a opção selecionada
            selectedShipping = newOptions.find(opt => opt.selected) || newOptions[0];
            
            // Recriar o HTML
            if (shippingContainer) {
                const parentGrid = shippingContainer.parentElement;
                shippingContainer.remove();
                
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = createShippingHTML();
                shippingContainer = tempDiv.firstElementChild;
                
                parentGrid.appendChild(shippingContainer);
                
                // Reconfigurar event listeners
                setupEventListeners();
                
                // Mostrar se já estava visível
                const cep = cepInput ? cepInput.value.replace(/\D/g, '') : '';
                if (!SHIPPING_CONFIG.showAfterCEP || cep.length === 5) {
                    showShippingOptions();
                }
                
                console.log('✅ Opções de frete atualizadas no DOM');
                
                // Disparar evento da opção selecionada APENAS se o CEP já foi preenchido
                // ou se showAfterCEP estiver desabilitado
                const cepAlreadyFilled = cepInput && cepInput.value.replace(/\D/g, '').length === 5;
                if (selectedShipping && (!SHIPPING_CONFIG.showAfterCEP || cepAlreadyFilled)) {
                    setTimeout(() => {
                        document.dispatchEvent(new CustomEvent('shippingChanged', {
                            detail: {
                                id: selectedShipping.id,
                                price: selectedShipping.price,
                                option: selectedShipping
                            }
                        }));
                    }, 100);
                }
            }
        }
    };
});
