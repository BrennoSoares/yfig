// Cloudfy Checkout JavaScript - Production Mode
console.log('☁️ Cloudfy Checkout carregado');

// Variáveis globais
let checkoutConfig = {};

// ========================================
// CARREGAR CONFIGURAÇÕES DO JSON
// ========================================

document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ Checkout.js inicializado');
    
    // Carregar configurações do produto do JSON
    await carregarConfiguracoesProduto();
});

// Função para carregar configurações do produto do JSON
async function carregarConfiguracoesProduto() {
    try {
        console.log('🔧 Carregando configurações do produto...');
        
        // Carregar diretamente do arquivo JSON
        const response = await fetch('./checkout-config.json?v=' + Date.now());
        
        if (!response.ok) {
            throw new Error('Archivo de configuración no encontrado');
        }
        
        const text = await response.text();
        console.log('📄 Arquivo JSON carregado');
        
        const data = JSON.parse(text);
        console.log('📦 Datos cargados do JSON:', data);
        
        // Armazenar configuração globalmente (tanto na variável local quanto no window)
        checkoutConfig = data;
        window.checkoutConfig = data;
        
        console.log('✅ window.checkoutConfig definido:', window.checkoutConfig);
        
        // Aplicar todas as configurações
        aplicarConfiguracoes(data);
        
        console.log('✅ Configuraciones aplicadas con éxito!');
        
    } catch (error) {
        console.error('❌ Error al cargar configuraciones:', error.message);
        console.log('📝 Usando valores por defecto del HTML');
    }
}

// ========================================
// APLICAR CONFIGURAÇÕES
// ========================================

function aplicarConfiguracoes(config) {
    console.log('🔄 Aplicando configurações do checkout...');
    
    // 1. Atualizar preços
    if (config.product_price) {
        atualizarPrecos(config.product_price);
    }
    
    // 2. Atualizar imagens
    if (config.product_image) {
        atualizarImagensProduto(config.product_image);
    }
    
    if (config.banner_photo) {
        atualizarBanner(config.banner_photo, config.show_banner_photo);
    }
    
    // 3. Atualizar textos
    if (config.product_name) {
        atualizarNomeProduto(config.product_name);
    }
    
    if (config.product_description) {
        atualizarDescricaoProduto(config.product_description);
    }
    
    // 4. Atualizar tema/cores
    if (config.colors) {
        aplicarCoresPersonalizadas(config.colors);
    }
    
    // 5. Atualizar topbar
    if (config.topbar) {
        atualizarTopbar(config.topbar);
    }
    
    // 6. Ajustar para produto digital
    if (config.is_digital === true) {
        ajustarParaProdutoDigital();
    }
    
    // 7. Atualizar visibilidade de campos
    atualizarVisibilidadeCampos(config);
    
    // 8. Atualizar orderbumps
    if (config.offers) {
        atualizarOrderbumps(config.offers);
    }
    
    // 9. Atualizar depoimentos
    if (config.depoimentos) {
        atualizarDepoimentos(config.depoimentos, config.depoimentos_enabled);
    }
    
    // 10. Atualizar opções de frete
    if (config.frete) {
        configurarFrete(config.frete);
    }
    
    console.log('✅ Todas las configuraciones aplicadas');
}

// ========================================
// FUNÇÕES DE ATUALIZAÇÃO
// ========================================

function atualizarPrecos(preco) {
    console.log('💰 Actualizando precios:', preco);
    
    // Converter formato europeo para número
    const priceString = preco.toString().replace(/\./g, '').replace(',', '.');
    const precoNumero = parseFloat(priceString);
    
    if (isNaN(precoNumero)) {
        console.warn('⚠️ Precio inválido:', preco);
        return;
    }
    
    const precoFormatado = `€ ${precoNumero.toFixed(2).replace('.', ',')}`;
    
    // Atualizar todos os elementos de subtotal
    const subtotalElements = document.querySelectorAll('[id="subTotal"]');
    subtotalElements.forEach(el => {
        el.textContent = precoFormatado;
    });
    
    // Atualizar todos os elementos de total
    const totalElements = document.querySelectorAll('[id="total"]');
    totalElements.forEach(el => {
        el.innerHTML = precoFormatado.replace(' ', '&nbsp;');
    });
    
    console.log('✅ Precios actualizados a:', precoFormatado);
}

