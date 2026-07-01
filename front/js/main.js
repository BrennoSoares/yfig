/* main.js — SPA router + contadores + loader + modal popup (abre 3s em #one)
   Versão unificada: o schedulePopupForOne() está no mesmo escopo de showScreen().
*/
(function () {
  /* ---------------------------
     Variáveis / helpers de modal
     --------------------------- */
  let modalTimer = null;
  let activeModalId = null;

  function showModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    activeModalId = id;
    modal.classList.add("is-modal", "is-active");
    modal.removeAttribute("aria-hidden");

    // Captura a posição atual do scroll APENAS se ainda não estiver travado
    if (!document.body.classList.contains("modal-open")) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      document.body.classList.add("modal-open");
      document.documentElement.classList.add("modal-open");
    }

    // Habilita o botão .btn-sacar em #one somente quando o primeiro popup (id="two") abrir
    if (id === "two") {
      const btnOneSacar = document.querySelector(
        "#one .container-saldo .btn-sacar"
      );
      if (btnOneSacar) {
        btnOneSacar.removeAttribute("disabled");
        btnOneSacar.style.pointerEvents = "auto";
        btnOneSacar.style.opacity = "";
      }

      // Anima o contador do popup quando ele for exibido
      setTimeout(() => {
        const popupCounter = modal.querySelector(
          ".valor-currency[data-amount-target]"
        );
        if (
          popupCounter &&
          typeof window.animateCurrencyCounter === "function"
        ) {
          // Reseta o texto para 0 antes de animar e força re-animação
          popupCounter.textContent = "0,00";
          window.animateCurrencyCounter(popupCounter, true); // true = forceReset
        }
      }, 50);
    }

    // overlay click: DESABILITADO - popups só fecham por botões específicos
    function overlayClickHandler(ev) {
      // Nenhum popup fecha ao clicar fora
      // Todos os popups só fecham através de botões específicos
      return;
    }
    modal.addEventListener("click", overlayClickHandler);
    modal._overlayHandler = overlayClickHandler;

    // fechar por botões com data-modal-close
    const closeButtons = Array.from(
      modal.querySelectorAll("[data-modal-close]")
    );
    modal._closeButtonHandlers = closeButtons.map((btn) => {
      const h = (ev) => {
        ev && ev.preventDefault();
        closeModal(id);
      };
      btn.addEventListener("click", h);
      return { btn, h };
    });

    // foco para primeiro elemento do modal
    const focusable = modal.querySelector(
      'button, a, input, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable) focusable.focus();
  }

  function closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;

    if (modal._overlayHandler)
      modal.removeEventListener("click", modal._overlayHandler);
    if (modal._closeButtonHandlers) {
      modal._closeButtonHandlers.forEach(({ btn, h }) =>
        btn.removeEventListener("click", h)
      );
    }

    modal.classList.remove("is-active", "is-modal");
    modal.setAttribute("aria-hidden", "true");

    // Verifica se ainda existe algum modal aberto
    const remainingModals = document.querySelectorAll(
      ".screen.is-modal.is-active"
    );
    if (remainingModals.length === 0) {
      // Só destrava se não houver mais nenhum modal
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, parseInt(scrollY || "0") * -1);

      document.body.classList.remove("modal-open");
      document.documentElement.classList.remove("modal-open");
    }

    activeModalId = null;

    // foco volta pra #one se existir
    const screenOne = document.getElementById("one");
    if (screenOne) {
      const f = screenOne.querySelector(
        'button, a, input, [tabindex]:not([tabindex="-1"])'
      );
      if (f) f.focus();
    }
  }

  function schedulePopupForOne() {
    clearModalTimer();
    modalTimer = setTimeout(() => {
      const one = document.getElementById("one");
      if (one && one.classList.contains("is-active")) {
        showModal("two");
      }
    }, 0);
  }

  function clearModalTimer() {
    if (modalTimer) {
      clearTimeout(modalTimer);
      modalTimer = null;
    }
  }

  // limpa timer ao sair da página
  window.addEventListener("beforeunload", clearModalTimer);

  /* ---------------------------
     Contadores (evergreen) — mantidos
     --------------------------- */
  function iniciarContadorInline(tempoTotal) {
    const timerElement = document.getElementById("timer");
    const textElement = document.getElementById("countdown-text");
    if (!timerElement || !textElement) return;

    let tempoRestante = tempoTotal;
    let contador = setInterval(() => {
      if (tempoRestante < 0) {
        clearInterval(contador);
        textElement.textContent = "TU SALDO HA EXPIRADO";
        return;
      }
      let minutos = Math.floor(tempoRestante / 60);
      let segundos = tempoRestante % 60;
      timerElement.textContent = `00 - ${String(minutos).padStart(
        2,
        "0"
      )} - ${String(segundos).padStart(2, "0")}`;
      tempoRestante--;
    }, 1000);
  }

  function iniciarContadorPopup(tempoTotal) {
    const todosOsTimersPopup = document.querySelectorAll(".expira-em-popup");
    if (!todosOsTimersPopup.length) return;

    todosOsTimersPopup.forEach((timerContainer, index) => {
      const minutesElement = timerContainer.querySelector(
        '[data-timer="minutes"]'
      );
      const secondsElement = timerContainer.querySelector(
        '[data-timer="seconds"]'
      );
      const labelElement = timerContainer.querySelector(".timer-label");
      if (!minutesElement || !secondsElement || !labelElement) return;

      let tempoRestante = tempoTotal;
      let contador = setInterval(() => {
        if (tempoRestante < 0) {
          clearInterval(contador);
          labelElement.textContent = "Expirado";
          minutesElement.textContent = "00";
          secondsElement.textContent = "00";
          return;
        }
        let minutos = Math.floor(tempoRestante / 60);
        let segundos = tempoRestante % 60;
        minutesElement.textContent = String(minutos).padStart(2, "0");
        secondsElement.textContent = String(segundos).padStart(2, "0");
        tempoRestante--;
      }, 1000);
    });
  }

  /* ---------------------------
     Loader (barra de progresso)
     --------------------------- */
  /* ---------------------------
     Loader (barra de progresso)
     --------------------------- */
  let loaderState = {
    timeouts: [],
    interval: null,
  };

  function resetLoader() {
    const loadingText = document.getElementById("loading-text");
    const progressBar = document.getElementById("progress-bar");
    if (!loadingText || !progressBar) return;

    // Clear all scheduled timeouts
    loaderState.timeouts.forEach((t) => clearTimeout(t));
    loaderState.timeouts = [];

    if (loaderState.interval) {
      clearInterval(loaderState.interval);
      loaderState.interval = null;
    }

    // Reset UI
    progressBar.style.transition = "none";
    progressBar.style.width = "0%";
    loadingText.textContent = "Iniciando...";
    loadingText.style.opacity = "1";
  }

  function startLoader() {
    const loadingText = document.getElementById("loading-text");
    const progressBar = document.getElementById("progress-bar");
    if (!loadingText || !progressBar) return;

    resetLoader(); // Ensure clean state

    const steps = [
      { text: "Validando tu información", progress: 25 },
      { text: "Finalizando retiro", progress: 50 },
      { text: "Procesando transacción", progress: 75 },
      { text: "Finalizando", progress: 100 },
    ];
    const stepDuration = 3000,
      textFadeDuration = 400,
      dotAnimationSpeed = 800;

    let currentStep = 0;

    // Restore transition
    // Force reflow before adding transition back
    void progressBar.offsetWidth;
    progressBar.style.transition = `width ${stepDuration / 1000}s linear`;

    function scheduleNextStep() {
      if (currentStep < steps.length) {
        if (loaderState.interval) clearInterval(loaderState.interval);

        loadingText.style.opacity = 0;

        const t1 = setTimeout(() => {
          const step = steps[currentStep];
          const baseText = step.text;
          loadingText.textContent = baseText;
          // Calcula a largura considerando o padding de 20px de cada lado
          const containerWidth = progressBar.parentElement.offsetWidth - 40; // 20px de cada lado
          progressBar.style.width =
            (containerWidth * step.progress) / 100 + "px";
          loadingText.style.opacity = 1;

          let dotCount = 0;
          loaderState.interval = setInterval(() => {
            dotCount = (dotCount % 3) + 1;
            loadingText.textContent = baseText + ".".repeat(dotCount);
          }, dotAnimationSpeed);

          currentStep++;
          const t2 = setTimeout(scheduleNextStep, stepDuration);
          loaderState.timeouts.push(t2);
        }, textFadeDuration);
        loaderState.timeouts.push(t1);
      } else {
        if (loaderState.interval) clearInterval(loaderState.interval);
        loadingText.style.opacity = 0;

        const t3 = setTimeout(() => {
          loadingText.textContent = "¡Retiro completado!!";
          loadingText.style.opacity = 1;
        }, textFadeDuration);
        loaderState.timeouts.push(t3);
      }
    }

    // Start
    const tStart = setTimeout(scheduleNextStep, 500);
    loaderState.timeouts.push(tStart);
  }

  // Expose globally
  window.startLoader = startLoader;
  window.resetLoader = resetLoader;

  /* ---------------------------
     Nova animação de loading (#seven)
     --------------------------- */
  /* ---------------------------
     Nova animação de loading (#seven)
     --------------------------- */
  let newLoadingState = {
    interval: null,
    timeouts: [],
  };

  function startNewLoadingAnimation() {
    const loadingText = document.getElementById("new-loading-text");
    const progressBar = document.getElementById("new-progress-bar");

    if (!loadingText || !progressBar) return;

    // Reset state
    resetNewLoadingAnimation();

    // Force faster transition to match new speed
    progressBar.style.transition = "width 1.3s ease-in-out";

    const texts = [
      "Validando dados...",
      "Conectando con el servidor...",
      "Finalizando canje...",
      "Casi listo...",
    ];

    // Set initial text immediately
    loadingText.textContent = texts[0];

    let currentIndex = 0;
    const totalSteps = texts.length;
    const progressPerStep = 100 / totalSteps;

    function updateProgress() {
      const progress = (currentIndex + 1) * progressPerStep;
      progressBar.style.width = `${progress}%`;
    }

    // Inicializar progresso
    updateProgress();

    function changeText() {
      loadingText.style.opacity = 0;

      const t1 = setTimeout(() => {
        currentIndex++;
        loadingText.textContent = texts[currentIndex];
        loadingText.style.opacity = 1;

        // Atualizar progresso com transição suave
        updateProgress();
      }, 150);
      newLoadingState.timeouts.push(t1);
    }

    // Loop de textos
    newLoadingState.interval = setInterval(() => {
      if (currentIndex >= totalSteps - 1) {
        // Chegou no último passo ("Casi listo...")
        clearInterval(newLoadingState.interval);

        // Finaliza e redireciona para /confirmar-saque com parâmetros
        const tEnd = setTimeout(() => {
          const p = window.location.search || '';
          window.location.href = '/confirmar-saque/index.html' + p;
        }, 700);
        newLoadingState.timeouts.push(tEnd);
        return;
      }
      changeText();
    }, 1600);
  }

  function resetNewLoadingAnimation() {
    const loadingText = document.getElementById("new-loading-text");
    const progressBar = document.getElementById("new-progress-bar");

    if (newLoadingState.interval) {
      clearInterval(newLoadingState.interval);
      newLoadingState.interval = null;
    }
    newLoadingState.timeouts.forEach((t) => clearTimeout(t));
    newLoadingState.timeouts = [];

    if (loadingText) {
      loadingText.textContent = "Validando acceso...";
      loadingText.style.opacity = 1;
    }
    if (progressBar) {
      progressBar.style.transition = "none";
      progressBar.style.width = "0%";
      // Força reflow
      void progressBar.offsetWidth;
      progressBar.style.transition =
        "width 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)";
    }
  }

  // Expose globally
  window.startNewLoadingAnimation = startNewLoadingAnimation;
  window.resetNewLoadingAnimation = resetNewLoadingAnimation;

  /* ---------------------------
     Função para preencher página de confirmação (#nine)
     --------------------------- */
  function fillConfirmationPage() {
    // Tenta pegar do objeto global ou do localStorage
    let formData = window.__formData;
    if (!formData) {
      try {
        const stored = localStorage.getItem("userBizumData");
        if (stored) {
          formData = JSON.parse(stored);
        }
      } catch (e) {
        console.error("Erro ao ler localStorage", e);
      }
    }

    if (!formData) return;

    // Função para formatar data atual
    function getCurrentDate() {
      const now = new Date();
      const day = String(now.getDate()).padStart(2, "0");
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const year = now.getFullYear();
      return `${day}/${month}/${year}`;
    }

    // Preenche o nome
    const nameElement = document.getElementById("confirmation-name");
    if (nameElement && formData.nome) {
      nameElement.textContent = formData.nome;
    }

    // Preenche o email
    const emailElement = document.getElementById("confirmation-email");
    if (emailElement && formData.email) {
      emailElement.textContent = formData.email;
    }

    // Preenche a data atual
    const dateElement = document.getElementById("confirmation-date");
    if (dateElement) {
      dateElement.textContent = getCurrentDate();
    }

    // Preenche o tipo de chave PIX com logo
    const keyTypeElement = document.getElementById("confirmation-key-type");
    if (keyTypeElement && formData.tipoChave) {
      let logoHtml = "";
      if (formData.tipoChave === "Bizum") {
        logoHtml = `<img src="images/bizum-solo.png" alt="" style="height: 14px;">`;
      } else if (formData.tipoChave === "Banco") {
        logoHtml = `<img src="images/bank-transfer.png" alt="" style="height: 16px;">`;
      } else if (formData.tipoChave === "PayPal") {
        logoHtml = `<img src="images/paypal-logo.jpg" alt="" style="height: 14px; border-radius: 2px;">`;
      }
      keyTypeElement.innerHTML = `${logoHtml} <span>${formData.tipoChave}</span>`;
    }

    // Preenche a chave PIX digitada
    const pixKeyElement = document.getElementById("confirmation-pix-key");
    if (pixKeyElement && formData.chaveBizum) {
      pixKeyElement.textContent = formData.chaveBizum;
    }

    // --- Integração Direta com Checkout Cooud ---
    // Limpar qualquer onclick inline que possa interferir antes de anexar o listener
    const confirmBtn = document.querySelector(".confirmation-cta-button");
    if (confirmBtn) {
        // Remover handlers antigos para evitar duplicatas
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
        setupCheckoutButton(newBtn, formData);
    }
  }

  function setupCheckoutButton(confirmBtn, formData) {
    if (confirmBtn) {
      console.log("🎯 Botão de confirmação encontrado no DOM");
      if (!confirmBtn._hasCheckoutHandler) {
        confirmBtn._hasCheckoutHandler = true;
        confirmBtn.addEventListener("click", async function(e) {
          e.preventDefault();
          e.stopPropagation();
          
          const originalText = confirmBtn.textContent;
          
          try {
            // 1. Estado de loading
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = "0.7";
            confirmBtn.style.cursor = "wait";
            confirmBtn.textContent = "Procesando...";
            
            console.log("🚀 Iniciando checkout direto para taxa de 20,04 €");

            // 2. Criar sessão de checkout
            const currentUrl = new URL(window.location.href);
            const response = await fetch("/api/public/cooud-checkout", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                amount: 2004, // 20,04 € em centavos
                currency: "eur",
                productName: "Tasa de liberación de retiro",
                customerEmail: formData.email || undefined,
                success_url: `${currentUrl.origin}${currentUrl.pathname}?success=1`,
                cancel_url: `${currentUrl.origin}${currentUrl.pathname}?canceled=1`,
              }),
            });

            const result = await response.json().catch(() => ({}));

            if (!response.ok || !result.id || !result.cooud_element_token || !result.cooud_session_secret) {
              throw new Error(result.error || "Erro ao iniciar pagamento");
            }

            // 3. Backup de dados para a página de sucesso
            sessionStorage.setItem("paymentData", JSON.stringify({
              sessionId: result.id,
              valor: 20.04,
              customerData: formData
            }));

            // 4. Salvar dados para a nova página de checkout
            sessionStorage.setItem("refundCheckoutData", JSON.stringify({
              customerName: formData.nome,
              customerEmail: formData.email,
              customerPhone: formData.chaveBizum,
              amountCents: 2004 // 20,04 € para a página front
            }));


            // 5. Redirecionar para a nova página de checkout preservando query params
            const q = window.location.search || "";
            window.location.href = "/checkout-cooud/index.html" + q;


            // 6. Montar o checkout
            let checkoutContainer = document.getElementById("cooud-checkout-element");
            if (!checkoutContainer) {
              console.error("Container de checkout não encontrado");
              return;
            }

            for (let attempt = 0; attempt < 80 && !window.__CooudElements__; attempt += 1) {
              await new Promise((resolve) => setTimeout(resolve, 50));
            }
            if (!window.__CooudElements__) {
              throw new Error("Cooud Elements não carregou");
            }

            window.__CooudElements__.mount({
              container: checkoutContainer,
              sessionId: result.id,
              elementToken: result.cooud_element_token,
              sessionSecret: result.cooud_session_secret,
              amount: 2004,
              currency: "eur",
              appearance: (result.element && result.element.appearance) || { theme: "light" },
              apiBaseUrl: "https://api.cooud.com",
              onSuccess: () => {
                window.location.href = `${currentUrl.origin}${currentUrl.pathname}?success=1&sessionId=${result.id}`;
              },
              onError: (error) => {
                alert((error && error.message) || "Erro no processamento do pagamento.");
                if (typeof window.showScreen === "function") {
                  window.showScreen("nine");
                }
                confirmBtn.disabled = false;
                confirmBtn.style.opacity = "";
                confirmBtn.style.cursor = "pointer";
                confirmBtn.textContent = originalText;
              },
            });

          } catch (error) {
            console.error("❌ Erro no checkout direto:", error);
            alert((error && error.message) || "Erro ao processar pagamento. Tente novamente.");
            
            // Restaurar botão em caso de erro
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = "";
            confirmBtn.style.cursor = "pointer";
            confirmBtn.textContent = originalText;
          }
        });
      }
    }
  }


  // Expose globally
  window.fillConfirmationPage = fillConfirmationPage;

  /* ---------------------------
     SPA Router (inicia screens e navegação)
     --------------------------- */
    const modalIds = ["two", "four", "five", "ten"];
    function initRouter() {
      const screens = Array.from(document.querySelectorAll("#screens .screen"));
    if (!screens.length) return;

    function showScreen(id, push = true) {
      const target = document.getElementById(id);
      if (!target) {
        console.warn(`Tela "${id}" não encontrada.`);
        return;
      }

      screens.forEach((s) => {
        if (s === target) {
          s.classList.add("is-active");
          s.removeAttribute("aria-hidden");
        } else {
          s.classList.remove("is-active");
          s.setAttribute("aria-hidden", "true");
        }
      });

      if (push) {
        try {
          history.pushState({ screen: id }, "", "#" + id);
        } catch (e) {
          location.hash = id;
        }
      }

      // Scroll to top when showing a new screen
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;

      // Para #nine, força scroll para o topo após renderização
      if (id === "nine") {
        // Scroll imediato
        window.scrollTo({ top: 0, left: 0, behavior: "instant" });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Scroll novamente após renderização para garantir
        setTimeout(() => {
          window.scrollTo({ top: 0, left: 0, behavior: "instant" });
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          const nineElement = document.getElementById("nine");
          if (nineElement) {
            nineElement.scrollTop = 0;
            // Também força scroll no container se houver
            const container = nineElement.querySelector(
              ".confirmation-container"
            );
            if (container) {
              container.scrollTop = 0;
            }
          }
        }, 100);
      }

      const focusable = target.querySelector(
        'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable) focusable.focus({ preventScroll: true });

      // >>> Aqui garantimos que o popup seja agendado quando entrarmos em #one
      if (id === "one") {
        schedulePopupForOne();
      } else {
        clearModalTimer();

        // Garante que o sticky popup suma ao sair da #one
        const stickyPopup = document.getElementById("popup-um");
        if (stickyPopup) {
          stickyPopup.classList.remove("is-visible");
        }

        // Se for para #seven, fecha todos os modais e inicia novo loader
        if (id === "seven") {
          const modalIds = ["two", "four", "five"];
          modalIds.forEach((modalId) => {
            const modal = document.getElementById(modalId);
            if (modal && modal.classList.contains("is-modal")) {
              closeModal(modalId);
            }
          });
          // Inicia a nova animação de loading
          if (typeof startNewLoadingAnimation === "function") {
            startNewLoadingAnimation();
          }
        } else {
          // Se não for #seven, reseta o loader
          if (typeof window.resetLoader === "function") {
            window.resetLoader();
          }

          // Reseta a nova animação de loading se estiver ativa
          if (typeof resetNewLoadingAnimation === "function") {
            resetNewLoadingAnimation();
          }

          if (activeModalId) {
            closeModal(activeModalId);
          }
        }
      }

      // Anima contador da tela #three quando ela for exibida
      if (
        id === "three" &&
        typeof window.animateCurrencyCounter === "function"
      ) {
        // Usa um timeout maior para garantir que a tela está totalmente renderizada
        // e cancela qualquer timeout anterior para evitar múltiplas animações
        if (target._threeAnimationTimeout) {
          clearTimeout(target._threeAnimationTimeout);
        }
        target._threeAnimationTimeout = setTimeout(() => {
          const threeCounter = target.querySelector(
            ".valor-currency[data-amount-target]"
          );
          if (threeCounter) {
            // Garante que o elemento ainda está visível antes de animar
            if (target.classList.contains("is-active")) {
              window.animateCurrencyCounter(threeCounter, true); // true = forceReset
            }
          }
          target._threeAnimationTimeout = null;
        }, 100);
      }

      // Preenche dados na página de confirmação (#nine) quando ela for exibida
      if (id === "nine") {
        // Garante que a página apareça no topo
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        // Preenche imediatamente para evitar flash de conteúdo vazio
        fillConfirmationPage();

        setTimeout(() => {
          // Força scroll para o topo novamente após renderização
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
          const nineElement = document.getElementById("nine");
          if (nineElement) {
            nineElement.scrollTop = 0;
          }

          // Animação do saldo (pode ficar no timeout ou fora, mas fora é mais garantido de iniciar logo)
          const confirmationBalance = document.querySelector(
            ".confirmation-balance-amount[data-amount-target]"
          );
          if (
            confirmationBalance &&
            typeof window.animateCurrencyCounter === "function"
          ) {
            window.animateCurrencyCounter(confirmationBalance, true);
          }
        }, 150);
      }
    }

    window.addEventListener("popstate", (ev) => {
      const id =
        (ev.state && ev.state.screen) ||
        location.hash.replace("#", "") ||
        screens[0].id;
      showScreen(id, /*push*/ false);
    });

    // inicial: usa hash ou primeira screen
    const initial = location.hash.replace("#", "") || screens[0].id;
    showScreen(initial, /*push*/ false);

    // expõe globalmente se precisar (útil pra debugging)
    window.showScreen = showScreen;
    
    // Garantir que os dados sejam carregados se entrarmos direto na #nine
    if (initial === 'nine') {
        fillConfirmationPage();
    }
  }

  // Se preferir JS: torna o botão .btn-sacar um link para a screen 'three'

  document.addEventListener("DOMContentLoaded", () => {
    const btnSacar =
      document.querySelector("#one .container-saldo .btn-sacar") ||
      document.querySelector(".btn-sacar");
    if (btnSacar) {
      btnSacar.addEventListener("click", function (ev) {
        ev.preventDefault();
        // fecha modal/timers caso haja algum aberto (opcional)
        if (typeof clearModalTimer === "function") clearModalTimer();
        if (typeof closeModal === "function" && activeModalId)
          closeModal(activeModalId);

        // usa a função global do router para trocar de tela
        if (typeof window.showScreen === "function") {
          window.showScreen("three");
        } else {
          // fallback: altera hash
          location.hash = "#three";
        }
      });
    }
  });

  /* ---------------------------
     Inicialização
     --------------------------- */
  document.addEventListener("DOMContentLoaded", () => {
    initRouter();

    // iniciadores de contador (evergreen) — ajuste o tempo aqui se quiser
    const tempoInicialEmSegundos = 16 * 60 + 38;
    iniciarContadorInline(tempoInicialEmSegundos);
    iniciarContadorPopup(tempoInicialEmSegundos);

    // initLoaderIfExists(); // Removido para iniciar apenas no #seven

    initStickyPopup();

    // Garante que o popup inicial seja agendado se estivermos na #one
    const currentHash = location.hash.replace("#", "") || "one";
    if (currentHash === "one") {
      schedulePopupForOne();
    }
  });

  /* ---------------------------
     Sticky Popup Logic
     --------------------------- */
  function initStickyPopup() {
    const saldoSection = document.querySelector("#one .saldo");
    const stickyPopup = document.getElementById("popup-um");
    const screenOne = document.getElementById("one");

    if (!saldoSection || !stickyPopup || !screenOne) return;

    // Configura botão de sacar do popup para funcionar igual ao principal
    const btnSacarPopup = stickyPopup.querySelector(".btn-sacar");
    if (btnSacarPopup) {
      btnSacarPopup.addEventListener("click", (ev) => {
        ev.preventDefault();
        if (typeof window.showScreen === "function") {
          window.showScreen("three");
        } else {
          location.hash = "#three";
        }
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Se .saldo NÃO está intersectando (saiu da tela) E #one está ativo
          if (
            !entry.isIntersecting &&
            screenOne.classList.contains("is-active")
          ) {
            stickyPopup.classList.add("is-visible");
          } else {
            stickyPopup.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0, // Dispara assim que qualquer parte sair/entrar
        rootMargin: "-50px 0px 0px 0px", // Ajuste fino para disparar um pouco antes de sumir totalmente
      }
    );

    observer.observe(saldoSection);

    // Expõe para ser usado no router
    window.__stickyObserver = observer;
  }

  // expõe helpers para caso queira manipular modal manualmente em console
  window.__spa_modal_helpers = {
    schedulePopupForOne,
    clearModalTimer,
    showModal,
    closeModal,
  };

  /* ===== Delegação para botões que fecham modal (funciona mesmo se botão não tiver listener) ===== */
  document.body.addEventListener("click", function (ev) {
    const btn = ev.target.closest("[data-modal-close]");
    if (!btn) return;
    ev.preventDefault();

    // procura o modal ancestor (section com class "screen")
    const modalAncestor = btn.closest(".screen");
    const modalId = modalAncestor ? modalAncestor.id : "two";

    // Se closeModal estiver no escopo (dentro da IIFE), usa diretamente.
    // Caso use outra instância, tenta o helper exposto window.__spa_modal_helpers.closeModal
    if (typeof closeModal === "function") {
      closeModal(modalId);
    } else if (
      window.__spa_modal_helpers &&
      typeof window.__spa_modal_helpers.closeModal === "function"
    ) {
      window.__spa_modal_helpers.closeModal(modalId);
    } else {
      // fallback: tenta esconder a section manualmente
      const modalEl = document.getElementById(modalId);
      if (modalEl) {
        modalEl.classList.remove("is-active", "is-modal");
        modalEl.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
      }
    }
  });

  /* ===== Delegação para abrir modais (pix-item abre #five) ===== */
  /* ===== Delegação para abrir modais (pix-item abre #five) ===== */
  document.body.addEventListener("click", function (ev) {
    const opener = ev.target.closest("[data-open-modal]");
    if (!opener) return;

    const modalId = opener.getAttribute("data-open-modal");
    const method = opener.getAttribute("data-method");
    if (!modalId) return;

    ev.preventDefault();
    ev.stopPropagation();

    // Lógica para atualizar labels e logos baseada no método selecionado
    if (method) {
        const titleEl = document.getElementById("vincular-title");
        const methodLogo = document.getElementById("method-logo-vincular");
        const keyLabelEl = document.getElementById("key-label");
        const keyInput = document.getElementById("pix-key-input");
        const screenFive = document.getElementById("five");

        if (screenFive) screenFive.setAttribute("data-method", method);

        if (titleEl) titleEl.textContent = `Vincular ${method}`;
        
        if (method === "Bizum") {
            if (methodLogo) {
                methodLogo.src = "images/bizum-solo.png";
                methodLogo.style.display = "block";
                methodLogo.style.height = "18px";
            }
            if (keyLabelEl) keyLabelEl.textContent = "Número de teléfono";
            if (keyInput) {
                keyInput.placeholder = "+34 600 000 000";
                keyInput.type = "tel";
            }
        } else if (method === "Banco") {
            if (methodLogo) {
                methodLogo.src = "images/bank-transfer.png";
                methodLogo.style.display = "block";
                methodLogo.style.height = "20px";
            }
            if (keyLabelEl) keyLabelEl.textContent = "IBAN";
            if (keyInput) {
                keyInput.placeholder = "ES00 0000 0000 0000 0000 0000";
                keyInput.type = "text";
            }
        } else if (method === "PayPal") {
            if (methodLogo) {
                methodLogo.src = "images/paypal-logo.jpg";
                methodLogo.style.display = "block";
                methodLogo.style.height = "16px";
                methodLogo.style.borderRadius = "2px";
            }
            if (keyLabelEl) keyLabelEl.textContent = "Correo PayPal";
            if (keyInput) {
                keyInput.placeholder = "tu@correo.com";
                keyInput.type = "email";
            }
        }
    }

    // Abre o modal usando a função showModal
    if (typeof showModal === "function") {
      showModal(modalId);
    } else if (
      window.__spa_modal_helpers &&
      typeof window.__spa_modal_helpers.showModal === "function"
    ) {
      window.__spa_modal_helpers.showModal(modalId);
    }
  });

  // Suporte para tecla Enter no pix-item (acessibilidade)
  document.body.addEventListener("keydown", function (ev) {
    if (ev.key !== "Enter" && ev.key !== " ") return;

    const opener = ev.target.closest("[data-open-modal]");
    if (!opener) return;

    const modalId = opener.getAttribute("data-open-modal");
    if (!modalId) return;

    ev.preventDefault();
    ev.stopPropagation();

    if (typeof showModal === "function") {
      showModal(modalId);
    } else if (
      window.__spa_modal_helpers &&
      typeof window.__spa_modal_helpers.showModal === "function"
    ) {
      window.__spa_modal_helpers.showModal(modalId);
    }
  });

  /* ===== Função para fechar todos os modais abertos ===== */
  function closeAllModals() {
    const modalIds = ["two", "four", "five"];
    modalIds.forEach((modalId) => {
      const modal = document.getElementById(modalId);
      if (modal && modal.classList.contains("is-modal")) {
        if (typeof closeModal === "function") {
          closeModal(modalId);
        } else if (
          window.__spa_modal_helpers &&
          typeof window.__spa_modal_helpers.closeModal === "function"
        ) {
          window.__spa_modal_helpers.closeModal(modalId);
        } else {
          // fallback: fecha manualmente
          modal.classList.remove("is-active", "is-modal");
          modal.setAttribute("aria-hidden", "true");
          document.body.classList.remove("modal-open");
        }
      }
    });
    activeModalId = null;
  }

  /* ===== Lógica de Seleção de Chave PIX e Validação ===== */

  // Helpers de Validação
  function validateCPF(cpf) {
    cpf = cpf.replace(/[^\d]+/g, "");
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
    let soma = 0,
      resto;
    for (let i = 1; i <= 9; i++)
      soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(cpf.substring(9, 10))) return false;
    soma = 0;
    for (let i = 1; i <= 10; i++)
      soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    return resto === parseInt(cpf.substring(10, 11));
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePhone(phone) {
    const cleanPhone = phone.replace(/\D/g, "");
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  function validateRandomKey(key) {
    // Validação simplificada de UUID (32 hex chars + 4 hifens = 36 chars)
    // Formato: 8-4-4-4-12
    return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(
      key
    );
  }

  // Função de validação geral
  function checkBizumFormValidity() {
    const nomeInput = document.getElementById("nome");
    const emailInput = document.getElementById("email");
    const keyInput = document.getElementById("pix-key-input");
    const btnEnviar = document.getElementById("btn-enviar-pix");
    const screenFive = document.getElementById("five");

    if (!nomeInput || !emailInput || !keyInput || !btnEnviar) return;

    const isNomeFilled = nomeInput.value.trim().length > 0;
    const isEmailValid = validateEmail(emailInput.value.trim());
    const keyValue = keyInput.value.trim();
    const currentMethod = screenFive ? screenFive.getAttribute("data-method") : "Bizum";

    let isKeyValid = false;

    if (keyValue.length > 0) {
      if (currentMethod === "Bizum") {
        // Validação básica de telefone ES (+34 ou apenas 9 dígitos)
        const cleanPhone = keyValue.replace(/\D/g, "");
        isKeyValid = cleanPhone.length >= 9;
      } else if (currentMethod === "Banco") {
        // Validação básica de IBAN ES (24 caracteres)
        const cleanIBAN = keyValue.replace(/\s/g, "");
        isKeyValid = cleanIBAN.length >= 20;
      } else if (currentMethod === "PayPal") {
        isKeyValid = validateEmail(keyValue) || keyValue.length > 5;
      } else {
        isKeyValid = keyValue.length > 0;
      }
    }

    if (isNomeFilled && isEmailValid && isKeyValid) {
      btnEnviar.classList.remove("btn-disabled");
    } else {
      btnEnviar.classList.add("btn-disabled");
    }
  }

  // Listeners para validação em tempo real
  const nomeInput = document.getElementById("nome");
  if (nomeInput) {
    nomeInput.addEventListener("input", checkBizumFormValidity);
  }
  const emailInput = document.getElementById("email");
  if (emailInput) {
    emailInput.addEventListener("input", checkBizumFormValidity);
  }

  // 1. Removemos os listeners do seletor antigo e adicionamos foco ao abrir
  // A lógica de abertura já está no delegate principal.

  // 3. Validação e Envio (Botão Enviar no #five)
  document.body.addEventListener("click", function (ev) {
    const btnEnviar = ev.target.closest("#btn-enviar-pix");
    if (!btnEnviar) return;

    ev.preventDefault();

    // Se o botão estiver desabilitado, executa validação visual (shake)
    if (btnEnviar.classList.contains("btn-disabled")) {
      const nomeInput = document.getElementById("nome");
      const emailInput = document.getElementById("email");
      const keyInput = document.getElementById("pix-key-input");

      // 1. Valida Nome
      if (nomeInput && nomeInput.value.trim() === "") {
        nomeInput.classList.remove("shake-animation", "input-error");
        void nomeInput.offsetWidth; // force reflow
        nomeInput.classList.add("input-error", "shake-animation");
        setTimeout(() => nomeInput.classList.remove("shake-animation"), 500);
      }

      // 2. Valida Email
      if (emailInput && !validateEmail(emailInput.value.trim())) {
        emailInput.classList.remove("shake-animation", "input-error");
        void emailInput.offsetWidth;
        emailInput.classList.add("input-error", "shake-animation");
        setTimeout(() => emailInput.classList.remove("shake-animation"), 500);
      }

      // 3. Valida Chave (conforme método)
      if (keyInput) {
        const keyValue = keyInput.value.trim();
        let isKeyValid = false;

        // Reutiliza lógica de validação
        const screenFive = document.getElementById("five");
        const selectedMethod = screenFive ? screenFive.getAttribute("data-method") : "Bizum";

        if (selectedMethod === "Bizum") {
          isKeyValid = keyValue.replace(/\D/g, "").length >= 9;
        } else if (selectedMethod === "Banco") {
          isKeyValid = keyValue.replace(/\s/g, "").length >= 20;
        } else if (selectedMethod === "PayPal") {
          isKeyValid = validateEmail(keyValue) || keyValue.length > 5;
        } else {
          isKeyValid = keyValue.length > 0;
        }

        if (!isKeyValid) {
          keyInput.classList.remove("shake-animation", "input-error");
          void keyInput.offsetWidth;
          keyInput.classList.add("input-error", "shake-animation");
          keyInput.focus();
          setTimeout(() => keyInput.classList.remove("shake-animation"), 500);
        }
      }

      return; // Impede envio
    }

    // Se passou (botão habilitado), prossegue
    const nomeInput = document.getElementById("nome");
    const emailInput = document.getElementById("email");
    const keyInput = document.getElementById("pix-key-input");
    const screenFive = document.getElementById("five");
    const activeMethod = screenFive ? screenFive.getAttribute("data-method") : "Bizum";

    // Captura os dados do formulário
    const formData = {
      nome: nomeInput ? nomeInput.value.trim() : "",
      email: emailInput ? emailInput.value.trim() : "",
      tipoChave: activeMethod,
      chaveBizum: keyInput ? keyInput.value.trim() : "",
      tipoMetodo: activeMethod
    };

    // Armazena os dados para usar na página de confirmação
    window.__formData = formData;

    // Salva também no localStorage para persistência
    try {
      localStorage.setItem("userBizumData", JSON.stringify(formData));
      // Sincroniza com a chave usada na página de confirmação de saque
      localStorage.setItem("userBizumFecha", JSON.stringify(formData));
    } catch (e) {
      console.error("Erro ao salvar no localStorage", e);
    }

    // Sucesso: Fecha modais e vai para #seven
    closeAllModals();

    if (typeof window.showScreen === "function") {
      window.showScreen("seven");
    } else {
      location.hash = "#seven";
    }
  });

  // Helpers de Formatação (Máscaras)
  function formatBizumKey(value, method) {
    if (!value) return "";

    if (method === "Bizum") {
      value = value.replace(/\D/g, ""); // Remove tudo que não é dígito
      if (value.length > 9) value = value.slice(0, 9);
      
      // Máscara telefone espanhol básica: 000 000 000
      return value.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3").trim();
    }

    if (method === "Banco") {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (value.length > 24) value = value.slice(0, 24);
      
      // Máscara IBAN: ES00 0000 0000 0000 0000 0000
      return value.replace(/(.{4})/g, "$1 ").trim();
    }

    return value;
  }

  // 4. Restrição de caracteres e Máscaras no input
  const pixKeyInput = document.getElementById("pix-key-input");
  if (pixKeyInput) {
    pixKeyInput.addEventListener("input", function (ev) {
      const screenFive = document.getElementById("five");
      const selectedMethod = screenFive ? screenFive.getAttribute("data-method") : "Bizum";

      // Aplica formatação
      const formattedValue = formatBizumKey(this.value, selectedMethod);

      // Atualiza o valor apenas se mudou (evita loop ou problemas de cursor em alguns casos simples)
      if (this.value !== formattedValue) {
        this.value = formattedValue;
      }

      // Revalida o formulário
      checkBizumFormValidity();
    });
  }
})();

/* =========================
   Anima valor e controla active dos botões em #three
   Cole este bloco dentro do seu main.js, idealmente dentro de DOMContentLoaded
   ========================= */

(function () {
  // --- helper: formata número como moeda EUR ---
  function formatESL(value) {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  }

  // --- helper: converte "1239,00" -> number (1239.00) ---
  function parseESL(text) {
    if (!text) return 0;
    // remove tudo exceto dígitos e vírgula/ponto
    const cleaned = String(text)
      .replace(/\s/g, "")
      .replace(/[€$]/, "")
      .replace(/\./g, "") // remove separador de milhar
      .replace(/,/g, "."); // troca vírgula decimal para ponto
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  }

  // --- anima número de 0 até target (ou de start -> target) ---
  function animateNumberTo(el, targetNumber, duration = 1400, startNumber = 0) {
    if (!el) return;
    const start = performance.now();
    const end = start + duration;
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      // easeOutQuad
      const eased = 1 - (1 - t) * (1 - t);
      const current = startNumber + (targetNumber - startNumber) * eased;
      el.textContent = formatESL(current);
      if (now < end) {
        requestAnimationFrame(tick);
      } else {
        // garante valor final exato
        el.textContent = formatESL(targetNumber);
      }
    }
    requestAnimationFrame(tick);
  }

  // --- encontra o elemento do valor na section three ---
  function findAmountElement() {
    // tenta vários seletores comuns (ajuste se quiser)
    const selectors = [
      "#three .valor", // se existir
      "#three .popup-valor",
      "#three .amount",
      "#three .big-valor",
      "#three .valor-principal",
      "#three .saldo-valor",
      "#three .valor-total",
      "#three [data-amount-target]", // data attribute
      "#three .amount-target",
      "#three h1 .valor",
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    // fallback: busca qualquer texto de moeda dentro de #three
    const three = document.getElementById("three");
    if (!three) return null;
    // procura por nós que contenham "€"
    const nodes = three.querySelectorAll("*");
    for (const n of nodes) {
      if (n.children.length === 0 && /[€$]\s*\d/.test(n.textContent || "")) {
        return n;
      }
    }
    return null;
  }

  // --- gerencia botões da linha .botoes-row-sacar ---

  function initBotoesRowSacar() {
    const container =
      document.querySelector("#three .botoes-row-sacar") ||
      document.querySelector(".botoes-row-sacar");
    if (!container) return;

    const buttons = Array.from(
      container.querySelectorAll('button, [role="button"], a')
    );

    // incluir manualmente o botão display-total
    const displayTotal = document.querySelector(".display-total");
    if (displayTotal) buttons.push(displayTotal);

    const activeClass = "btn-active";
    const sacarBtn = document.querySelector(".btn-sacar-dois");

    // começa bloqueado
    // quando o botão sacar estiver ativo e for clicado
    if (sacarBtn) {
      sacarBtn.addEventListener("click", () => {
        // só abre se estiver liberado
        if (!sacarBtn.classList.contains("btn-sacar-indisponivel")) {
          if (typeof window.__spa_modal_helpers.showModal === "function") {
            window.__spa_modal_helpers.showModal("four");
          } else {
            showModal("four"); // fallback caso esteja no escopo
          }
        }
      });
    }

    function removeActive() {
      buttons.forEach((btn) => btn.classList.remove(activeClass));
    }

    // === LISTENER CORRETO (somente 1 vez) ===
    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        removeActive();
        btn.classList.add(activeClass);

        // liberar o botão SACAR imediatamente
        if (sacarBtn) {
          sacarBtn.classList.remove("btn-sacar-indisponivel");
          sacarBtn.removeAttribute("disabled");
          sacarBtn.style.pointerEvents = "auto";
          sacarBtn.style.opacity = "1";
        }
      });
    });

    // limpa o estado inicial
    removeActive();
  }

  // --- função principal a ser chamada quando #three for exibida ---
  function onShowThree() {
    // 1) animar valor - DESABILITADO: agora usamos animateCurrencyCounter unificada
    // A animação é feita diretamente no showScreen do router principal
    /*
    const amountEl = findAmountElement();
    if (amountEl) {
      // tenta ler target em data-target (ex: data-amount-target="1239.00")
      let target = null;
      if (amountEl.dataset && amountEl.dataset.amountTarget) {
        target = parseFloat(amountEl.dataset.amountTarget);
      }
      if (target === null || isNaN(target)) {
        target = parseESL(amountEl.textContent || amountEl.innerText);
      }
      // se não encontrou, ignore
      if (!isNaN(target) && target > 0) {
        // opcional: começar mostrando 0 formatado imediatamente
        amountEl.textContent = formatESL(0);
        animateNumberTo(amountEl, target, 1400, 0);
      }
    }
    */

    // 2) init botoes
    initBotoesRowSacar();
  }

  // --- Hook: se seu router expõe showScreen, intercepta chamadas para 'three' ---
  // Se showScreen for global (como no main.js que usamos), monkey-patch para rodar onShowThree sempre que #three for mostrado.
  if (window.showScreen && typeof window.showScreen === "function") {
    const originalShowScreen = window.showScreen;
    window.showScreen = function (id, push) {
      originalShowScreen(id, push);
      if (String(id) === "three") {
        // pequeno timeout para dar tempo ao DOM ser mostrado/estilos aplicados
        setTimeout(onShowThree, 30);
      }
    };
  } else {
    // fallback: quando DOMContentLoaded e se já estiver em #three, executa
    document.addEventListener("DOMContentLoaded", () => {
      if (location.hash.replace("#", "") === "three") {
        setTimeout(onShowThree, 30);
      }
    });
  }

  // também expõe manualmente para caso queira disparar por console:
  window.__spa_helpers = window.__spa_helpers || {};
  window.__spa_helpers.onShowThree = onShowThree;
})();

