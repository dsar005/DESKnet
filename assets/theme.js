/* ============================================
   DESKnet Theme — JavaScript
   ============================================ */

(function() {
  'use strict';

  // ============================================
  // Utilities
  // ============================================
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  function debounce(fn, delay) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
  }

  function formatMoney(cents) {
    return '$' + (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  function showToast(message, icon = '✓') {
    const toast = $('#Toast');
    if (!toast) return;
    toast.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>${message}`;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 3200);
  }

  function initEmojiSketch(root = document.body) {
    if (!root) return;

    const emojiRegex = /(\p{Extended_Pictographic}(?:\uFE0F)?(?:\u200D\p{Extended_Pictographic}(?:\uFE0F)?)*)/gu;
    const skipTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE', 'PRE', 'SVG']);

    function wrapEmojis(node) {
      if (!node || node.nodeType !== Node.TEXT_NODE || !node.nodeValue || !node.nodeValue.trim()) return;
      if (!emojiRegex.test(node.nodeValue)) return;
      emojiRegex.lastIndex = 0;

      const parent = node.parentElement;
      if (!parent || parent.closest('.emoji-sketch') || skipTags.has(parent.tagName)) return;

      const parts = node.nodeValue.split(emojiRegex);
      if (parts.length < 2) return;

      const frag = document.createDocumentFragment();
      parts.forEach((part, idx) => {
        if (!part) return;
        if (idx % 2 === 1) {
          const span = document.createElement('span');
          span.className = 'emoji-sketch';
          span.textContent = part;
          frag.appendChild(span);
        } else {
          frag.appendChild(document.createTextNode(part));
        }
      });

      parent.replaceChild(frag, node);
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    textNodes.forEach(wrapEmojis);

    if (!window.__dnThemeEmojiSketchObserver) {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(m => {
          m.addedNodes.forEach(added => {
            if (added.nodeType === Node.TEXT_NODE) {
              wrapEmojis(added);
              return;
            }
            if (added.nodeType !== Node.ELEMENT_NODE || skipTags.has(added.tagName)) return;
            initEmojiSketch(added);
          });
        });
      });

      observer.observe(document.body, { childList: true, subtree: true });
      window.__dnThemeEmojiSketchObserver = observer;
    }
  }

  // ============================================
  // Header Scroll Effect
  // ============================================
  function initHeaderScroll() {
    const header = $('.site-header');
    if (!header) return;
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      header.classList.toggle('scrolled', y > 10);
      lastScroll = y;
    }, { passive: true });
  }

  // ============================================
  // Mobile Menu
  // ============================================
  function initMobileMenu() {
    const hamburger = $('#MobileMenuToggle');
    const overlay   = $('#MobileMenuOverlay');
    const menu      = $('#MobileMenu');

    function openMenu() {
      menu?.classList.add('open');
      overlay?.classList.add('visible');
      hamburger?.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    function closeMenu() {
      menu?.classList.remove('open');
      overlay?.classList.remove('visible');
      hamburger?.classList.remove('active');
      document.body.style.overflow = '';
    }

    hamburger?.addEventListener('click', () => {
      menu?.classList.contains('open') ? closeMenu() : openMenu();
    });
    overlay?.addEventListener('click', closeMenu);
    $$('.mobile-menu__close').forEach(b => b.addEventListener('click', closeMenu));
  }

  // ============================================
  // Cart Drawer
  // ============================================
  const CartDrawer = {
    drawer: null,
    overlay: null,
    countEl: null,

    init() {
      this.drawer  = $('#CartDrawer');
      this.overlay = $('#CartOverlay');
      this.countEl = $('#CartCount');

      $$('[data-open-cart]').forEach(btn =>
        btn.addEventListener('click', () => this.open())
      );
      $$('[data-close-cart]').forEach(btn =>
        btn.addEventListener('click', () => this.close())
      );
      this.overlay?.addEventListener('click', () => this.close());

      document.addEventListener('cart:updated', (e) => this.render(e.detail));
      this.fetchCart();
    },

    open() {
      this.drawer?.classList.add('open');
      this.overlay?.classList.add('visible');
      document.body.style.overflow = 'hidden';
    },

    close() {
      this.drawer?.classList.remove('open');
      this.overlay?.classList.remove('visible');
      document.body.style.overflow = '';
    },

    async fetchCart() {
      try {
        const res = await fetch('/cart.js');
        const cart = await res.json();
        this.updateCount(cart.item_count);
        this.renderItems(cart);
      } catch(e) {}
    },

    async addItem(variantId, qty = 1, properties = {}) {
      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: variantId, quantity: qty, properties })
        });
        if (!res.ok) throw new Error('Add to cart failed');
        await this.fetchCart();
        this.open();
        showToast('Added to cart!');
        return true;
      } catch(e) {
        showToast('Could not add to cart');
        return false;
      }
    },

    async changeQty(line, qty) {
      try {
        const res = await fetch('/cart/change.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ line, quantity: qty })
        });
        const cart = await res.json();
        this.updateCount(cart.item_count);
        this.renderItems(cart);
      } catch(e) {}
    },

    updateCount(count) {
      if (!this.countEl) return;
      this.countEl.textContent = count;
      this.countEl.style.display = count > 0 ? 'flex' : 'none';
    },

    renderItems(cart) {
      const body = $('#CartBody');
      const subtotal = $('#CartSubtotal');
      if (!body) return;

      if (!cart.items || cart.items.length === 0) {
        body.innerHTML = `
          <div class="cart-drawer__empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <h3 class="cart-drawer__empty-title">Your cart is empty</h3>
            <p class="cart-drawer__empty-text">Add some products to get started.</p>
            <a href="/collections/all" class="btn btn--primary btn--sm" data-close-cart style="margin-top:8px">Start Shopping</a>
          </div>`;
        if (subtotal) subtotal.textContent = '$0.00';
        return;
      }

      body.innerHTML = cart.items.map((item, i) => `
        <div class="cart-item" data-line="${i + 1}">
          <img class="cart-item__image"
            src="${item.image ? item.image.replace(/(\.\w+)$/, '_120x120$1') : ''}"
            alt="${item.product_title}"
            loading="lazy">
          <div class="cart-item__details">
            <div class="cart-item__title">${item.product_title}</div>
            ${item.variant_title ? `<div class="cart-item__variant">${item.variant_title}</div>` : ''}
            <div class="cart-item__controls">
              <div class="cart-item__qty">
                <button class="cart-item__qty-btn" data-line="${i + 1}" data-delta="-1">−</button>
                <span class="cart-item__qty-val">${item.quantity}</span>
                <button class="cart-item__qty-btn" data-line="${i + 1}" data-delta="1">+</button>
              </div>
              <div class="cart-item__price">${formatMoney(item.final_line_price)}</div>
            </div>
            <button class="cart-item__remove" data-line="${i + 1}" data-qty="0">Remove</button>
          </div>
        </div>`).join('');

      if (subtotal) subtotal.textContent = formatMoney(cart.total_price);

      // Bind qty buttons
      $$('.cart-item__qty-btn', body).forEach(btn => {
        btn.addEventListener('click', async () => {
          const line = parseInt(btn.dataset.line);
          const delta = parseInt(btn.dataset.delta);
          const qtyVal = btn.closest('.cart-item').querySelector('.cart-item__qty-val');
          const currentQty = parseInt(qtyVal.textContent);
          const newQty = Math.max(0, currentQty + delta);
          await this.changeQty(line, newQty);
        });
      });

      $$('.cart-item__remove', body).forEach(btn => {
        btn.addEventListener('click', async () => {
          const line = parseInt(btn.dataset.line);
          await this.changeQty(line, 0);
        });
      });
    },

    render(cart) {
      this.updateCount(cart.item_count);
      this.renderItems(cart);
    }
  };

  // ============================================
  // Add to Cart
  // ============================================
  function initAddToCart() {
    $$('[data-add-to-cart]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const variantId = btn.dataset.variantId || btn.dataset.addToCart;
        if (!variantId) return;
        btn.classList.add('btn--loading');
        btn.disabled = true;
        await CartDrawer.addItem(variantId);
        btn.classList.remove('btn--loading');
        btn.disabled = false;
      });
    });

    // Product page form
    const productForm = $('#ProductForm');
    if (productForm) {
      productForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const variantId = (productForm.querySelector('[name="id"]'))?.value;
        const qty = parseInt(productForm.querySelector('[name="quantity"]')?.value || 1);
        if (!variantId) return;
        const btn = productForm.querySelector('[type="submit"]');
        if (btn) {
          const orig = btn.innerHTML;
          btn.innerHTML = 'Adding…';
          btn.disabled = true;
          await CartDrawer.addItem(variantId, qty);
          btn.innerHTML = orig;
          btn.disabled = false;
        }
      });
    }
  }

  // ============================================
  // Product Gallery
  // ============================================
  function initProductGallery() {
    const thumbs = $$('.product-gallery__thumb');
    const mainImg = $('#ProductMainImage');
    if (!thumbs.length || !mainImg) return;

    thumbs.forEach((thumb, i) => {
      thumb.addEventListener('click', () => {
        thumbs.forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
        const src = thumb.querySelector('img')?.src;
        if (src) {
          mainImg.style.opacity = '0';
          setTimeout(() => {
            mainImg.src = src.replace('_120x120', '_800x800');
            mainImg.style.opacity = '1';
          }, 150);
        }
      });
    });
  }

  // ============================================
  // Product Tabs
  // ============================================
  function initProductTabs() {
    const tabs = $$('.product-tabs__tab');
    const panels = $$('.product-tabs__panel');
    if (!tabs.length) return;

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        tabs.forEach(t => t.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        tab.classList.add('active');
        $(`[data-panel="${target}"]`)?.classList.add('active');
      });
    });
  }

  // ============================================
  // Variant Selection
  // ============================================
  function initVariantSelection() {
    const swatches = $$('.variant-swatch');
    if (!swatches.length) return;

    swatches.forEach(swatch => {
      swatch.addEventListener('click', () => {
        const group = swatch.dataset.group;
        $$(`[data-group="${group}"]`).forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');

        // Update selected label
        const label = $(`[data-variant-selected="${group}"]`);
        if (label) label.textContent = swatch.dataset.value;

        // Would update variant ID in real Shopify context
      });
    });
  }

  // ============================================
  // Quantity Input
  // ============================================
  function initQtyInputs() {
    $$('.qty-input').forEach(wrapper => {
      const dec = wrapper.querySelector('[data-qty-dec]');
      const inc = wrapper.querySelector('[data-qty-inc]');
      const val = wrapper.querySelector('.qty-input__val');
      if (!val) return;

      dec?.addEventListener('click', () => {
        const v = Math.max(1, parseInt(val.textContent) - 1);
        val.textContent = v;
        const inp = wrapper.querySelector('input');
        if (inp) inp.value = v;
      });
      inc?.addEventListener('click', () => {
        const v = parseInt(val.textContent) + 1;
        val.textContent = v;
        const inp = wrapper.querySelector('input');
        if (inp) inp.value = v;
      });
    });
  }

  // ============================================
  // Sticky Add-to-Cart
  // ============================================
  function initStickyATC() {
    const bar = $('.sticky-atc');
    const trigger = $('#ProductForm');
    if (!bar || !trigger) return;

    const observer = new IntersectionObserver(([entry]) => {
      bar.classList.toggle('visible', !entry.isIntersecting);
    }, { threshold: 0 });

    observer.observe(trigger);
  }

  // ============================================
  // FAQ Accordion
  // ============================================
  function initAccordion() {
    $$('.accordion-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const item = trigger.closest('.accordion-item');
        const isOpen = item.classList.contains('open');

        // Close all
        $$('.accordion-item').forEach(i => i.classList.remove('open'));

        // Toggle current
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  // ============================================
  // FAQ Search
  // ============================================
  function initFAQSearch() {
    const searchInput = $('#FaqSearch');
    const items = $$('.accordion-item');
    if (!searchInput || !items.length) return;

    searchInput.addEventListener('input', debounce(() => {
      const q = searchInput.value.toLowerCase().trim();
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = !q || text.includes(q) ? '' : 'none';
      });
    }, 200));
  }

  // ============================================
  // FAQ Categories
  // ============================================
  function initFAQCategories() {
    const cats = $$('.faq-cat-btn');
    const items = $$('.accordion-item');

    cats.forEach(cat => {
      cat.addEventListener('click', () => {
        cats.forEach(c => c.classList.remove('active'));
        cat.classList.add('active');
        const filter = cat.dataset.category;

        items.forEach(item => {
          item.style.display = (!filter || filter === 'all' || item.dataset.category === filter) ? '' : 'none';
        });
      });
    });
  }

  // ============================================
  // Filter Buttons (Collection)
  // ============================================
  function initFilters() {
    const filterBtns = $$('.filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.dataset.toggle) {
          filterBtns.forEach(b => {
            if (b.dataset.group === btn.dataset.group) b.classList.remove('active');
          });
          btn.classList.toggle('active');
        }
      });
    });
  }

  // ============================================
  // Newsletter Form
  // ============================================
  function initNewsletter() {
    $$('.newsletter__form, #NewsletterForm').forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = form.querySelector('input[type="email"]')?.value;
        if (!email) return;

        const btn = form.querySelector('button, .newsletter__btn');
        const orig = btn?.textContent;
        if (btn) { btn.textContent = 'Subscribing…'; btn.disabled = true; }

        // Simulate subscription (Shopify handles via /contact#contact_form)
        await new Promise(r => setTimeout(r, 900));

        form.innerHTML = '<p style="font-weight:700;font-size:1.1rem;">Thanks for subscribing! 🎉<br><small style="font-weight:400;opacity:0.8">Check your inbox for your discount code.</small></p>';
        showToast('Subscribed successfully!');
      });
    });
  }

  // ============================================
  // Email Popup
  // ============================================
  function initEmailPopup() {
    const popup  = $('#EmailPopup');
    const close  = $('#CloseEmailPopup');
    const form   = $('#PopupEmailForm');
    if (!popup) return;

    const STORAGE_KEY = 'desknet_popup_dismissed';
    const dismissed = sessionStorage.getItem(STORAGE_KEY);

    if (!dismissed) {
      setTimeout(() => popup.classList.add('visible'), 3500);
    }

    close?.addEventListener('click', () => {
      popup.classList.remove('visible');
      sessionStorage.setItem(STORAGE_KEY, '1');
    });

    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        popup.classList.remove('visible');
        sessionStorage.setItem(STORAGE_KEY, '1');
      }
    });

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = form.querySelector('.email-popup__btn');
      if (btn) { btn.textContent = 'Claiming…'; btn.disabled = true; }
      await new Promise(r => setTimeout(r, 800));
      popup.querySelector('.email-popup__inner').innerHTML = `
        <div style="padding:2rem;text-align:center;">
          <div style="font-size:3rem;margin-bottom:1rem;">🎉</div>
          <h3 style="font-family:var(--font-heading);font-size:1.75rem;font-weight:800;margin-bottom:0.75rem;">You're in!</h3>
          <p style="color:var(--color-text-muted);line-height:1.6;">Check your inbox for your <strong>15% off code</strong>. Valid on your first order.</p>
          <button onclick="document.getElementById('EmailPopup').classList.remove('visible')" class="btn btn--primary" style="margin-top:1.5rem;width:100%;">Start Shopping</button>
        </div>`;
      sessionStorage.setItem(STORAGE_KEY, '1');
    });
  }

  // ============================================
  // Scroll Animations (Intersection Observer)
  // ============================================
  function initScrollAnimations() {
    const els = $$('.animate-on-scroll');
    if (!els.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => observer.observe(el));
  }

  // ============================================
  // Announcement Bar Marquee
  // ============================================
  function initAnnouncementMarquee() {
    const track = $('.announcement-bar__track');
    if (!track) return;
    // Clone items for seamless loop
    const clone = track.cloneNode(true);
    track.parentElement?.appendChild(clone);
  }

  // ============================================
  // Product Wishlist
  // ============================================
  function initWishlist() {
    $$('[data-wishlist]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const icon = btn.querySelector('svg');
        const isWishlisted = btn.classList.toggle('wishlisted');
        if (icon) {
          icon.setAttribute('fill', isWishlisted ? 'currentColor' : 'none');
        }
        showToast(isWishlisted ? 'Added to wishlist' : 'Removed from wishlist');
      });
    });
  }

  // ============================================
  // Quick View (stub)
  // ============================================
  function initQuickView() {
    $$('[data-quick-view]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const handle = btn.dataset.quickView;
        // Full quick view modal would fetch product data here
        window.location.href = `/products/${handle}`;
      });
    });
  }

  // ============================================
  // Image gallery lazy load
  // ============================================
  function initLazyImages() {
    if ('loading' in HTMLImageElement.prototype) return;
    $$('img[loading="lazy"]').forEach(img => {
      const src = img.dataset.src;
      if (src) img.src = src;
    });
  }

  // ============================================
  // Smooth anchor scroll for policy nav
  // ============================================
  function initPolicyNav() {
    $$('.policy-nav__link[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.getElementById(link.getAttribute('href').slice(1));
        if (!target) return;
        $$('.policy-nav__link').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });

    // Highlight active section on scroll
    const sections = $$('.policy-section[id]');
    if (!sections.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          $$('.policy-nav__link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
          });
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });

    sections.forEach(s => observer.observe(s));
  }

  // ============================================
  // Variant color swatches hover preview
  // ============================================
  function initSwatchPreviews() {
    $$('[data-swatch-preview]').forEach(swatch => {
      const card = swatch.closest('.product-card');
      const img = card?.querySelector('.product-card__img');
      if (!img) return;

      swatch.addEventListener('mouseenter', () => {
        const src = swatch.dataset.swatchPreview;
        if (src && img) img.src = src;
      });
    });
  }

  // ============================================
  // Sort dropdown
  // ============================================
  function initSortSelect() {
    const sel = $('#CollectionSort');
    if (!sel) return;
    sel.addEventListener('change', () => {
      const url = new URL(window.location.href);
      url.searchParams.set('sort_by', sel.value);
      window.location.href = url.toString();
    });
  }

  // ============================================
  // Init all
  // ============================================
  document.addEventListener('DOMContentLoaded', () => {
    initHeaderScroll();
    initMobileMenu();
    CartDrawer.init();
    initAddToCart();
    initProductGallery();
    initProductTabs();
    initVariantSelection();
    initQtyInputs();
    initStickyATC();
    initAccordion();
    initFAQSearch();
    initFAQCategories();
    initFilters();
    initNewsletter();
    initEmailPopup();
    initScrollAnimations();
    initAnnouncementMarquee();
    initWishlist();
    initQuickView();
    initLazyImages();
    initPolicyNav();
    initSwatchPreviews();
    initSortSelect();
    initEmojiSketch();
  });

})();