function atualizarImagensProduto(imagemUrl) {
    console.log('🖼️ Actualizando imágenes del producto:', imagemUrl);
    
    // Buscar todas as imagens de produto no carrinho
    const productImages = document.querySelectorAll('li .border.rounded-xl.w-20.h-20.shrink-0.relative img');
    
    productImages.forEach(img => {
        img.src = imagemUrl;
        img.srcset = imagemUrl;
        img.alt = 'Imagen del producto';
    });
    
    console.log(`✅ ${productImages.length} imágenes de producto actualizadas`);
}

function atualizarBanner(bannerUrl, mostrar = true) {
    console.log('🏪 Actualizando banner:', bannerUrl, 'Mostrar:', mostrar);
    
    const bannerContainer = document.querySelector('.relative.h-\\[77px\\].lg\\:h-72');
    
    if (!bannerContainer) {
        console.warn('⚠️ Contenedor del banner no encontrado');
        return;
    }
    
    // Verificar se deve mostrar o banner
    const deveMostrar = mostrar !== false && bannerUrl;
    
    if (deveMostrar) {
        bannerContainer.style.display = '';
        
        const bannerImage = bannerContainer.querySelector('img[alt*="Banner"]');
        if (bannerImage) {
            bannerImage.src = bannerUrl;
            bannerImage.srcset = bannerUrl;
            bannerImage.style.display = '';
        }
        
        console.log('✅ Banner mostrado');
    } else {
        bannerContainer.style.display = 'none';
        console.log('🚫 Banner oculto');
    }
}

function atualizarNomeProduto(nome) {
    console.log('📝 Actualizando nombre del producto:', nome);
    
    // Atualizar título da página
    document.title = nome + ' - Checkout';
    
    // Atualizar todos os spans com nome do produto
    const nomeElements = document.querySelectorAll('span.font-medium.text-foreground');
    
    nomeElements.forEach(el => {
        const parentLi = el.closest('li');
        if (parentLi && parentLi.querySelector('img')) {
            el.textContent = nome;
        }
    });
    
    console.log('✅ Nombre del producto actualizado');
}

function atualizarDescricaoProduto(descricao) {
    console.log('📄 Actualizando descripción del producto:', descricao);
    
    const descElements = document.querySelectorAll('span.text-muted-foreground');
    
    descElements.forEach(el => {
        const parentLi = el.closest('li');
        if (parentLi && parentLi.querySelector('img')) {
            el.textContent = descricao;
        }
    });
    
    console.log('✅ Descripción del producto actualizada');
}

function aplicarCoresPersonalizadas(colors) {
    console.log('🎨 Aplicando colores personalizados:', colors);
    
    if (colors.principal) {
        document.documentElement.style.setProperty('--primary', colors.principal);
    }
    
    if (colors.background) {
        document.documentElement.style.setProperty('--background', colors.background);
    }
    
    if (colors.foreground) {
        document.documentElement.style.setProperty('--foreground', colors.foreground);
    }
    
    console.log('✅ Colores aplicados');
}

function atualizarTopbar(topbar) {
    console.log('📢 Actualizando barra superior:', topbar);
    
    const topbarElement = document.getElementById('cloudfy-topbar');
    
    if (!topbarElement) {
        console.warn('⚠️ Elemento de barra superior no encontrado');
        return;
    }
    
    const isVisible = topbar.visible === true;
    
    if (isVisible) {
        topbarElement.style.display = '';
        
        if (topbar.text) {
            topbarElement.innerHTML = topbar.text;
        }
        
        if (topbar.bg_color) {
            topbarElement.style.backgroundColor = topbar.bg_color;
        }
        
        console.log('✅ Barra superior visible y actualizada');
    } else {
        topbarElement.style.display = 'none';
        console.log('🚫 Barra superior oculta');
    }
}

