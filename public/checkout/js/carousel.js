/**
 * Carousel Instance Manager
 * Handles carousel initialization, height calculation, drag functionality, and autoplay
 */
class CarouselInstance {
    constructor(element) {
        this.element = element;
        this.track = element.querySelector('.glide__track');
        this.slidesList = this.track.querySelector('.glide__slides');
        this.originalSlides = Array.from(this.track.querySelectorAll('.glide__slide'));
        this.currentIndex = 0;
        this.isDragging = false;
        this.startX = 0;
        this.autoplayInterval = null;
        this.isTransitioning = false;
        
        // Bind methods para poder remover event listeners depois
        this.boundHandleDragStart = this.handleDragStart.bind(this);
        this.boundHandleDragMove = this.handleDragMove.bind(this);
        this.boundHandleDragEnd = this.handleDragEnd.bind(this);
        this.boundPauseAutoplay = this.pauseAutoplay.bind(this);
        this.boundResumeAutoplay = this.resumeAutoplay.bind(this);
        this.boundCalculateHeight = this.calculateHeight.bind(this);
        this.boundHandleTransitionEnd = this.handleTransitionEnd.bind(this);
        
        // Clone slides para efeito infinito
        this.cloneSlides();
        this.slides = Array.from(this.track.querySelectorAll('.glide__slide'));
        this.realSlidesCount = this.originalSlides.length;
        
        this.init();
    }
    
    cloneSlides() {
        // Clonar os slides originais e adicionar no início e no fim
        const firstClone = this.originalSlides[0].cloneNode(true);
        const lastClone = this.originalSlides[this.originalSlides.length - 1].cloneNode(true);
        
        // Adicionar clone do último slide no início
        this.slidesList.insertBefore(lastClone, this.slidesList.firstChild);
        
        // Adicionar clone do primeiro slide no fim
        this.slidesList.appendChild(firstClone);
        
        // Iniciar no primeiro slide real (índice 1, pois temos um clone antes)
        this.currentIndex = 1;
    }
    
    init() {
        // Calculate height first
        this.calculateHeight();
        
        // Posicionar no primeiro slide real sem animação
        this.updateSlidePosition(false);
        
        // Initialize drag functionality (mouse)
        this.track.addEventListener('mousedown', this.boundHandleDragStart);
        document.addEventListener('mousemove', this.boundHandleDragMove);
        document.addEventListener('mouseup', this.boundHandleDragEnd);
        
        // Initialize drag functionality (touch)
        this.track.addEventListener('touchstart', this.boundHandleDragStart, { passive: true });
        document.addEventListener('touchmove', this.boundHandleDragMove, { passive: true });
        document.addEventListener('touchend', this.boundHandleDragEnd);
        
        // Initialize hover pause/resume
        this.element.addEventListener('mouseenter', this.boundPauseAutoplay);
        this.element.addEventListener('mouseleave', this.boundResumeAutoplay);
        
        // Initialize resize handler
        window.addEventListener('resize', this.boundCalculateHeight);
        
        // Listen for transition end to handle infinite loop
        this.slidesList.addEventListener('transitionend', this.boundHandleTransitionEnd);
        
        // Start autoplay
        this.startAutoplay();
    }
    
    calculateHeight() {
        if (this.slides.length === 0) return;
        
        // Remove altura fixa - deixa o conteúdo determinar a altura
        // Apenas garante que os elementos estejam visíveis
        this.slides.forEach(slide => {
            const content = slide.querySelector('div');
            if (content) {
                content.style.visibility = 'visible';
                content.style.opacity = '1';
                content.style.display = 'flex';
            }
        });
    }
    
    handleDragStart(e) {
        this.isDragging = true;
        this.startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        this.startY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
        this.currentX = this.startX;
        
        // Prevenir seleção de texto
        if (e.type === 'mousedown') {
            e.preventDefault();
        }
        
        // Pausar autoplay durante o drag
        this.pauseAutoplay();
    }
    
