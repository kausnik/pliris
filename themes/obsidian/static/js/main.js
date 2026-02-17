/* ============================================================
   Obsidian Precision — Pliris Consulting
   Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* ==========================================================
     1. Custom Cursor
     ========================================================== */
  const cursor = document.getElementById('cursor');
  if (cursor) {
    let cx = 0, cy = 0;   // current
    let tx = 0, ty = 0;   // target

    document.addEventListener('mousemove', function (e) {
      tx = e.clientX;
      ty = e.clientY;
    });

    (function animateCursor() {
      cx += (tx - cx) * 0.15;
      cy += (ty - cy) * 0.15;
      cursor.style.transform =
        'translate3d(' + cx + 'px,' + cy + 'px,0) translate(-50%,-50%)';
      requestAnimationFrame(animateCursor);
    })();

    // Expand on interactive elements
    var interactiveSelector =
      'a, button, [role="button"], input, textarea, select, .btn, .svc, .blog-card, .teammate, .cert-card, .edu-card, .exp-card, .client-logo, .industry-tag, .burger';

    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(interactiveSelector)) {
        cursor.classList.add('expand');
      }
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(interactiveSelector)) {
        cursor.classList.remove('expand');
      }
    });
  }

  /* ==========================================================
     2. Header Sticky Detection
     ========================================================== */
  var header = document.querySelector('.header') || document.querySelector('.site-header');
  if (header) {
    var stickyThreshold = 50;
    var stickyClass = header.classList.contains('header') ? 'stuck' : 'sticky';

    function checkSticky() {
      if (window.scrollY > stickyThreshold) {
        header.classList.add(stickyClass);
      } else {
        header.classList.remove(stickyClass);
      }
    }

    window.addEventListener('scroll', checkSticky, { passive: true });
    checkSticky();
  }

  /* ==========================================================
     3. Burger / Mobile Menu Toggle
     ========================================================== */
  var burger = document.querySelector('.burger');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (burger && mobileMenu) {
    burger.addEventListener('click', function () {
      burger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow =
        mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close menu when a link is clicked
    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        burger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ==========================================================
     4. Smooth Scroll for Anchor Links
     ========================================================== */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#' || targetId.length < 2) return;

      var target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      var headerOffset = header ? header.offsetHeight : 0;
      var top =
        target.getBoundingClientRect().top + window.pageYOffset - headerOffset;

      window.scrollTo({ top: top, behavior: 'smooth' });

      // Close mobile menu if open
      if (burger && burger.classList.contains('open')) {
        burger.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  /* ==========================================================
     5. IntersectionObserver Scroll Reveal
     ========================================================== */
  var revealElements = document.querySelectorAll('[data-reveal]');

  if (revealElements.length > 0 && 'IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            // Staggered delay based on data-reveal-delay or sibling index
            var delay = entry.target.getAttribute('data-reveal-delay');
            if (delay) {
              entry.target.style.transitionDelay = delay + 'ms';
            }
            entry.target.classList.add('revealed');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    revealElements.forEach(function (el, index) {
      // Auto-assign staggered delay for siblings with same parent
      if (!el.hasAttribute('data-reveal-delay')) {
        var siblings = el.parentElement
          ? el.parentElement.querySelectorAll(':scope > [data-reveal]')
          : [];
        if (siblings.length > 1) {
          var siblingIndex = Array.prototype.indexOf.call(siblings, el);
          if (siblingIndex > 0) {
            el.setAttribute('data-reveal-delay', siblingIndex * 80);
          }
        }
      }
      revealObserver.observe(el);
    });
  } else {
    // Fallback: reveal all immediately
    revealElements.forEach(function (el) {
      el.classList.add('revealed');
    });
  }

  /* ==========================================================
     6. Contact Form Validation
     ========================================================== */
  var contactForm = document.querySelector('.cform');

  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      var isValid = true;
      var requiredFields = contactForm.querySelectorAll('[required]');

      requiredFields.forEach(function (field) {
        // Remove previous error state
        field.classList.remove('error');

        var value = field.value.trim();
        if (!value) {
          field.classList.add('error');
          isValid = false;
        }

        // Basic email check
        if (
          field.type === 'email' &&
          value &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
        ) {
          field.classList.add('error');
          isValid = false;
        }
      });

      if (!isValid) {
        e.preventDefault();
        // Focus first errored field
        var firstError = contactForm.querySelector('.error');
        if (firstError) firstError.focus();
      }
    });

    // Clear error on input
    contactForm.querySelectorAll('input, textarea, select').forEach(function (field) {
      field.addEventListener('input', function () {
        this.classList.remove('error');
      });
    });
  }

  /* ==========================================================
     7. Hero Canvas — Circuit Field Animation
     ========================================================== */
  var heroCanvasWrapper = document.querySelector('.hero-canvas');

  if (heroCanvasWrapper) {
    var canvas = heroCanvasWrapper.querySelector('canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      heroCanvasWrapper.appendChild(canvas);
    }

    var ctx = canvas.getContext('2d');
    var dpr = window.devicePixelRatio || 1;
    var nodes = [];
    var nodeCount = 60;
    var connectionDistance = 160;
    var gridSpacing = 80;
    var animationId = null;

    // Accent colour components for RGBA usage
    var accentR = 0, accentG = 212, accentB = 200;

    /* --- Node class --- */
    function Node(x, y) {
      this.x = x;
      this.y = y;
      this.vx = (Math.random() - 0.5) * 0.35;
      this.vy = (Math.random() - 0.5) * 0.35;
      this.radius = Math.random() * 2 + 1;
      this.alpha = Math.random() * 0.5 + 0.2;
      this.pulseSpeed = Math.random() * 0.02 + 0.005;
      this.pulsePhase = Math.random() * Math.PI * 2;
    }

    Node.prototype.update = function (w, h, time) {
      this.x += this.vx;
      this.y += this.vy;

      // Wrap around edges
      if (this.x < 0) this.x = w;
      if (this.x > w) this.x = 0;
      if (this.y < 0) this.y = h;
      if (this.y > h) this.y = 0;

      // Pulsating alpha
      this.currentAlpha =
        this.alpha + Math.sin(time * this.pulseSpeed + this.pulsePhase) * 0.15;
    };

    Node.prototype.draw = function (ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle =
        'rgba(' + accentR + ',' + accentG + ',' + accentB + ',' + this.currentAlpha + ')';
      ctx.fill();

      // Glow
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
      ctx.fillStyle =
        'rgba(' + accentR + ',' + accentG + ',' + accentB + ',' + (this.currentAlpha * 0.15) + ')';
      ctx.fill();
    };

    /* --- Size canvas --- */
    function sizeCanvas() {
      var rect = heroCanvasWrapper.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { w: rect.width, h: rect.height };
    }

    /* --- Init nodes --- */
    function initNodes() {
      var dims = sizeCanvas();
      nodes = [];
      for (var i = 0; i < nodeCount; i++) {
        nodes.push(
          new Node(
            Math.random() * dims.w,
            Math.random() * dims.h
          )
        );
      }
    }

    /* --- Draw grid lines --- */
    function drawGrid(w, h, time) {
      ctx.strokeStyle = 'rgba(' + accentR + ',' + accentG + ',' + accentB + ',0.03)';
      ctx.lineWidth = 0.5;

      // Vertical lines
      for (var x = 0; x < w; x += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      // Horizontal lines
      for (var y = 0; y < h; y += gridSpacing) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Animated scan line
      var scanY = (time * 0.02) % h;
      ctx.strokeStyle = 'rgba(' + accentR + ',' + accentG + ',' + accentB + ',0.06)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, scanY);
      ctx.lineTo(w, scanY);
      ctx.stroke();
    }

    /* --- Draw connections --- */
    function drawConnections(w, h) {
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = nodes[i].x - nodes[j].x;
          var dy = nodes[i].y - nodes[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < connectionDistance) {
            var alpha = (1 - dist / connectionDistance) * 0.15;
            ctx.strokeStyle =
              'rgba(' + accentR + ',' + accentG + ',' + accentB + ',' + alpha + ')';
            ctx.lineWidth = 0.6;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
    }

    /* --- Animation loop --- */
    var startTime = performance.now();

    function animate() {
      var dims = {
        w: canvas.width / dpr,
        h: canvas.height / dpr,
      };
      var time = performance.now() - startTime;

      ctx.clearRect(0, 0, dims.w, dims.h);

      // Background grid
      drawGrid(dims.w, dims.h, time);

      // Update and draw nodes
      for (var i = 0; i < nodes.length; i++) {
        nodes[i].update(dims.w, dims.h, time);
        nodes[i].draw(ctx);
      }

      // Connections
      drawConnections(dims.w, dims.h);

      animationId = requestAnimationFrame(animate);
    }

    /* --- Init --- */
    initNodes();
    animate();

    /* --- Resize with debounce --- */
    var resizeTimer = null;

    function handleResize() {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        initNodes();
      }, 200);
    }

    window.addEventListener('resize', handleResize, { passive: true });

    /* --- Pause when not visible --- */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
      } else {
        if (!animationId) {
          startTime = performance.now();
          animate();
        }
      }
    });
  }
})();