function ajustarParaProdutoDigital() {
    console.log('📱 Ajustando para producto digital...');
    
    // Ocultar seção de endereço
    const addressSections = Array.from(document.querySelectorAll('.bg-card.rounded-xl.p-6.shadow-md')).filter(section => {
        const heading = section.querySelector('h2');
        return heading && heading.textContent.includes('Dirección');
    });
    
    addressSections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Ocultar header "Tu carrito"
    const cartHeaders = Array.from(document.querySelectorAll('header.flex.items-center.justify-between.mb-6')).filter(header => {
        return header.textContent.includes('Tu carrito');
    });
    
    cartHeaders.forEach(header => {
        header.style.display = 'none';
    });
    
    // Ocultar linhas de subtotal e frete
    const subtotalRows = Array.from(document.querySelectorAll('.flex.items-center.justify-between.text-sm.text-muted-foreground')).filter(el => {
        return el.textContent.includes('Subtotal') || el.textContent.includes('Envío:');
    });
    
    subtotalRows.forEach(row => {
        row.style.display = 'none';
    });
    
    // Ajustar linha do total
    const totalRows = Array.from(document.querySelectorAll('.flex.items-center.justify-between.mt-4.text-foreground.border-t.border-border.pt-4')).filter(el => {
        return el.textContent.includes('Total');
    });
    
    totalRows.forEach(row => {
        row.style.marginTop = '0';
        row.style.borderTop = 'none';
        row.style.paddingTop = '0';
    });
    
    // Ajustar gap do footer
    const footers = Array.from(document.querySelectorAll('footer.flex.flex-col.gap-y-2.mt-6'));
    footers.forEach(footer => {
        footer.style.gap = '0';
    });
    
    // Ocultar elementos com data-digital-hide (segurança e termos)
    const digitalHideElements = document.querySelectorAll('[data-digital-hide]');
    console.log(`🔒 Encontrados ${digitalHideElements.length} elementos com data-digital-hide`);
    
    digitalHideElements.forEach(element => {
        element.style.display = 'none';
        console.log('🚫 Elemento oculto:', element.getAttribute('data-digital-hide'));
    });
    
    console.log('✅ Ajustes para producto digital aplicados');
}

function atualizarVisibilidadeCampos(config) {
    console.log('📝 Actualizando visibilidad de los campos...');
    
    // Campo Email
    if (config.show_email_field !== undefined) {
        const emailFields = document.querySelectorAll('[data-field="email"]');
        emailFields.forEach(field => {
            field.style.display = config.show_email_field === false ? 'none' : '';
        });
    }
    
    // Campo Teléfono
    if (config.show_phone_field !== undefined) {
        const phoneFields = document.querySelectorAll('[data-field="phone"]');
        phoneFields.forEach(field => {
            field.style.display = config.show_phone_field === false ? 'none' : '';
        });
    }
    
    // Campo DNI
    if (config.show_cpf_field !== undefined) {
        const cpfFields = document.querySelectorAll('[data-field="cpf"]');
        cpfFields.forEach(field => {
            field.style.display = config.show_cpf_field === false ? 'none' : '';
        });
    }
    
    console.log('✅ Visibilidad de los campos actualizada');
}