    handleDragMove(e) {
        if (!this.isDragging) return;
        
        this.currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const currentY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
        
        // Calcular a diferença
        const diffX = this.currentX - this.startX;
        const diffY = currentY - this.startY;
        
        // Se o movimento horizontal for maior que o vertical, prevenir scroll
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (e.cancelable) {
                e.preventDefault();
            }
        }
    }
    
    handleDragEnd(e) {
        if (!this.isDragging) return;
        
        this.isDragging = false;
        const diffX = this.currentX - this.startX;
        
        // Threshold de 50px para considerar um swipe
        if (Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe para direita - slide anterior
                this.previousSlide();
            } else {
                // Swipe para esquerda - próximo slide
                this.nextSlide();
            }
        }
        
        // Retomar autoplay após o drag
        this.resumeAutoplay();
    }
    
    nextSlide() {
        if (this.isTransitioning || !this.track) return;
        this.isTransitioning = true;
        this.currentIndex++;
        this.updateSlidePosition(true);
    }
    
    previousSlide() {
        if (this.isTransitioning || !this.track) return;
        this.isTransitioning = true;
        this.currentIndex--;
        this.updateSlidePosition(true);
    }
    
    handleTransitionEnd() {
        if (!this.slides) return;
        this.isTransitioning = false;
        
        // Se chegou no clone do primeiro slide (último índice)
        if (this.currentIndex === this.slides.length - 1) {
            this.currentIndex = 1; // Voltar para o primeiro slide real
            this.updateSlidePosition(false); // Sem animação
        }
        
        // Se chegou no clone do último slide (índice 0)
        if (this.currentIndex === 0) {
            this.currentIndex = this.slides.length - 2; // Ir para o último slide real
            this.updateSlidePosition(false); // Sem animação
        }
    }
    
    updateSlidePosition(animate = true) {
        if (!this.track || !this.slidesList || !this.slides) return;
        
        // Calcular o offset baseado na largura real do slide + gap
        const trackWidth = this.track.offsetWidth;
        const slideWidth = trackWidth - 40; // Largura do slide (100% - 40px)
        const gap = 10; // Gap entre slides
        const totalSlideWidth = slideWidth + gap; // Largura total incluindo gap
        
        // Calcular offset em pixels e converter para porcentagem
        const offsetPx = this.currentIndex * totalSlideWidth;
        const offsetPercent = (offsetPx / trackWidth) * 100;
        
        // Aplicar ou remover transição
        if (animate) {
            this.slidesList.style.setProperty('transition', 'transform 0.5s ease-in-out', 'important');
        } else {
            this.slidesList.style.setProperty('transition', 'none', 'important');
        }
        
        // CRITICAL: Force transform with maximum specificity
        this.slidesList.style.setProperty('transform', `translateX(-${offsetPercent}%)`, 'important');
        
        // Also set webkit transform for compatibility
        this.slidesList.style.setProperty('-webkit-transform', `translateX(-${offsetPercent}%)`, 'important');
        
        // Ensure all slides are visible and properly positioned
        this.slides.forEach((slide) => {
            slide.style.visibility = 'visible';
            slide.style.opacity = '1';
            slide.style.display = 'block';
            
            // Ensure slide content is visible
            const content = slide.querySelector('div');
            if (content) {
                content.style.visibility = 'visible';
                content.style.opacity = '1';
                content.style.display = 'flex';
            }
        });
        
        // Force a reflow
        void this.slidesList.offsetWidth;
    }
    
    startAutoplay() {
        this.autoplayInterval = setInterval(() => {
            this.nextSlide();
        }, 5000);
    }
    
    pauseAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
            this.autoplayInterval = null;
        }
    }
    
    resumeAutoplay() {
        if (!this.autoplayInterval) {
            this.startAutoplay();
        }
    }
    
    destroy() {
        // Parar autoplay
        this.pauseAutoplay();
        
        // Remover event listeners usando as referências bound
        if (this.track) {
            this.track.removeEventListener('mousedown', this.boundHandleDragStart);
            this.track.removeEventListener('touchstart', this.boundHandleDragStart);
        }
        
        document.removeEventListener('mousemove', this.boundHandleDragMove);
        document.removeEventListener('mouseup', this.boundHandleDragEnd);
        document.removeEventListener('touchmove', this.boundHandleDragMove);
        document.removeEventListener('touchend', this.boundHandleDragEnd);
        
        if (this.element) {
            this.element.removeEventListener('mouseenter', this.boundPauseAutoplay);
            this.element.removeEventListener('mouseleave', this.boundResumeAutoplay);
        }
        
        window.removeEventListener('resize', this.boundCalculateHeight);
        
        if (this.slidesList) {
            this.slidesList.removeEventListener('transitionend', this.boundHandleTransitionEnd);
        }
        
        // Limpar referências
        this.element = null;
        this.track = null;
        this.slidesList = null;
        this.slides = null;
        this.originalSlides = null;
    }
}

// Store carousel instances globally
window.carouselInstances = window.carouselInstances || [];

// Initialize all carousels on page load
document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.glide');
    carousels.forEach(carousel => {
        const instance = new CarouselInstance(carousel);
        window.carouselInstances.push(instance);
    });
});
