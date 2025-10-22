// Enhanced UI Features: Theme Toggle, Particles, Scroll Reveals
(function() {
  'use strict';

  // Global Theme System
  function initThemeToggle() {
    // Apply saved theme immediately on page load
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) {
      // If no toggle button, just apply the saved theme
      return;
    }
    
    const themeIcon = themeToggle.querySelector('.theme-icon');
    if (!themeIcon) return;
    
    // Update icon based on current theme
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', function() {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      // Apply theme globally
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      updateThemeIcon(newTheme);
      
      // Add smooth transition effect
      document.body.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
      setTimeout(() => {
        document.body.style.transition = '';
      }, 400);
      
      // Trigger custom event for other components
      window.dispatchEvent(new CustomEvent('themeChanged', { 
        detail: { theme: newTheme } 
      }));
    });
    
    function updateThemeIcon(theme) {
      themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
      themeIcon.setAttribute('aria-label', theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    }
  }

  // Initialize theme immediately (before DOM ready)
  function initThemeEarly() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  // Floating Particles
  function initParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = window.innerWidth > 768 ? 50 : 20;
    
    function createParticle() {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // Random starting position
      particle.style.left = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 8 + 's';
      particle.style.animationDuration = (8 + Math.random() * 4) + 's';
      
      // Random colors
      const colors = ['var(--neon)', 'var(--accent)', 'var(--purple)', 'var(--green)'];
      particle.style.background = colors[Math.floor(Math.random() * colors.length)];
      
      particlesContainer.appendChild(particle);
      
      // Remove particle after animation
      setTimeout(() => {
        if (particle.parentNode) {
          particle.parentNode.removeChild(particle);
        }
      }, 12000);
    }
    
    // Create initial particles
    for (let i = 0; i < particleCount; i++) {
      setTimeout(createParticle, i * 200);
    }
    
    // Continue creating particles
    setInterval(createParticle, 800);
  }

  // Scroll Reveal Animations
  function initScrollReveal() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, observerOptions);
    
    // Add reveal classes to elements
    const sections = document.querySelectorAll('.section');
    const cards = document.querySelectorAll('.card');
    const stats = document.querySelectorAll('.stats div');
    
    sections.forEach((section, index) => {
      section.classList.add('reveal');
      observer.observe(section);
    });
    
    cards.forEach((card, index) => {
      card.classList.add(index % 2 === 0 ? 'reveal-left' : 'reveal-right');
      observer.observe(card);
    });
    
    stats.forEach((stat, index) => {
      stat.classList.add('reveal');
      stat.style.animationDelay = (index * 0.2) + 's';
      observer.observe(stat);
    });
  }

  // Enhanced Menu Toggle
  function initMenuToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    const menu = document.querySelector('.menu');
    
    menuToggle.addEventListener('click', function() {
      const isOpen = menu.classList.contains('open');
      menu.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', !isOpen);
      
      // Animate hamburger
      menuToggle.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
      if (!menu.contains(e.target) && !menuToggle.contains(e.target)) {
        menu.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.classList.remove('active');
      }
    });
  }

  // Smooth Scroll for Anchor Links
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  // Performance Optimization
  function initPerformanceOptimizations() {
    // Reduce animations on low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
      document.body.classList.add('reduced-motion');
    }
    
    // Pause animations when tab is not visible
    document.addEventListener('visibilitychange', function() {
      if (document.hidden) {
        document.body.classList.add('paused');
      } else {
        document.body.classList.remove('paused');
      }
    });
  }

  // Scroll Indicator
  function initScrollIndicator() {
    const scrollIndicator = document.getElementById('scrollIndicator');
    if (!scrollIndicator) return;
    
    function updateScrollIndicator() {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollProgress = Math.min(scrollTop / scrollHeight, 1);
      
      scrollIndicator.style.transform = `scaleX(${scrollProgress})`;
    }
    
    // Throttle scroll events
    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          updateScrollIndicator();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // Dynamic Background Colors
  function initDynamicBackground() {
    let scrollY = 0;
    
    function updateBackground() {
      scrollY = window.pageYOffset;
      const progress = Math.min(scrollY / (document.body.scrollHeight - window.innerHeight), 1);
      
      // Change background gradient based on scroll
      const hue1 = 280 + (progress * 60); // Purple to blue
      const hue2 = 200 + (progress * 40); // Cyan variations
      
      document.documentElement.style.setProperty(
        '--dynamic-bg', 
        `hsl(${hue1}, 70%, 15%)`
      );
    }
    
    // Throttle scroll events
    let ticking = false;
    window.addEventListener('scroll', function() {
      if (!ticking) {
        requestAnimationFrame(function() {
          updateBackground();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  // Initialize all features
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }
    
    try {
      initThemeToggle();
      initMenuToggle();
      initSmoothScroll();
      initScrollReveal();
      initScrollIndicator();
      initPerformanceOptimizations();
      initDynamicBackground();
      
      // Only init particles on larger screens for performance
      if (window.innerWidth > 768) {
        initParticles();
      }
      
      console.log('Enhanced UI initialized successfully');
    } catch (error) {
      console.error('Error initializing Enhanced UI:', error);
    }
  }

  // Apply theme immediately (even before DOM is ready)
  initThemeEarly();

  // Start initialization
  init();
})();