function atualizarOrderbumps(offers) {
    console.log('🎁 Actualizando ofertas adicionales:', offers);
    
    const paymentContainer = document.getElementById('payment-container');
    if (!paymentContainer) return;
    
    const orderbumpsContainers = paymentContainer.querySelectorAll('ul.flex.flex-col.gap-y-2');
    if (orderbumpsContainers.length === 0) return;
    
    const orderbumpsContainer = orderbumpsContainers[0];
    const orderbumpsParentContainer = paymentContainer.querySelector('div.mt-6');
    
    const hasOffers = offers && offers.visible && offers.items && offers.items.length > 0;
    
    const paymentButton = document.getElementById('payment-button');
    const paymentButtonText = document.getElementById('payment-button-text');
    const paymentSecureText = document.getElementById('payment-secure-text');
    const paymentMethodSection = document.getElementById('payment-method-section');
    
    if (!hasOffers) {
        // Ocultar orderbumps
        orderbumpsContainer.style.display = 'none';
        if (orderbumpsParentContainer) {
            orderbumpsParentContainer.style.display = 'none';
        }
        
        // Ajustar estilos do container de pagamento
        if (paymentContainer) {
            paymentContainer.classList.remove('bg-card', 'rounded-xl', 'p-6', 'shadow-md');
            paymentContainer.classList.add('bg-transparent');
            paymentContainer.style.setProperty('margin-top', '0', 'important');
        }
        
        // Ocultar seção de método de pagamento
        if (paymentMethodSection) {
            paymentMethodSection.style.display = 'none';
        }
        
        // Ajustar botão
        if (paymentButton) {
            paymentButton.style.setProperty('margin-top', '21px', 'important');
        }
        
        if (paymentButtonText) {
            paymentButtonText.textContent = 'PAGAR AHORA';
        }
        
        if (paymentSecureText) {
            paymentSecureText.style.display = '';
        }
        
        console.log('🚫 Orderbumps ocultos');
        return;
    }
    
    // Mostrar ofertas adicionales
    orderbumpsContainer.style.display = '';
    if (orderbumpsParentContainer) {
        orderbumpsParentContainer.style.display = '';
    }
    
    // Restaurar estilos do container
    if (paymentContainer) {
        paymentContainer.classList.add('bg-card', 'rounded-xl', 'p-6', 'shadow-md');
        paymentContainer.classList.remove('bg-transparent');
        paymentContainer.style.removeProperty('margin-top');
    }
    
    if (paymentMethodSection) {
        paymentMethodSection.style.display = '';
    }
    
    if (paymentButton) {
        paymentButton.style.removeProperty('margin-top');
    }
    
    if (paymentButtonText) {
        paymentButtonText.textContent = 'Pagar';
    }
    
    if (paymentSecureText) {
        paymentSecureText.style.display = 'none';
    }
    
    // Limpar e criar orderbumps
    orderbumpsContainer.innerHTML = '';
    
    offers.items.forEach((offer, index) => {
        // Normalizar os nomes das propriedades (aceitar tanto 'name' quanto 'title')
        const title = offer.title || offer.name || 'Produto';
        const description = offer.description || '';
        const price = offer.price || '0,00';
        const oldPrice = offer.old_price || offer.oldPrice || '';
        const image = offer.image || '';
        
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="group rounded-2xl px-4 py-4 transition-all border-2 border-dashed duration-500 w-full mx-auto hover:shadow-sm lg:px-6 border-border hover:border-primary">
                <p class="text-lg text-foreground">
                    <span class="bg-primary text-primary-foreground px-2 py-1 rounded-lg font-medium">Oferta exclusiva</span> para ti!
                </p>
                <div class="flex items-center gap-x-3 mt-3">
                    <div class="w-20 h-20 rounded-xl border border-border shrink-0 relative overflow-hidden">
                        <img 
                            alt="Imagen del producto ${title}" 
                            loading="lazy" 
                            decoding="async" 
                            data-nimg="fill" 
                            class="rounded-xl object-contain" 
                            style="position:absolute;height:100%;width:100%;left:0;top:0;right:0;bottom:0;color:transparent" 
                            srcset="${image}" 
                            src="${image}"
                        >
                    </div>
                    <div class="flex flex-col flex-1">
                        <span class="text-foreground font-medium">${title}</span>
                        <span class="text-xs text-muted-foreground lg:text-sm">${description}</span>
                        ${oldPrice ? `<span class="line-through text-destructive text-xs">de € ${formatPrice(oldPrice)}</span>` : ''}
                        <div class="flex items-center gap-x-2 mt-1">
                            <span class="text-primary font-semibold text-sm lg:text-base">€ ${formatPrice(price)}</span>
                            <div class="flex justify-end flex-1">
                                <button 
                                    type="button" 
                                    class="w-20 lg:w-28 py-1 lg:py-2 text-sm rounded-lg font-medium border transition-all duration-300 hover:bg-transparent bg-primary text-primary-foreground border-primary hover:text-primary"
                                >
                                    Lo quiero!
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        orderbumpsContainer.appendChild(li);
    });
    
    console.log(`✅ ${offers.items.length} orderbumps criados`);
    
    // Reinicializar o orderbump handler após criar os orderbumps
    if (window.OrderbumpHandler && window.OrderbumpHandler.reinit) {
        console.log('🔄 Reinicializando orderbump handler...');
        window.OrderbumpHandler.reinit();
    }
}

