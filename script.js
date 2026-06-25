/* ============================================
   JIVANA JYOTI — MAIN JAVASCRIPT
   Navbar | Carousel | Stats Counter | Form
   ============================================ */

'use strict';

/* ---- GLOBAL SELECTORS ---- */
const navbar       = document.getElementById('navbar');
const hamburger    = document.getElementById('hamburger');
const navLinks     = document.getElementById('nav-links');
const backToTopBtn = document.getElementById('backToTop'); 

/* ---- NAVBAR: Scroll effect (Optimized) ---- */
let isScrolling = false;

window.addEventListener('scroll', () => {
  if (!isScrolling) {
    window.requestAnimationFrame(() => {
      navbar.classList.toggle('scrolled', window.scrollY > 30);
      backToTopBtn.classList.toggle('visible', window.scrollY > 400);
      isScrolling = false;
    });
    isScrolling = true;
  }
}, { passive: true });

/* ---- NAVBAR: Hamburger toggle ---- */
hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open', isOpen);
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close mobile menu when a link is clicked
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

/* ---- DROPDOWN MENU ---- */
const dropdown     = document.querySelector('.dropdown');
const dropToggle   = dropdown.querySelector('.dropdown-toggle');
const dropMenu     = dropdown.querySelector('.dropdown-menu');

dropToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = dropMenu.classList.toggle('open');
  dropToggle.setAttribute('aria-expanded', isOpen);
});

// Close dropdown when clicking outside
document.addEventListener('click', () => {
  dropMenu.classList.remove('open');
  dropToggle.setAttribute('aria-expanded', 'false');
});

// Keyboard navigation for dropdown
dropToggle.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    dropMenu.classList.remove('open');
    dropToggle.setAttribute('aria-expanded', 'false');
    dropToggle.focus();
  }
});

/* ---- ACTIVE NAV LINK on scroll ---- */
const sections    = document.querySelectorAll('section[id]');
const navAnchors  = document.querySelectorAll('.nav-link[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navAnchors.forEach(a => a.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(sec => sectionObserver.observe(sec));

/* ============================================
   IMAGE CAROUSEL (DRAG TO SWIPE)
   ============================================ */
const track    = document.getElementById('carouselTrack');
const dots     = document.querySelectorAll('.dot');
const prevBtn  = document.getElementById('prevBtn');
const nextBtn  = document.getElementById('nextBtn');

let currentSlide = 0;
const totalSlides = track.children.length;
let autoSlideTimer;
const AUTO_INTERVAL = 5000; // 5 seconds

// Allow vertical scrolling, but trap horizontal for JS swipe
track.style.touchAction = 'pan-y';

/** Move to a specific slide */
function goToSlide(index) {
  // Wrap around
  if (index < 0) index = totalSlides - 1;
  if (index >= totalSlides) index = 0;

  currentSlide = index;
  
  // Ensure smooth transition is applied when snapping to a slide
  track.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
  track.style.transform = `translateX(-${currentSlide * 100}%)`;

  // Update dots
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === currentSlide);
    dot.setAttribute('aria-selected', i === currentSlide);
  });
}

/** Start auto-slide */
function startAutoSlide() {
  clearInterval(autoSlideTimer);
  autoSlideTimer = setInterval(() => goToSlide(currentSlide + 1), AUTO_INTERVAL);
}

/** Restart timer after manual navigation */
function restartTimer() {
  clearInterval(autoSlideTimer);
  startAutoSlide();
}

prevBtn.addEventListener('click', () => { goToSlide(currentSlide - 1); restartTimer(); });
nextBtn.addEventListener('click', () => { goToSlide(currentSlide + 1); restartTimer(); });

// Dot navigation
dots.forEach((dot, i) => {
  dot.addEventListener('click', () => { goToSlide(i); restartTimer(); });
});

// Keyboard support for carousel
document.addEventListener('keydown', (e) => {
  const carouselSection = document.getElementById('home'); 
  if (!carouselSection) return;
  const rect = carouselSection.getBoundingClientRect();
  const inView = rect.top < window.innerHeight && rect.bottom > 0;
  if (!inView) return;

  if (e.key === 'ArrowLeft')  { goToSlide(currentSlide - 1); restartTimer(); }
  if (e.key === 'ArrowRight') { goToSlide(currentSlide + 1); restartTimer(); }
});

// Pause on hover
track.parentElement.addEventListener('mouseenter', () => clearInterval(autoSlideTimer));
track.parentElement.addEventListener('mouseleave', startAutoSlide);

/* --- DRAG LOGIC --- */
let isDragging = false;
let startX = 0;
let currentX = 0;

function getPositionX(e) {
  return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
}

function touchStart(e) {
  isDragging = true;
  startX = getPositionX(e);
  currentX = startX; // Reset currentX to prevent accidental jumps
  clearInterval(autoSlideTimer);
  
  // Remove CSS transition so the image perfectly follows the finger
  track.style.transition = 'none';
  // Change cursor for desktop users
  track.style.cursor = 'grabbing';
}

