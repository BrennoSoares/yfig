document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const paymentButton = document.getElementById('payment-button');
    const paymentButtonText = document.getElementById('payment-button-text');
    
    if (!form || !paymentButton) {
        console.error('❌ Formulario o botón de pago no encontrado');
        return;
    }
    
    console.log('✅ Payment handler inicializado');
    
    // Función para obtener parámetros UTM da URL
    function getUTMParams() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            utm_source: urlParams.get('utm_source') || null,
            utm_medium: urlParams.get('utm_medium') || null,
            utm_campaign: urlParams.get('utm_campaign') || null,
            utm_content: urlParams.get('utm_content') || null,
            utm_term: urlParams.get('utm_term') || null,
            xcod: urlParams.get('xcod') || null,
            sck: urlParams.get('sck') || null,
            src: urlParams.get('src') || null,
            utm_id: urlParams.get('utm_id') || null
        };
    }
    
    // Función para deshabilitar el botón durante el procesamiento
    function setButtonLoading(loading) {
        if (loading) {
            paymentButton.disabled = true;
            paymentButtonText.textContent = 'Pagando...';
            paymentButton.style.cursor = 'wait';
            paymentButton.style.opacity = '0.7';
            
            // Adicionar ícone de loading à direita
            const loadingIcon = document.createElement('svg');
            loadingIcon.setAttribute('class', 'animate-spin h-5 w-5 ml-2');
            loadingIcon.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
            loadingIcon.setAttribute('fill', 'none');
            loadingIcon.setAttribute('viewBox', '0 0 24 24');
            loadingIcon.setAttribute('id', 'loading-icon');
            loadingIcon.innerHTML = '<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>';
            
            paymentButton.appendChild(loadingIcon);
            
            console.log('⏳ Botón en estado de carga');
        } else {
            paymentButton.disabled = false;
            paymentButtonText.textContent = 'Pagar';
            paymentButton.style.cursor = 'pointer';
            paymentButton.style.opacity = '1';
            
            // Remover ícone de loading
            const loadingIcon = document.getElementById('loading-icon');
            if (loadingIcon) {
                loadingIcon.remove();
            }
            
            console.log('✅ Botón restaurado');
        }
    }
    
    // Función para mostrar error
    function showError(message) {
        alert('Error: ' + message);
        console.error('❌ Error en el pago:', message);
    }
    
    // Función para formatear valor en euros
    function formatCurrency(value) {
        return `€\u00A0${value.toFixed(2).replace('.', ',')}`;
    }
    
    // Función para mostrar pantalla de pago con Bizum
    function showBizumPayment(paymentData) {
        console.log('🎨 Renderizando pantalla de pago con Bizum:', paymentData);
        
        // Encontrar el formulario
        const formElement = document.querySelector('form.w-full.flex.flex-col.lg\\:pb-3');
        
        if (!formElement) {
            console.error('❌ Formulario no encontrado');
            return;
        }
        
        // Ocultar el formulario
        formElement.style.display = 'none';
        
        // Criar o HTML da tela de pago con Bizum
        const bizumContainer = document.createElement('div');
        bizumContainer.className = 'max-w-full sm:max-w-md w-full h-full overflow-y-auto md:h-auto md:rounded-xl';
        bizumContainer.id = 'bizum-payment-container';
        
        bizumContainer.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-foreground">Escanea el código QR o copia el código.</h2>
            </div>
            
            <div class="border-t border-b border-border py-4 my-4">
                <div class="flex flex-col items-center justify-center">
                    <div class="bg-muted p-4 rounded-lg mb-4">
                        <img 
                            alt="Bizum Qr Code" 
                            width="200" 
                            height="200" 
                            decoding="async" 
                            class="rounded-2xl object-contain" 
                            src="${paymentData.qrCodeUrl}" 
                            id="qrCodeImage"
                        />
                    </div>
                    
                    <div class="w-full">
                        <div class="flex justify-between items-center text-muted-foreground mb-2">
                            <span class="font-medium">Importe Bizum:</span>
                            <span class="font-bold text-lg text-foreground" id="bizumValue">${formatCurrency(paymentData.valor)}</span>
                        </div>
                        
                        <div>
                            <div class="text-sm text-muted-foreground truncate mb-2 bg-muted p-2 rounded" id="bizumCode">
                                ${paymentData.bizumCode}
                            </div>
                            
                            <button 
                                type="button" 
                                class="w-full py-3 rounded-lg flex items-center justify-center gap-2 bg-primary text-primary-foreground hover:opacity-90 transition" 
                                id="copyBizumButton"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy" aria-hidden="true">
                                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                                </svg>
                                <span class="text-sm" id="copyButtonText">Copiar código Bizum</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="space-y-3 text-foreground">
                <h3 class="font-medium">Cómo pagar:</h3>
                <ol class="space-y-3 text-sm">
                    <li class="flex">
                        <span class="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center mr-2 shrink-0 text-xs font-medium">1</span>
                        <p>Abre la app de tu banco e selecciona la opción de pago con Bizum</p>
                    </li>
                    <li class="flex">
                        <span class="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center mr-2 shrink-0 text-xs font-medium">2</span>
                        <p>Elige pagar usando el código QR o copia el código Bizum de arriba</p>
                    </li>
                    <li class="flex">
                        <span class="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center mr-2 shrink-0 text-xs font-medium">3</span>
                        <p>Confirma los detalles del pago y el destinatario</p>
                    </li>
                    <li class="flex">
                        <span class="bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center mr-2 shrink-0 text-xs font-medium">4</span>
                        <p>Completa el pago e guarda el comprobante (serás redirigido automáticamente después del pago)</p>
                    </li>
                </ol>
            </div>
        `;
        
        // Insertar después del formulario
        formElement.parentNode.insertBefore(bizumContainer, formElement.nextSibling);
        
        // Adicionar evento de copiar ao botão
        const copyButton = document.getElementById('copyBizumButton');
        const copyButtonText = document.getElementById('copyButtonText');
        
        if (copyButton) {
            copyButton.addEventListener('click', function() {
                // Copiar código Bizum para clipboard
                navigator.clipboard.writeText(paymentData.bizumCode).then(function() {
                    console.log('✅ Código Bizum copiado!');
                    
                    // Feedback visual
                    copyButtonText.textContent = 'Copiado!';
                    copyButton.classList.add('bg-success');
                    
                    // Voltar ao texto original após 2 segundos
                    setTimeout(function() {
                        copyButtonText.textContent = 'Copiar código Bizum';
                        copyButton.classList.remove('bg-success');
                    }, 2000);
                }).catch(function(err) {
                    console.error('❌ Error al copiar:', err);
                    alert('Error al copiar código Bizum');
                });
            });
        }
        
        console.log('✅ Pantalla de pago con Bizum renderizada');
        
        // Scroll suave para o container do BIZUM
        setTimeout(function() {
            bizumContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            console.log('📜 Scroll a contenedor Bizum ejecutado');
        }, 100);
        
        // Iniciar verificação de pagamento com dados do cliente
        startPaymentVerification(paymentData.token, paymentData.customerData);
    }
    
    // Função para verificar status do pagamento
    function startPaymentVerification(token, customerData) {
        console.log('🔄 Iniciando verificación de pago para token:', token);
        console.log('👤 Datos del cliente:', customerData);
        
        // Verificar cada 5 segundos
        const checkInterval = setInterval(function() {
            fetch('./verificar.php?id=' + token)
                .then(response => response.json())
                .then(data => {
                    console.log('📊 Estado del pago:', data);
                    
                    if (data.success && data.status) {
                        const status = data.status.toLowerCase();
                        
                        // Verificar se o pagamento foi aprovado
                        if (status === 'paid' || status === 'approved' || status === 'completed') {
                            console.log('✅ Pago aprobado! Status:', data.status);
                            clearInterval(checkInterval);
                            
                            // Construir URL de redirecionamento com todos os parâmetros
                            const urlParams = new URLSearchParams(window.location.search);
                            
                            // Adicionar dados do cliente apenas se não estiverem vazios
                            if (customerData.valorCentavos) {
                                urlParams.set('valor', customerData.valorCentavos);
                            }
                            
                            if (customerData.nome) {
                                urlParams.set('nome', customerData.nome);
                            }
                            
                            if (customerData.cpf) {
                                urlParams.set('cpf', customerData.cpf);
                            }
                            
                            if (customerData.email) {
                                urlParams.set('email', customerData.email);
                            }
                            
                            if (customerData.telefone) {
                                urlParams.set('telefone', customerData.telefone);
                            }
                            
                            if (token) {
                                urlParams.set('token', token);
                            }
                            
                            // Construir URL completa
                            const redirectUrl = './pagamento-confirmado.html?' + urlParams.toString();
                            
                            console.log('🎉 Redirigiendo a:', redirectUrl);
                            console.log('📋 Parámetros enviados:', Object.fromEntries(urlParams.entries()));
                            
                            // Redirecionar para página de sucesso
                            window.location.href = redirectUrl;
                        } else {
                            console.log('⏳ Esperando pago... Status atual:', data.status);
                        }
                    }
                })
                .catch(error => {
                    console.error('❌ Error al verificar pago:', error);
                });
        }, 5000);
        
        // Parar verificação após 30 minutos
        setTimeout(function() {
            clearInterval(checkInterval);
            console.log('⏱️ Tiempo de verificación expirado (30 minutos)');
        }, 30 * 60 * 1000);
    }
    
    // Interceptar el submit del formulario
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        console.log('💳 Iniciando proceso de pago...');
        
        // Obtener todos los datos del formulario
        const formData = new FormData(form);
        
        // Función para verificar si un campo está visible
        function isFieldVisible(fieldName) {
            const field = form.querySelector(`[name="${fieldName}"]`);
            if (!field) return false;
            
            // Verificar si el campo o algún padre está oculto
            let element = field;
            while (element && element !== document.body) {
                const style = window.getComputedStyle(element);
                if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
                    return false;
                }
                element = element.parentElement;
            }
            
            return true;
        }
        
        // Extraer valores (usar valores vazios se o campo estiver oculto)
        const email = isFieldVisible('email') ? (formData.get('email') || '') : '';
        const fullName = formData.get('fullName') || '';
        const phone = isFieldVisible('phone') ? (formData.get('phone') || '') : '';
        const cpfCnpj = isFieldVisible('document') ? (formData.get('document') || '') : '';
        const shipping = formData.get('shipping') || '';
        
        console.log('📋 Datos del formulario:', {
            email,
            fullName,
            phone,
            document: cpfCnpj,
            shipping
        });
        
        console.log('👁️ Visibilidad de los campos:', {
            email: isFieldVisible('email'),
            fullName: isFieldVisible('fullName'),
            phone: isFieldVisible('phone'),
            document: isFieldVisible('document')
        });
        
        // Validar solo el nombre (sempre obrigatório)
        if (!fullName) {
            showError('Por favor, completa tu nombre completo');
            return;
        }
        
        // Validar campos visibles
        if (isFieldVisible('email') && !email) {
            showError('Por favor, completa tu correo electrónico');
            return;
        }
        
        if (isFieldVisible('phone') && !phone) {
            showError('Por favor, completa tu teléfono');
            return;
        }
        
        if (isFieldVisible('document') && !cpfCnpj) {
            showError('Por favor, completa tu DNI/NIE');
            return;
        }
        
        // Obtener el valor total do elemento #total no HTML
        const totalElement = document.getElementById('total');
        let total = 0;
        
        if (totalElement) {
            // Extraer el valor del texto (ex: "€ 58,90" ou "R&nbsp;58,90")
            const totalText = totalElement.textContent || totalElement.innerText;
            const totalMatch = totalText.match(/[\d.,]+/);
            
            if (totalMatch) {
                // Convertir formato brasileño a número (ex: "58,90" -> 58.90)
                const totalStr = totalMatch[0].replace(/\./g, '').replace(',', '.');
                total = parseFloat(totalStr);
            }
        }
        
        // Fallback: tentar pegar do CartCalculator se o elemento não existir
        if (total === 0 && window.CartCalculator) {
            total = window.CartCalculator.getTotal();
        }
        
        const valorCentavos = Math.round(total * 100); // Converter para centavos
        
        console.log('💰 Valor total extraído:', total);
        console.log('💰 Valor en céntimos:', valorCentavos);
        console.log('💰 Fuente del valor:', totalElement ? 'Elemento #total' : 'CartCalculator');
        
        if (valorCentavos <= 0) {
            showError('Importe del pedido inválido');
            return;
        }
        
        // Obtener parámetros UTM
        const utmParams = getUTMParams();
        console.log('📊 Parámetros UTM:', utmParams);
        
        // Montar objeto de datos para enviar (enviar apenas campos preenchidos)
        const paymentData = {
            nome: fullName,
            valor: valorCentavos
        };
        
        // Adicionar campos opcionais apenas se estiverem preenchidos
        if (email) {
            paymentData.email = email;
        }
        
        if (phone) {
            paymentData.telefone = phone.replace(/\D/g, '');
        }
        
        if (cpfCnpj) {
            paymentData.cpf = cpfCnpj.replace(/\D/g, '');
        }
        
        // Adicionar parâmetros UTM apenas se não forem null
        Object.keys(utmParams).forEach(key => {
            if (utmParams[key] !== null) {
                paymentData[key] = utmParams[key];
            }
        });
        
        console.log('📦 Dados do pagamento a serem enviados:', paymentData);
        
        setButtonLoading(true);
        
        try {
            const response = await fetch('/api/public/cooud-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: valorCentavos,
                    currency: 'EUR',
                    productName: 'Ebook Seeds of Hope ES',
                    customerEmail: email || undefined,
                    fullName: fullName,
                    phone: phone,
                    src: window.location.hostname
                }),
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok || !result.id) {
                throw new Error(result.error || 'Erro ao iniciar pagamento');
            }

            console.log('✅ Sessão criada:', result.id);

            // Usar configuração retornada no POST ou tentar buscar se não existir
            let config = result;
            if (!config.cooud_element_token) {
                console.log('⏳ Configuração não encontrada no POST, tentando buscar...');
                const configRes = await fetch('/api/public/cooud-checkout', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        action: 'element_config',
                        session_id: result.id,
                        theme: 'light'
                    }),
                });
                config = await configRes.json().catch(() => ({}));
                
                if (!configRes.ok || !config.cooud_element_token) {
                    throw new Error(config.error || 'Erro ao carregar checkout');
                }
            }

            // Ocultar formulario de datos e mostrar elemento de checkout
            form.style.display = 'none';
            const elementContainer = document.getElementById('cooud-checkout-element');
            if (!elementContainer) {
                throw new Error('Container do checkout não encontrado');
            }
            elementContainer.style.display = 'block';

            // Inicializar Cooud Elements V2
            const mountCheckout = () => {
                const appearance = {
                    theme: 'light',
                    variables: {
                        colorPrimary: '#e02525',
                    }
                };

                if (window.__CooudElements__) {
                    console.log('Mounting via __CooudElements__...');
                    window.__CooudElements__.mount({
                        container: elementContainer,
                        sessionId: result.id,
                        elementToken: config.cooud_element_token,
                        sessionSecret: config.cooud_session_secret,
                        amount: valorCentavos,
                        currency: 'eur',
                        appearance: (config.element && config.element.appearance) || appearance,
                        apiBaseUrl: 'https://api.cooud.com',
                        onSuccess: (data) => {
                            console.log('✅ Pagamento concluído com sucesso:', data);
                            window.top.location.href = `/up/up1/?success=1&sessionId=${result.id}`;
                        },
                        onError: (error) => {
                            console.error('❌ Erro no elemento de checkout:', error);
                            showError((error && error.message) || 'Erro no processamento do pagamento.');
                            form.style.display = 'block';
                            elementContainer.style.display = 'none';
                            setButtonLoading(false);
                        }
                    });
                } else {
                    console.log('⏳ SDK não encontrado, tentando novamente...');
                    setTimeout(mountCheckout, 500);
                }
            };
            
            mountCheckout();

        } catch (error) {
            console.error('❌ Erro ao processar pagamento:', error);
            form.style.display = 'block';
            const elementContainer = document.getElementById('cooud-checkout-element');
            if (elementContainer) elementContainer.style.display = 'none';
            showError((error && error.message) || 'Erro ao processar pagamento. Tente novamente.');
            setButtonLoading(false);
        }
    });

    console.log('✅ Event listener del formulario configurado');
});