function atualizarDepoimentos(depoimentos, enabled = true) {
    console.log('⭐ Actualizando testimonios:', depoimentos, 'Enabled:', enabled);
    
    const glideContainers = document.querySelectorAll('.glide');
    
    if (glideContainers.length === 0) {
        console.warn('⚠️ Containers de depoimentos não encontrados');
        return;
    }
    
    const hasTestimonials = enabled !== false && depoimentos && Array.isArray(depoimentos) && depoimentos.length > 0;
    
    if (!hasTestimonials) {
        glideContainers.forEach(container => {
            container.style.display = 'none';
        });
        console.log('🚫 Depoimentos ocultos');
        return;
    }
    
    glideContainers.forEach(container => {
        container.style.display = '';
    });
    
    glideContainers.forEach((glideContainer, containerIndex) => {
        const slidesContainer = glideContainer.querySelector('.glide__slides');
        
        if (!slidesContainer) return;
        
        slidesContainer.innerHTML = '';
        
        depoimentos.forEach((testimonial, index) => {
            const li = document.createElement('li');
            li.className = 'glide__slide';
            
            const starsHTML = Array(5).fill(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-yellow-400">
                    <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clip-rule="evenodd"></path>
                </svg>
            `).join('');
            
            li.innerHTML = `
                <div class="relative flex w-full flex-col p-4 bg-clip-border text-card-foreground shadow-sm bg-card border border-border rounded-3xl mb-1 transition-all duration-500 hover:shadow-md">
                    <div class="relative flex items-center gap-4 pt-0 pb-6 mx-0 overflow-hidden text-card-foreground bg-transparent shadow-none rounded-xl bg-clip-border">
                        <div class="h-[58px] w-[58px] rounded-full shrink-0">
                            <img 
                                alt="Avatar de ${testimonial.name || 'Cliente'}" 
                                loading="lazy" 
                                width="58" 
                                height="58" 
                                decoding="async" 
                                data-nimg="1" 
                                class="rounded-full h-[58px] w-[58px] object-cover" 
                                style="color:transparent" 
                                srcSet="${testimonial.image || ''} 1x, ${testimonial.image || ''} 2x" 
                                src="${testimonial.image || ''}"
                            />
                        </div>
                        <div class="flex w-full flex-col gap-0.5">
                            <div class="flex items-center justify-between">
                                <h5 class="block font-sans text-xl antialiased font-semibold leading-snug tracking-normal text-foreground">${testimonial.name || 'Cliente'}</h5>
                                <div class="flex items-center gap-0.5">
                                    ${starsHTML}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="p-0">
                        <p class="block font-sans text-base antialiased font-light leading-relaxed text-muted-foreground">"${testimonial.description || ''}"</p>
                    </div>
                </div>
            `;
            
            slidesContainer.appendChild(li);
        });
    });
    
    // Reinicializar carousel
    if (window.carouselInstances && Array.isArray(window.carouselInstances)) {
        window.carouselInstances.forEach(instance => {
            if (instance && typeof instance.destroy === 'function') {
                instance.destroy();
            }
        });
        window.carouselInstances = [];
    }
    
    if (typeof CarouselInstance !== 'undefined') {
        glideContainers.forEach((container, index) => {
            const instance = new CarouselInstance(container);
            window.carouselInstances = window.carouselInstances || [];
            window.carouselInstances.push(instance);
        });
    }
    
    console.log(`✅ ${depoimentos.length} depoimentos criados`);
}

function configurarFrete(frete) {
    console.log('🚚 Configurando envío:', frete);
    
    if (!frete.enabled || !frete.opcoes || frete.opcoes.length === 0) {
        console.log('⚠️ Frete desabilitado ou sem opções');
        
        if (window.ShippingOptions && typeof window.ShippingOptions.hide === 'function') {
            window.ShippingOptions.hide();
        }
        return;
    }
    
    // Converter formato do builder para formato do shipping-options.js
    const shippingOptions = frete.opcoes.map((opcao, index) => {
        let priceNumber = 0;
        if (opcao.price) {
            const priceStr = opcao.price.toString().replace(/[^\d,]/g, '');
            priceNumber = parseFloat(priceStr.replace(',', '.')) || 0;
        }
        
        return {
            id: `frete-${index + 1}`,
            name: opcao.name || `Opção ${index + 1}`,
            price: priceNumber,
            deliveryTime: opcao.description || 'Prazo a calcular',
            carrier: 'Transportadora',
            carrierLogo: 'https://d1frh8xn9wll8b.cloudfront.net/checkout-pages-assets/shippingIcons/correios.webp',
            selected: opcao.selected || false
        };
    });
    
    console.log('🚚 Opções convertidas:', shippingOptions);
    
    if (window.ShippingOptions && typeof window.ShippingOptions.updateConfig === 'function') {
        window.ShippingOptions.updateConfig(shippingOptions);
        console.log(`✅ ${shippingOptions.length} opções de frete configuradas`);
    } else {
        console.log('ℹ️ ShippingOptions API não disponível ainda, armazenando configuração');
        window._pendingShippingConfig = shippingOptions;
    }
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

function formatPrice(price) {
    if (!price) return '0,00';
    
    // Converter para string
    let priceStr = price.toString().trim();
    
    // Se já está no formato europeo completo (ex: "6.990,00" ou "1.234.567,89"), retornar
    if (priceStr.match(/^\d{1,3}(\.\d{3})*,\d{2}$/)) {
        return priceStr;
    }
    
    // Se já está no formato simples correto (ex: "69,90"), retornar
    if (priceStr.match(/^\d+,\d{2}$/)) {
        return priceStr;
    }
    
    // Se tem ponto como separador decimal (ex: "69.90"), converter para vírgula
    if (priceStr.match(/^\d+\.\d{2}$/)) {
        return priceStr.replace('.', ',');
    }
    
    // Se é apenas números sem separador (ex: "6990"), dividir por 100
    if (priceStr.match(/^\d+$/)) {
        const numPrice = parseInt(priceStr) / 100;
        return numPrice.toFixed(2).replace('.', ',');
    }
    
    // Caso padrão: tentar parsear como número
    const numPrice = parseFloat(priceStr.replace(/\./g, '').replace(',', '.')) || 0;
    return numPrice.toFixed(2).replace('.', ',');
}


// ==================== LISTENER PARA MUDANÇA DE FRETE ====================

// Escutar mudanças no frete e atualizar totais
document.addEventListener('shippingChanged', function(event) {
    console.log('🚚 Frete alterado:', event.detail);
    
    // Se o OrderbumpHandler existir, deixar ele atualizar os totais
    // (ele já considera frete + orderbumps + produto)
    if (window.OrderbumpHandler) {
        console.log('✅ Usando OrderbumpHandler para atualizar totais');
        // Forçar recálculo dos totais no orderbump handler
        const updateTotalsEvent = new CustomEvent('forceUpdateTotals');
        document.dispatchEvent(updateTotalsEvent);
        return;
    }
    
    // Fallback: atualizar manualmente se OrderbumpHandler não existir
    const shippingPrice = event.detail.price || 0;
    
    // Pegar subtotal atual
    const subtotalElement = document.getElementById('subTotal');
    let subtotal = 0;
    
    if (subtotalElement) {
        const subtotalText = subtotalElement.textContent.replace(/[^\d,]/g, '');
        subtotal = parseFloat(subtotalText.replace(',', '.')) || 0;
    }
    
    // Calcular novo total (subtotal + frete)
    const newTotal = subtotal + shippingPrice;
    
    // Atualizar elemento do total
    const totalElements = document.querySelectorAll('#total');
    totalElements.forEach(el => {
        el.innerHTML = '€&nbsp;' + newTotal.toFixed(2).replace('.', ',');
    });
    
    console.log('💰 Totales actualizados tras cambio de envío:', {
        subtotal: subtotal.toFixed(2),
        envío: shippingPrice.toFixed(2),
        total: newTotal.toFixed(2)
    });
});