function touchMove(e) {
  if (!isDragging) return;
  currentX = getPositionX(e);
  const diffX = currentX - startX;
  
  // Mix percentage (base slide position) with pixels (finger drag distance)
  track.style.transform = `translateX(calc(-${currentSlide * 100}% + ${diffX}px))`;
}

function touchEnd(e) {
  if (!isDragging) return;
  isDragging = false;
  track.style.cursor = 'pointer';
  
  const diffX = currentX - startX;
  const threshold = 75; // Number of pixels needed to trigger a slide change
  
  if (diffX < -threshold) {
    goToSlide(currentSlide + 1); // Swiped left enough
  } else if (diffX > threshold) {
    goToSlide(currentSlide - 1); // Swiped right enough
  } else {
    goToSlide(currentSlide); // Not swiped far enough, snap back to origin
  }
  
  restartTimer();
}

// Touch events for mobile
track.addEventListener('touchstart', touchStart, { passive: true });
track.addEventListener('touchmove', touchMove, { passive: true });
track.addEventListener('touchend', touchEnd);
track.addEventListener('touchcancel', touchEnd);

// Mouse events for desktop
track.addEventListener('mousedown', touchStart);
track.addEventListener('mousemove', touchMove);
track.addEventListener('mouseup', touchEnd);
track.addEventListener('mouseleave', touchEnd);

// Initialize carousel DOM without starting the auto-timer yet
goToSlide(0);

const introVideo = document.getElementById('introVideo');
const introContainer = document.getElementById('introVideoContainer');

function skipIntroAndStartCarousel() {
  if (!introContainer) return;
  // Trigger CSS fade out
  introContainer.classList.add('fade-out');
  
  // Wait for the CSS transition to finish, then remove from DOM flow and start carousel
  setTimeout(() => {
    introContainer.style.display = 'none';
    startAutoSlide();
  }, 800); 
}

if (introVideo && introContainer) {
  // Attempt to play the video. Catch browser autoplay restrictions to prevent freezing.
  const playPromise = introVideo.play();
  
  if (playPromise !== undefined) {
    playPromise.catch(error => {
      console.warn("Autoplay blocked by browser. Skipping intro.", error);
      skipIntroAndStartCarousel();
    });
  }

  // When the video finishes naturally, fade out and start the carousel
  introVideo.addEventListener('ended', skipIntroAndStartCarousel);
} else {
  // Fallback just in case the video elements are ever removed from the HTML
  startAutoSlide();
}

/* ============================================
   ANIMATED STATS COUNTER
   ============================================ */
const statNumbers = document.querySelectorAll('.stat-number[data-target]');

function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000; // ms
  const step = target / (duration / 16); // ~60fps
  let current = 0;

  const timer = setInterval(() => {
    current += step;
    if (current >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(current);
    }
  }, 16);
}

// Trigger when stats bar enters viewport
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      statNumbers.forEach(animateCounter);
      statsObserver.disconnect(); // Run only once
    }
  });
}, { threshold: 0.5 });

const statsBar = document.querySelector('.stats-bar');
if (statsBar) statsObserver.observe(statsBar);

/* ============================================
   SCROLL REVEAL ANIMATIONS
   ============================================ */
const revealElements = document.querySelectorAll(
  '.program-card, .achievement-card, .testimonial-card, .about-grid, .contact-grid'
);

// Add initial hidden state via JS (graceful degradation)
revealElements.forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      // Stagger children slightly
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, 80 * (Array.from(revealElements).indexOf(entry.target) % 6));
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealElements.forEach(el => revealObserver.observe(el));

/* ============================================
   CONTACT FORM — Validation + Success
   ============================================ */
const contactForm   = document.getElementById('contactForm');
const formSuccess   = document.getElementById('formSuccess');

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Simple client-side validation
  const fullName = contactForm.fullName.value.trim();
  const email    = contactForm.email.value.trim();
  const subject  = contactForm.subject.value;
  const message  = contactForm.message.value.trim();

  // Subject is always selected because of our new default structure, but checking anyway
  if (!email) {
    alert('Please fill in required fields.');
    return;
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    alert('Please enter a valid email address.');
    contactForm.email.focus();
    return;
  }

  // Simulate successful submission
  formSuccess.hidden = false;
  formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  contactForm.reset();

  // Hide success message after 6 seconds
  setTimeout(() => { formSuccess.hidden = true; }, 6000);
});

/* ============================================
   BACK TO TOP BUTTON
   ============================================ */
backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ============================================
   SMOOTH SCROLLING for anchor links
   ============================================ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();
    const navHeight = navbar.offsetHeight;
    const targetTop  = target.getBoundingClientRect().top + window.scrollY - navHeight - 10;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
});

/* ============================================
   KEYBOARD TRAP PREVENTION for mobile menu
   ============================================ */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    // Check if dropdown is open first
    if (dropMenu.classList.contains('open')) {
      dropMenu.classList.remove('open');
      dropToggle.setAttribute('aria-expanded', 'false');
      dropToggle.focus();
    } else {
      // Otherwise close the main mobile menu
      navLinks.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.focus();
    }
  }
});