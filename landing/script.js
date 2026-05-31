/* RentalHub — script.js | Clean rebuild */
document.addEventListener('DOMContentLoaded', () => {

  // ===== NAVBAR =====
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Hamburger menu
  const hamburger = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;
  hamburger?.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('open', menuOpen);
    hamburger.setAttribute('aria-expanded', menuOpen);
  });
  // Close menu on link click
  document.querySelectorAll('.mm-link').forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      mobileMenu.classList.remove('open');
    });
  });

  // ===== SMOOTH SCROLL =====
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ===== SCROLL REVEAL =====
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Animate bar fills inside revealed element
        entry.target.querySelectorAll('.bar-fill').forEach(bar => {
          bar.style.width = bar.style.getPropertyValue('--w') || '0%';
        });
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach((el, i) => {
    el.style.transitionDelay = `${i % 4 * 80}ms`;
    revealObserver.observe(el);
  });

  // ===== NUMBER COUNTER =====
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      if (isNaN(target)) return;
      const duration = 1600;
      const start = performance.now();
      const easeOut = t => 1 - Math.pow(1 - t, 3);
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(easeOut(progress) * target).toLocaleString('en-IN');
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('[data-count]').forEach(el => countObserver.observe(el));

  // ===== TICKER — duplicate for seamless loop =====
  const track = document.getElementById('tickerTrack');
  if (track) {
    const spans = Array.from(track.children);
    spans.forEach(s => track.appendChild(s.cloneNode(true)));
  }

  // ===== SEARCH TAGS =====
  const searchInput = document.getElementById('searchInput');
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = tag.textContent.trim();
        searchInput.focus();
      }
    });
  });

  // ===== HOW-IT-WORKS TABS =====
  const tabs = document.querySelectorAll('.htab');
  const panels = document.querySelectorAll('.how-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const target = document.querySelector(`[data-panel="${tab.dataset.tab}"]`);
      target?.classList.add('active');
    });
  });

  // ===== SIGNUP FORM TABS =====
  const stabs = document.querySelectorAll('.stab');
  stabs.forEach(stab => {
    stab.addEventListener('click', () => {
      stabs.forEach(s => s.classList.remove('active'));
      stab.classList.add('active');
    });
  });

  // ===== SIGNUP FORM =====
  const signupForm = document.getElementById('signupForm');
  const signupSuccess = document.getElementById('signupSuccess');
  signupForm?.addEventListener('submit', e => {
    e.preventDefault();
    const btn = signupForm.querySelector('.sbtn');
    btn.textContent = 'Creating account...';
    btn.disabled = true;
    setTimeout(() => {
      signupForm.style.display = 'none';
      if (signupSuccess) signupSuccess.style.display = 'block';
    }, 900);
  });

  // ===== TOAST =====
  function showToast(msg, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  // ===== LISTING CARDS — Rent Now =====
  document.querySelectorAll('.lbtn').forEach(btn => {
    if (!btn.disabled) {
      btn.addEventListener('click', () => {
        showToast('Sign up free to book this item →');
      });
    }
  });

  // ===== LISTING CARDS — Save =====
  document.querySelectorAll('.lsave').forEach(btn => {
    btn.addEventListener('click', () => {
      const saved = btn.dataset.saved === 'true';
      btn.textContent = saved ? '♡' : '♥';
      btn.dataset.saved = saved ? 'false' : 'true';
      btn.style.color = saved ? '' : '#c55a28';
      showToast(saved ? 'Removed from saved' : 'Saved ♥');
    });
  });

  // ===== BAR FILLS (on page load for visible ones) =====
  document.querySelectorAll('.bar-fill').forEach(bar => {
    // CSS handles the transition on .revealed, nothing needed here
    // But in case any are visible on load:
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          bar.style.width = getComputedStyle(bar).getPropertyValue('--w') || '0%';
          observer.unobserve(bar);
        }
      });
    }, { threshold: 0.1 });
    observer.observe(bar);
  });

});