// DESABILITADO: Agora usamos a função unificada animateCurrencyCounter
// que é chamada diretamente no showScreen do router principal
/*
// === Count-up robusto para #three (usa data-amount-target) ===
(function () {
  // evita múltiplas execuções
  let threeAnimated = false;

  function formatESL(value) {
    return value.toLocaleString("es-ES", {
      style: "currency",
      currency: "EUR",
    });
  }

  function animateCountUp(el, target, duration = 1400) {
    if (!el) return;
    const start = performance.now();
    const from = 0;
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - t) * (1 - t); // easeOutQuad
      const current = from + (target - from) * eased;
      el.textContent = formatESL(current);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = formatESL(target);
    }
    requestAnimationFrame(step);
  }

  function startCountUpThree() {
    // se já animou e você não quer repetir, pare aqui
    if (threeAnimated) return;
    const el = document.querySelector("#three [data-amount-target]");
    if (!el) return;
    const raw = el.getAttribute("data-amount-target");
    const target = parseFloat(raw);
    if (isNaN(target)) return;
    // mostra zero imediatamente e anima
    el.textContent = formatESL(0);
    // pequeno timeout para garantir estilos aplicados / repaint
    setTimeout(() => animateCountUp(el, target, 1400), 30);
    threeAnimated = true;
  }

  // 1) Hook no showScreen (se existir)
  if (window.showScreen && typeof window.showScreen === "function") {
    const orig = window.showScreen;
    window.showScreen = function (id, push) {
      orig(id, push);
      if (String(id) === "three") {
        // reseta flag se quiser re-animar cada vez -> threeAnimated = false;
        startCountUpThree();
      }
    };
  }

  // 2) MutationObserver no próprio #three para detectar classes (fallback)
  const threeEl = document.getElementById("three");
  if (threeEl) {
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "attributes" && r.attributeName === "class") {
          if (threeEl.classList.contains("is-active")) {
            startCountUpThree();
            break;
          }
        }
      }
    });
    mo.observe(threeEl, { attributes: true, attributeOldValue: true });
  }

  // 3) Caso já esteja ativa no carregamento (ex.: #three no hash), dispara agora
  document.addEventListener("DOMContentLoaded", () => {
    const threeNow = document.getElementById("three");
    if (threeNow && threeNow.classList.contains("is-active")) {
      // aguarda um tick para garantir render
      setTimeout(startCountUpThree, 20);
    }
  });

  // opcional: expor função para forçar re-execução via console
  window.__countup_helpers = window.__countup_helpers || {};
  window.__countup_helpers.startCountUpThree = function (force) {
    if (force) threeAnimated = false;
    startCountUpThree();
  };
})();
*/

