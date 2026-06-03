document.addEventListener('DOMContentLoaded', () => {
  // --- STATIC AND NAVIGATION STATE ---
  const header = document.querySelector('header');
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const scrollTopBtn = document.querySelector('.float-scroll-top');
  
  // --- STICKY NAV & SCROLL TOP BUTTON ---
  window.addEventListener('scroll', () => {
    // Header class change
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // Scroll-to-top button visibility
    if (window.scrollY > 500) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }

    // ScrollSpy active link highlighting
    highlightNavLink();
  });

  // Highlight navigation link matching current viewport section
  function highlightNavLink() {
    let currentSectionId = '';
    const sections = document.querySelectorAll('section, header');
    const scrollPosition = window.scrollY + 150; // offset for sticky navbar
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id') || '';
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      const href = link.getAttribute('href');
      if (href === `#${currentSectionId}` || (href === '#' && currentSectionId === 'home')) {
        link.classList.add('active');
      }
    });
  }

  // --- MOBILE MENUS ---
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Close mobile menu when nav link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Scroll to top action
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });


  // --- SERVICES ACCORDION / TABS ---
  const serviceTabBtns = document.querySelectorAll('.service-tab-btn');
  const servicePanes = document.querySelectorAll('.services-pane');

  serviceTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetCategory = btn.getAttribute('data-target');

      // Update tab active state
      serviceTabBtns.forEach(t => t.classList.remove('active'));
      btn.classList.add('active');

      // Update panes visibility
      servicePanes.forEach(pane => {
        pane.classList.remove('active');
        if (pane.getAttribute('id') === targetCategory) {
          // Trigger a clean animation re-run
          pane.style.opacity = '0';
          pane.classList.add('active');
          setTimeout(() => {
            pane.style.opacity = '1';
          }, 50);
        }
      });
    });
  });


  // --- TESTIMONIALS SLIDER ---
  const slider = document.querySelector('.testimonials-slider');
  const slides = document.querySelectorAll('.testimonial-slide');
  const prevBtn = document.querySelector('.slider-btn-prev');
  const nextBtn = document.querySelector('.slider-btn-next');
  const dotsContainer = document.querySelector('.slider-dots');
  
  let currentSlide = 0;
  const slideCount = slides.length;
  let autoplayInterval;

  // Create pagination dots
  if (dotsContainer && slideCount > 0) {
    for (let i = 0; i < slideCount; i++) {
      const dot = document.createElement('div');
      dot.classList.add('slider-dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => {
        goToSlide(i);
        resetAutoplay();
      });
      dotsContainer.appendChild(dot);
    }
  }

  const dots = document.querySelectorAll('.slider-dot');

  function updateSlider() {
    slider.style.transform = `translateX(-${currentSlide * 100}%)`;
    
    // Update dots
    dots.forEach((dot, index) => {
      if (index === currentSlide) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });
  }

  function goToSlide(index) {
    currentSlide = index;
    updateSlider();
  }

  function nextSlide() {
    currentSlide = (currentSlide + 1) % slideCount;
    updateSlider();
  }

  function prevSlide() {
    currentSlide = (currentSlide - 1 + slideCount) % slideCount;
    updateSlider();
  }

  if (nextBtn && prevBtn) {
    nextBtn.addEventListener('click', () => {
      nextSlide();
      resetAutoplay();
    });

    prevBtn.addEventListener('click', () => {
      prevSlide();
      resetAutoplay();
    });
  }

  // Autoplay function
  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 6000);
  }

  function resetAutoplay() {
    clearInterval(autoplayInterval);
    startAutoplay();
  }

  if (slideCount > 0) {
    startAutoplay();
  }


  // --- BOOKING MODAL CONTROL ---
  const modal = document.getElementById('bookingModal');
  const modalClose = document.querySelector('.modal-close');
  const bookBtns = document.querySelectorAll('[data-action="book"]');
  const bookingForm = document.getElementById('modalBookingForm');
  const formState = document.getElementById('modalFormState');
  const successState = document.getElementById('modalSuccessState');
  const selectService = document.getElementById('bookingService');

  // Open modal
  bookBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Check if button belongs to a specific deal and pre-select it
      const targetPackage = btn.getAttribute('data-package');
      if (targetPackage && selectService) {
        selectService.value = targetPackage;
      } else if (selectService) {
        selectService.selectedIndex = 0; // Reset to default "Select Service"
      }
      
      openModal();
    });
  });

  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Lock background scrolling
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto'; // Restore background scrolling
    
    // Reset modal states after closing transition
    setTimeout(() => {
      formState.style.display = 'block';
      successState.style.display = 'none';
      bookingForm.reset();
    }, 300);
  }

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  // Close modal when clicking on overlay
  const modalOverlay = document.querySelector('.modal-overlay');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', closeModal);
  }

  // Escape key closes modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });


  // --- FORM SUBMISSIONS (MODAL BOOKING & PAGE CONTACT) ---

  // Handle modal booking submission
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Simple premium visual feedback (spinning/loading state)
      const submitBtn = bookingForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

      // Simulate API/server latency
      setTimeout(() => {
        // Collect inputs for elegant success personalization (optional)
        const clientName = document.getElementById('bookingName').value;
        const selectedPackageText = selectService.options[selectService.selectedIndex].text;
        
        // Update success text
        const successTitle = successState.querySelector('h4');
        const successText = successState.querySelector('p');
        
        successTitle.textContent = `Boht Shukriya, ${clientName}!`;
        successText.textContent = `Aapka "${selectedPackageText}" ka appointment hamein mil gaya hai. Hum jald hi call ya SMS ke zariye rabta karenge.`;

        // Switch states
        formState.style.display = 'none';
        successState.style.display = 'block';
        
        // Reset submit button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
      }, 1500);
    });
  }

  // Handle on-page Contact Form submission
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Bhej rahe hain...';

      setTimeout(() => {
        // Form Validation & Success State
        const nameVal = document.getElementById('contactName').value;
        
        // Create an elegant floating success alert/toast
        const toast = document.createElement('div');
        toast.className = 'toast-alert';
        toast.innerHTML = `
          <div class="toast-content" style="
            position: fixed;
            bottom: 2.5rem;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background-color: var(--secondary-accent);
            color: var(--white);
            padding: 1.25rem 2.5rem;
            border-radius: var(--border-radius-full);
            box-shadow: var(--shadow-lg);
            z-index: 2100;
            display: flex;
            align-items: center;
            gap: 1rem;
            border: 1px solid var(--gold-accent);
            transition: all var(--transition-normal);
            opacity: 0;
            font-family: var(--font-sans);
          ">
            <i class="fas fa-check-circle" style="color: var(--gold-accent); font-size: 1.3rem;"></i>
            <span>Boht Shukriya, ${nameVal}! Aapka paigham bhej diya gaya hai. Hum jald rabta karenge.</span>
          </div>
        `;
        
        document.body.appendChild(toast);
        const toastEl = toast.querySelector('.toast-content');

        // Animate toast entrance
        setTimeout(() => {
          toastEl.style.opacity = '1';
          toastEl.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);

        // Animate toast exit and clean up
        setTimeout(() => {
          toastEl.style.opacity = '0';
          toastEl.style.transform = 'translateX(-50%) translateY(100px)';
          setTimeout(() => {
            document.body.removeChild(toast);
          }, 300);
        }, 5000);

        // Reset submit button & form
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        contactForm.reset();
      }, 1200);
    });
  }
});
