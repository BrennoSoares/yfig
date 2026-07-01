// Gerenciador de Orderbumps
console.log('🎁 [ORDERBUMP] Script carregado!');

(function() {
    console.log('🎁 [ORDERBUMP] Função IIFE executada');
    
    // Variáveis globais
    let selectedOrderbumps = new Map(); // Map<offerId, offerData>
    let baseSubtotal = 0;
    
    // ==================== INICIALIZAÇÃO ====================
    
    function initOrderbumps() {
        console.log('🎁 Orderbump Handler inicializado');
        
        // Sempre calcular o baseSubtotal a partir do elemento #subTotal
        const subtotalElement = document.getElementById('subTotal');
        if (subtotalElement) {
            const subtotalText = subtotalElement.textContent.replace(/[^\d,]/g, '');
            const currentSubtotal = parseFloat(subtotalText.replace(',', '.')) || 0;
            
            // Se não há orderbumps selecionados, este é o baseSubtotal
            if (selectedOrderbumps.size === 0) {
                baseSubtotal = currentSubtotal;
                console.log('💰 Subtotal base (sem orderbumps):', baseSubtotal);
            } else {
                // Se há orderbumps, calcular o baseSubtotal subtraindo o total dos orderbumps
                let orderbumpsTotal = 0;
                selectedOrderbumps.forEach(offer => {
                    orderbumpsTotal += offer.price;
                });
                baseSubtotal = currentSubtotal - orderbumpsTotal;
                console.log('💰 Subtotal base recalculado (com orderbumps):', {
                    currentSubtotal,
                    orderbumpsTotal,
                    baseSubtotal
                });
            }
        } else {
            console.warn('⚠️ Elemento #subTotal não encontrado');
        }
        
        // Adicionar event listeners aos botões de orderbump
        setupOrderbumpButtons();
    }
    
    // ==================== CONFIGURAR BOTÕES ====================
    
    function setupOrderbumpButtons() {
        const paymentContainer = document.getElementById('payment-container');
        console.log('🔍 Payment container encontrado:', !!paymentContainer);
        
        const orderbumpButtons = document.querySelectorAll('#payment-container button[type="button"]');
        
        console.log(`🔍 Encontrados ${orderbumpButtons.length} botões de orderbump`);
        
        orderbumpButtons.forEach((button, index) => {
            console.log(`🔍 Botão ${index + 1}:`, button.textContent.trim());
            
            // Verificar se é um botão de orderbump (não é o botão de pagamento)
            if (button.textContent.includes('Lo quiero!') || button.textContent.includes('Remover')) {
                const orderbumpCard = button.closest('.group.rounded-2xl');
                
                if (orderbumpCard) {
                    // Usar data-offer-index se disponível, senão usar o índice do botão
                    const offerIndex = button.dataset.offerIndex || index;
                    const offerId = `orderbump-${offerIndex}`;
                    
                    const title = orderbumpCard.querySelector('.text-foreground.font-medium')?.textContent || 'Produto';
                    const description = orderbumpCard.querySelector('.text-xs.text-muted-foreground')?.textContent || '';
                    const priceText = orderbumpCard.querySelector('.text-primary.font-semibold')?.textContent || '€ 0,00';
                    const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
                    const image = orderbumpCard.querySelector('img')?.src || '';
                    
                    console.log(`🔍 Botão ${index + 1} - offerId: ${offerId}, offerIndex: ${offerIndex}`);
                    
                    // Armazenar dados no botão
                    button.dataset.offerId = offerId;
                    button.dataset.offerTitle = title;
                    button.dataset.offerDescription = description;
                    button.dataset.offerPrice = price;
                    button.dataset.offerImage = image;
                    
                    // Verificar se este orderbump já estava selecionado
                    const wasSelected = selectedOrderbumps.has(offerId);
                    
                    if (wasSelected) {
                        // Restaurar estado do botão para "Remover"
                        button.textContent = 'Remover';
                        button.className = 'w-20 lg:w-28 py-1 lg:py-2 text-sm rounded-lg font-medium border transition-all duration-300 hover:bg-transparent bg-destructive text-destructive-foreground border-destructive hover:text-destructive';
                        console.log(`🔄 Orderbump ${index + 1} já estava selecionado, restaurando estado`);
                        console.log(`🔄 offerId: ${offerId}`);
                        
                        // Verificar se o item já está no carrinho
                        const item0 = document.getElementById(`cart-${offerId}-0`);
                        const item1 = document.getElementById(`cart-${offerId}-1`);
                        console.log(`🔍 Item no carrinho? cart-${offerId}-0:`, !!item0, 'cart-${offerId}-1:', !!item1);
                        
                        const itemExists = item0 || item1;
                        if (!itemExists) {
                            console.log(`📦 Adicionando orderbump ${index + 1} de volta ao carrinho`);
                            // Usar os dados salvos no Map ao invés dos dados do botão
                            const savedData = selectedOrderbumps.get(offerId);
                            console.log(`📦 Dados salvos no Map:`, savedData);
                            console.log(`📦 Dados do botão atual:`, { title, description, price, image: image.substring(0, 50) });
                            
                            if (savedData) {
                                console.log(`✅ Usando dados salvos:`, savedData);
                                addOrderbumpToCart(offerId, savedData.title, savedData.description, savedData.price, savedData.image);
                            } else {
                                console.warn(`⚠️ Dados salvos não encontrados para ${offerId}, usando dados do botão`);
                                addOrderbumpToCart(offerId, title, description, price, image);
                            }
                        } else {
                            console.log(`✅ Item já existe no carrinho, não adicionando novamente`);
                        }
                    }
                    
                    // Adicionar event listener
                    button.addEventListener('click', function(e) {
                        console.log('🎯 [ORDERBUMP] Event listener disparado!');
                        e.preventDefault();
                        e.stopPropagation();
                        handleOrderbumpClick(this);
                    });
                    
                    console.log(`✅ Botão ${index + 1} configurado:`, { offerId, title, price, wasSelected });
                }
            }
        });
    }
    
    // ==================== MANIPULAR CLIQUE ====================
    
    function handleOrderbumpClick(button) {
        console.log('🎯 [ORDERBUMP] Clique detectado!', button);
        
        const offerId = button.dataset.offerId;
        const isAdded = selectedOrderbumps.has(offerId);
        
        console.log('🎯 [ORDERBUMP] offerId:', offerId, 'isAdded:', isAdded);
        
        if (isAdded) {
            // Remover orderbump
            removeOrderbump(offerId, button);
        } else {
            // Adicionar orderbump
            addOrderbump(button);
        }
    }
    
    // ==================== ADICIONAR ORDERBUMP ====================
    
    function addOrderbump(button) {
        const offerId = button.dataset.offerId;
        const title = button.dataset.offerTitle;
        const description = button.dataset.offerDescription;
        const price = parseFloat(button.dataset.offerPrice);
        const image = button.dataset.offerImage;
        
        console.log('➕ Adicionando orderbump:', { offerId, title, price });
        
        // Armazenar orderbump selecionado
        selectedOrderbumps.set(offerId, { title, description, price, image });
        
        // Alterar botão para "Remover"
        button.textContent = 'Remover';
        button.className = 'w-20 lg:w-28 py-1 lg:py-2 text-sm rounded-lg font-medium border transition-all duration-300 hover:bg-transparent bg-destructive text-destructive-foreground border-destructive hover:text-destructive';
        
        // Adicionar item ao resumo do carrinho
        addOrderbumpToCart(offerId, title, description, price, image);
        
        // Atualizar totais
        updateTotals();
        
        console.log('✅ Orderbump adicionado com sucesso');
    }
    
    // ==================== REMOVER ORDERBUMP ====================
    
    function removeOrderbump(offerId, button) {
        console.log('➖ Removendo orderbump:', offerId);
        
        // Remover do Map
        selectedOrderbumps.delete(offerId);
        
        // Restaurar botão para "Lo quiero!"
        button.textContent = 'Lo quiero!';
        button.className = 'w-20 lg:w-28 py-1 lg:py-2 text-sm rounded-lg font-medium border transition-all duration-300 hover:bg-transparent bg-primary text-primary-foreground border-primary hover:text-primary';
        
        // Remover item do resumo do carrinho
        removeOrderbumpFromCart(offerId);
        
        // Atualizar totais
        updateTotals();
        
        console.log('✅ Orderbump removido com sucesso');
    }
    
    // ==================== ADICIONAR AO CARRINHO ====================
    
    function addOrderbumpToCart(offerId, title, description, price, image) {
        // Buscar TODAS as listas de produtos (há 2: uma para mobile, outra para desktop)
        let productLists = document.querySelectorAll('#items');
        
        if (productLists.length === 0) {
            console.error('❌ Nenhuma lista de produtos encontrada');
            return;
        }
        
        console.log(`✅ ${productLists.length} listas de produtos encontradas`);
        
        // Adicionar em todas as listas
        productLists.forEach((productList, index) => {
            console.log(`📍 Adicionando na lista ${index + 1}...`);
            console.log('📍 Número de filhos antes:', productList.children.length);
            
            // Adicionar separator antes do orderbump
            const separator = document.createElement('div');
            separator.id = `separator-${offerId}-${index}`;
            separator.className = 'h-px bg-border';
            
            // Criar elemento do orderbump
            const orderbumpItem = document.createElement('li');
            orderbumpItem.id = `cart-${offerId}-${index}`;
            orderbumpItem.className = 'flex items-center justify-between border-b border-border pb-4';
            orderbumpItem.innerHTML = `
                <div class="flex items-center gap-x-3 flex-1">
                    <div class="border border-border rounded-xl w-20 h-20 shrink-0 relative overflow-hidden">
                        <img 
                            alt="Imagem do produto ${title}" 
                            loading="lazy" 
                            decoding="async" 
                            data-nimg="fill" 
                            class="rounded-xl object-contain" 
                            style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" 
                            srcset="${image}" 
                            src="${image}"
                        >
                    </div>
                    <div class="flex flex-col">
                        <span class="font-medium text-foreground">${title}</span>
                        <span class="text-muted-foreground">${description}</span>
                    </div>
                </div>
            `;
            
            productList.appendChild(separator);
            productList.appendChild(orderbumpItem);
            
            console.log(`✅ Orderbump adicionado na lista ${index + 1}`);
            console.log('📍 Número de filhos depois:', productList.children.length);
        });
        
        console.log('✅ Orderbump adicionado em todos os carrinhos');
    }
    
    // ==================== REMOVER DO CARRINHO ====================
    
    function removeOrderbumpFromCart(offerId) {
        // Remover de todas as listas (mobile e desktop)
        let removed = 0;
        
        // Tentar remover com índice 0 e 1
        for (let i = 0; i < 2; i++) {
            const cartItem = document.getElementById(`cart-${offerId}-${i}`);
            const separator = document.getElementById(`separator-${offerId}-${i}`);
            
            if (cartItem) {
                cartItem.remove();
                removed++;
            }
            
            if (separator) {
                separator.remove();
            }
        }
        
        console.log(`✅ Orderbump removido de ${removed} carrinho(s)`);
    }
    
    // ==================== ATUALIZAR TOTAIS ====================
    
    function updateTotals() {
            // Calcular total dos orderbumps
            let orderbumpsTotal = 0;
            selectedOrderbumps.forEach(offer => {
                orderbumpsTotal += offer.price;
            });

            // Calcular novo subtotal
            const newSubtotal = baseSubtotal + orderbumpsTotal;

            console.log('💰 Atualizando totais:', {
                baseSubtotal,
                orderbumpsTotal,
                newSubtotal
            });

            // Atualizar subtotal
            const subtotalElements = document.querySelectorAll('#subTotal');
            subtotalElements.forEach(el => {
                el.textContent = '€ ' + newSubtotal.toFixed(2).replace('.', ',');
            });

            // Verificar se é produto digital ANTES de calcular o total
            const isDigitalProduct = window.checkoutConfig && window.checkoutConfig.is_digital === true;

            console.log('🔍 Verificando tipo de produto:', {
                isDigital: isDigitalProduct,
                checkoutConfig: window.checkoutConfig
            });

            // Calcular total (subtotal + frete se houver)
            let total = newSubtotal;
            let shippingPrice = 0;

            // APENAS adicionar frete se NÃO for produto digital
            if (!isDigitalProduct) {
                // Tentar pegar frete via API
                if (window.ShippingOptions && typeof window.ShippingOptions.getSelected === 'function') {
                    const selectedShipping = window.ShippingOptions.getSelected();
                    if (selectedShipping && selectedShipping.price) {
                        shippingPrice = selectedShipping.price;
                        total += shippingPrice;
                        console.log('🚚 Frete adicionado (via API):', shippingPrice);
                    }
                } else {
                    // Fallback: buscar frete selecionado no DOM
                    const shippingRadio = document.querySelector('input[name="shipping"]:checked');
                    if (shippingRadio) {
                        // Buscar preço do frete
                        const shippingContainer = shippingRadio.closest('.shipping-option');
                        if (shippingContainer) {
                            const priceSpan = shippingContainer.querySelector('.text-sm.text-foreground.font-semibold');
                            if (priceSpan) {
                                const shippingText = priceSpan.textContent;
                                if (shippingText !== 'Gratis') {
                                    shippingPrice = parseFloat(shippingText.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
                                    total += shippingPrice;
                                    console.log('🚚 Frete adicionado (via DOM):', shippingPrice);
                                }
                            }
                        }
                    }
                }
            } else {
                console.log('📱 Produto digital detectado - frete NÃO será somado ao total');
                // Para produto digital, forçar shippingPrice = 0
                shippingPrice = 0;
            }

            // Atualizar linha do frete no resumo
            updateShippingDisplay(shippingPrice);

            // Atualizar total
            const totalElements = document.querySelectorAll('#total');
            totalElements.forEach(el => {
                el.innerHTML = '€&nbsp;' + total.toFixed(2).replace('.', ',');
            });

            console.log('✅ Totais atualizados:', {
                subtotal: newSubtotal,
                frete: shippingPrice,
                total: total,
                isDigital: isDigitalProduct
            });

            // Disparar evento customizado para outros scripts
            document.dispatchEvent(new CustomEvent('orderbumpsChanged', {
                detail: {
                    orderbumps: Array.from(selectedOrderbumps.values()),
                    subtotal: newSubtotal,
                    total: total
                }
            }));
        }

    
    // ==================== ATUALIZAR DISPLAY DO FRETE ====================
    
    function updateShippingDisplay(shippingPrice) {
        // Verificar se é produto digital
        const isDigitalProduct = window.checkoutConfig && window.checkoutConfig.is_digital === true;
        
        // Procurar pelo container que tem "Frete:" como primeiro span
        const allFlexContainers = document.querySelectorAll('.flex.items-center.justify-between.text-sm.text-muted-foreground');
        
        allFlexContainers.forEach(container => {
            const firstSpan = container.querySelector('span:first-child');
            if (firstSpan && firstSpan.textContent.trim().toLowerCase().includes('frete')) {
                // Encontrou o container do frete
                
                // Procurar se já existe um span para o valor
                let valueSpan = container.querySelector('span:last-child');
                
                // Se o último span é o mesmo que o primeiro, criar um novo
                if (valueSpan === firstSpan) {
                    valueSpan = document.createElement('span');
                    valueSpan.className = 'text-muted-foreground';
                    container.appendChild(valueSpan);
                }
                
                // Atualizar o valor
                // Para produto digital, sempre mostrar "-" ou "Grátis"
                if (isDigitalProduct) {
                    valueSpan.textContent = '-';
                    console.log('📦 Display do frete (produto digital): -');
                } else if (shippingPrice === 0) {
                    valueSpan.textContent = 'Grátis';
                    console.log('📦 Display do frete atualizado: Grátis');
                } else if (shippingPrice > 0) {
                    valueSpan.textContent = 'R$ ' + shippingPrice.toFixed(2).replace('.', ',');
                    console.log('📦 Display do frete atualizado:', valueSpan.textContent);
                } else {
                    valueSpan.textContent = '-';
                    console.log('📦 Display do frete atualizado: -');
                }
            }
        });
    }
    
    // ==================== API PÚBLICA ====================
    
    window.OrderbumpHandler = {
        getSelected: () => Array.from(selectedOrderbumps.values()),
        getTotal: () => {
            let total = 0;
            selectedOrderbumps.forEach(offer => {
                total += offer.price;
            });
            return total;
        },
        updateBaseSubtotal: (newBase) => {
            baseSubtotal = newBase;
            updateTotals();
        },
        reinit: () => {
            console.log('🔄 [ORDERBUMP] Reinicializando...');
            console.log('🔄 [ORDERBUMP] Orderbumps selecionados antes do reinit:', Array.from(selectedOrderbumps.entries()));
            
            // Remover todos os itens de orderbump do carrinho antes de reinicializar
            selectedOrderbumps.forEach((data, offerId) => {
                console.log(`🗑️ Removendo itens antigos do carrinho para ${offerId}`);
                for (let i = 0; i < 2; i++) {
                    const cartItem = document.getElementById(`cart-${offerId}-${i}`);
                    const separator = document.getElementById(`separator-${offerId}-${i}`);
                    if (cartItem) cartItem.remove();
                    if (separator) separator.remove();
                }
            });
            
            initOrderbumps();
            
            // Atualizar totais após reinicializar (para recalcular com orderbumps)
            if (selectedOrderbumps.size > 0) {
                console.log('💰 Atualizando totais após reinit...');
                setTimeout(() => {
                    updateTotals();
                }, 100);
            }
        }
    };
    
    // ==================== INICIALIZAR ====================
    
    // Executar quando o DOM estiver pronto
    function start() {
        console.log('🎁 [ORDERBUMP] Iniciando...');
        
        // Tentar múltiplas vezes caso os elementos ainda não existam
        let attempts = 0;
        const maxAttempts = 10;
        
        function tryInit() {
            attempts++;
            console.log(`🎁 [ORDERBUMP] Tentativa ${attempts}/${maxAttempts}`);
            
            const paymentContainer = document.getElementById('payment-container');
            const buttons = document.querySelectorAll('#payment-container button[type="button"]');
            
            if (paymentContainer && buttons.length > 0) {
                console.log('🎁 [ORDERBUMP] Elementos encontrados! Inicializando...');
                initOrderbumps();
            } else if (attempts < maxAttempts) {
                console.log('🎁 [ORDERBUMP] Elementos não encontrados, tentando novamente em 500ms...');
                setTimeout(tryInit, 500);
            } else {
                console.error('❌ [ORDERBUMP] Não foi possível encontrar os elementos após', maxAttempts, 'tentativas');
            }
        }
        
        tryInit();
    }
    
    // Se o DOM já estiver carregado, executar imediatamente
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start);
    } else {
        start();
    }
    
    // Escutar mudanças no frete para recalcular totais
    document.addEventListener('shippingChanged', function(event) {
        console.log('🚚 [ORDERBUMP] Frete alterado, recalculando totais');
        updateTotals();
    });
    
    // Escutar evento de forçar atualização de totais
    document.addEventListener('forceUpdateTotals', function() {
        console.log('🔄 [ORDERBUMP] Forçando atualização de totais');
        updateTotals();
    });
    
    console.log('✅ Orderbump Handler pronto');
})();