// apaga akiiiiiiiiiiiiiiiii

/* ===== Count-up definitivo para o span em #three ===== */
(function () {
  const SEL = "#three .valor-currency-dois[data-amount-target]";

  function formatESL(value) {
    return value.toLocaleString("es-ES", {
      style: "currency",
      currency: "EUR",
    });
  }

  function animateCountUpEl(el, target, duration = 1400) {
    if (!el) return;
    const startVal = 0;
    const startTime = performance.now();
    function step(now) {
      const t = Math.min(1, (now - startTime) / duration);
      const eased = 1 - (1 - t) * (1 - t); // easeOutQuad
      const current = startVal + (target - startVal) * eased;
      el.textContent = formatESL(current);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = formatESL(target); // garante valor final exato
    }
    requestAnimationFrame(step);
  }

  function triggerCountUp() {
    const el = document.querySelector(SEL);
    if (!el) return;
    const raw = el.getAttribute("data-amount-target");
    const target = parseFloat(raw);
    if (isNaN(target)) return;
    // zera e anima
    el.textContent = formatESL(0);
    // timeout pequeno para garantir repaint antes da animação
    setTimeout(() => animateCountUpEl(el, target, 1400), 20);
  }

  // DESABILITADO: Agora usamos a função unificada animateCurrencyCounter
  // que é chamada diretamente no showScreen do router principal
  /*
  // 1) Hook no showScreen (se existir) — re-anima sempre que for para #three
  if (window.showScreen && typeof window.showScreen === "function") {
    const orig = window.showScreen;
    window.showScreen = function (id, push) {
      orig(id, push);
      if (String(id) === "three") {
        // força re-animação a cada entrada
        triggerCountUp();
      }
    };
  }

  // 2) MutationObserver no próprio #three (fallback para outros fluxos)
  const threeEl = document.getElementById("three");
  if (threeEl) {
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        if (r.type === "attributes" && r.attributeName === "class") {
          if (threeEl.classList.contains("is-active")) triggerCountUp();
        }
      }
    });
    mo.observe(threeEl, { attributes: true });
  }
  */

  // 3) Se já estiver ativa no carregamento (ex.: hash = #three), dispara agora
  document.addEventListener("DOMContentLoaded", () => {
    const threeNow = document.getElementById("three");
    if (threeNow && threeNow.classList.contains("is-active")) {
      setTimeout(triggerCountUp, 20);
    }
  });
    
  // expõe helper para testar no console: window.__countup.trigger(true)
  window.__countup = window.__countup || {};
  window.__countup.trigger = function (force) {
    if (force) {
      // força zerar e re-rodar
      const el = document.querySelector(SEL);
      if (el) el.textContent = formatESL(0);
    }
    triggerCountUp();
  };
})();

// apaga abaixo

document.addEventListener("DOMContentLoaded", function () {
  // Garante que o SPA já inicializou o router
  setTimeout(() => {
    if (window.showScreen) {
      const originalShowScreen = window.showScreen;

      window.showScreen = function (id, push) {
        originalShowScreen(id, push);

        if (id === "three") {
          setTimeout(() => {
            if (window.__spa_helpers && window.__spa_helpers.onShowThree) {
              window.__spa_helpers.onShowThree();
            }
          }, 30);
        }
      };
    }
  }, 100);
});
