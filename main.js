/* ================================================
   DESKnet — main.js
   Interactive features for the store
   ================================================ */

(function() {
  'use strict';

  /* ---- Emoji Sketch Conversion ---- */
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

    if (!window.__dnEmojiSketchObserver) {
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
      window.__dnEmojiSketchObserver = observer;
    }
  }

  /* ---- Announcement Bar ---- */
  const annBar = document.getElementById('ann-bar');
  if (annBar) {
    const closeBtn = annBar.querySelector('.ann-close');
    if (closeBtn) closeBtn.addEventListener('click', () => annBar.style.display = 'none');
  }

  /* ---- Header scroll effect ---- */
  const header = document.querySelector('.site-header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }

  /* ---- Mobile Menu ---- */
  const hamburger    = document.querySelector('.hamburger');
  const mobileMenu   = document.querySelector('.mobile-menu');
  const mmClose      = document.querySelector('.mm-close');

  function openMobileMenu() {
    mobileMenu && mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileMenu() {
    mobileMenu && mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
  }
  hamburger && hamburger.addEventListener('click', openMobileMenu);
  mmClose   && mmClose.addEventListener('click', closeMobileMenu);

  /* ---- Search Overlay ---- */
  const searchOverlay = document.querySelector('.search-overlay');
  const searchBtns    = document.querySelectorAll('[data-search-open]');
  const searchClose   = document.querySelector('.search-x');

  searchBtns.forEach(btn => btn.addEventListener('click', () => {
    searchOverlay && searchOverlay.classList.add('open');
    const input = searchOverlay && searchOverlay.querySelector('input');
    input && setTimeout(() => input.focus(), 100);
  }));
  searchClose && searchClose.addEventListener('click', () => {
    searchOverlay && searchOverlay.classList.remove('open');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      searchOverlay && searchOverlay.classList.remove('open');
      closeMobileMenu();
      closeCart();
      closePopup();
      closeSidebar();
    }
  });

  /* ---- Cart Drawer ---- */
  let cartCount = 0;
  let cartItems = [];

  const cartDrawer  = document.querySelector('.cart-drawer');
  const cartOverlay = document.querySelector('.cart-overlay');
  const cartBadges  = document.querySelectorAll('.cart-dot');
  const openCartBtns = document.querySelectorAll('[data-cart-open]');
  const closeCartBtn = document.querySelector('.cart-x');

  function openCart() {
    cartDrawer  && cartDrawer.classList.add('open');
    cartOverlay && cartOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeCart() {
    cartDrawer  && cartDrawer.classList.remove('open');
    cartOverlay && cartOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }

  openCartBtns.forEach(btn => btn.addEventListener('click', openCart));
  closeCartBtn  && closeCartBtn.addEventListener('click', closeCart);
  cartOverlay   && cartOverlay.addEventListener('click', closeCart);

  function updateCartBadge() {
    cartBadges.forEach(b => b.textContent = cartCount);
  }

  function addToCart(name, price, image, variant) {
    cartCount++;
    cartItems.push({ name, price, image, variant });
    updateCartBadge();
    renderCartItems();
    openCart();
    showToast('✓ Added to cart — ' + name);
  }

  function renderCartItems() {
    const body = document.querySelector('.cart-body');
    const ftr  = document.querySelector('.cart-ftr');
    if (!body) return;

    if (cartItems.length === 0) {
      body.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">🛒</div>
          <h4>Your cart is empty</h4>
          <p>Start building your dream workspace.</p>
          <a href="shop.html" class="btn btn-primary btn-sm" style="margin-top:1.5rem">Shop Now</a>
        </div>`;
      ftr && (ftr.style.display = 'none');
    } else {
      let total = cartItems.reduce((s, i) => s + parseFloat(i.price), 0);
      body.innerHTML = cartItems.map((item, idx) => `
        <div class="cart-item">
          <div class="ci-img"><img src="${item.image}" alt="${item.name}" onerror="this.src='https://placehold.co/76x76/f2f2f7/72728a?text=IMG'"></div>
          <div class="ci-info">
            <div class="ci-name">${item.name}</div>
            <div class="ci-variant">${item.variant || 'Default'}</div>
            <div class="ci-row">
              <span class="ci-price">$${parseFloat(item.price).toFixed(2)}</span>
              <span class="ci-remove" data-idx="${idx}">Remove</span>
            </div>
          </div>
        </div>`).join('');
      ftr && (ftr.style.display = 'block');
      const subEl = document.querySelector('.cart-sub-row span:last-child');
      if (subEl) subEl.textContent = '$' + total.toFixed(2);

      body.querySelectorAll('.ci-remove').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = parseInt(btn.dataset.idx);
          cartItems.splice(i, 1);
          cartCount = Math.max(0, cartCount - 1);
          updateCartBadge();
          renderCartItems();
        });
      });
    }
  }
  renderCartItems();

  /* ---- Add to Cart Buttons ---- */
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-add-to-cart]');
    if (btn) {
      e.preventDefault();
      const name    = btn.dataset.name    || 'Product';
      const price   = btn.dataset.price   || '0';
      const image   = btn.dataset.image   || 'https://placehold.co/76x76/f2f2f7/72728a?text=IMG';
      const variant = btn.dataset.variant || '';
      addToCart(name, price, image, variant);
    }
  });

  /* ---- Quantity Selectors ---- */
  document.addEventListener('click', e => {
    if (e.target.closest('.qty-btn')) {
      const btn   = e.target.closest('.qty-btn');
      const ctrl  = btn.closest('.qty-ctrl') || btn.closest('.cr-qty-ctrl');
      const input = ctrl && ctrl.querySelector('input');
      if (!input) return;
      let val = parseInt(input.value) || 1;
      if (btn.dataset.action === 'minus') val = Math.max(1, val - 1);
      if (btn.dataset.action === 'plus')  val = Math.min(99, val + 1);
      input.value = val;
    }
    if (e.target.closest('.cr-qty-btn')) {
      const btn   = e.target.closest('.cr-qty-btn');
      const ctrl  = btn.closest('.cr-qty-ctrl');
      const input = ctrl && ctrl.querySelector('input');
      if (!input) return;
      let val = parseInt(input.value) || 1;
      if (btn.dataset.action === 'minus') val = Math.max(1, val - 1);
      if (btn.dataset.action === 'plus')  val = Math.min(99, val + 1);
      input.value = val;
    }
  });

  /* ---- Option Chips ---- */
  document.querySelectorAll('.option-chips').forEach(group => {
    group.addEventListener('click', e => {
      const chip = e.target.closest('.option-chip');
      if (!chip) return;
      group.querySelectorAll('.option-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
    });
  });

  /* ---- Product Gallery Thumbnails ---- */
  const thumbs   = document.querySelectorAll('.g-thumb');
  const mainImg  = document.querySelector('.gallery-main img');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      thumbs.forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
      if (mainImg) {
        mainImg.style.opacity = '0';
        setTimeout(() => {
          const src = thumb.querySelector('img') && thumb.querySelector('img').src;
          if (src) mainImg.src = src;
          mainImg.style.opacity = '1';
        }, 150);
      }
    });
  });

  /* ---- Product Tabs ---- */
  document.querySelectorAll('.tabs-nav').forEach(nav => {
    nav.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tabs = btn.closest('.product-tabs');
        if (!tabs) return;
        tabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        tabs.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = tabs.querySelector('#' + btn.dataset.tab);
        target && target.classList.add('active');
      });
    });
  });

  /* ---- Sticky ATC ---- */
  const stickyAtc = document.querySelector('.sticky-atc');
  const prodActions = document.querySelector('.prod-actions');
  if (stickyAtc && prodActions) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        stickyAtc.classList.toggle('show', !entry.isIntersecting);
      });
    }, { threshold: 0 });
    observer.observe(prodActions);
  }

  /* ---- FAQ Accordion ---- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-q');
    const answer   = item.querySelector('.faq-a');
    if (!question || !answer) return;
    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        const a = openItem.querySelector('.faq-a');
        if (a) a.style.maxHeight = '0';
      });
      // Toggle clicked
      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  /* ---- FAQ Category Filter ---- */
  document.querySelectorAll('.faq-cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.faq-cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat;
      document.querySelectorAll('.faq-item').forEach(item => {
        if (cat === 'all' || item.dataset.cat === cat) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  /* ---- Scroll Animations ---- */
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(el => io.observe(el));
  } else {
    fadeEls.forEach(el => el.classList.add('in-view'));
  }

  /* ---- Email Popup ---- */
  const popup    = document.querySelector('.popup-overlay');
  const popupX   = document.querySelector('.popup-x');
  const popupSkip= document.querySelector('.popup-skip');

  function closePopup() {
    popup && popup.classList.remove('show');
    document.body.style.overflow = '';
    sessionStorage.setItem('dn_popup', '1');
  }

  if (popup && !sessionStorage.getItem('dn_popup')) {
    setTimeout(() => {
      popup.classList.add('show');
    }, 6000);
  }
  popupX    && popupX.addEventListener('click', closePopup);
  popupSkip && popupSkip.addEventListener('click', closePopup);
  popup     && popup.addEventListener('click', e => { if (e.target === popup) closePopup(); });

  const popupForm = document.querySelector('.popup-form');
  if (popupForm) {
    popupForm.addEventListener('submit', e => {
      e.preventDefault();
      closePopup();
      showToast('🎉 Welcome! Your 10% discount is on its way.');
    });
  }

  /* ---- Newsletter Form ---- */
  document.querySelectorAll('.nl-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const input = form.querySelector('.nl-input');
      if (input && input.value.trim()) {
        showToast('✓ You\'re subscribed! Check your email.');
        input.value = '';
      }
    });
  });

  /* ---- Contact Form ---- */
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const btn = contactForm.querySelector('[type="submit"]');
      if (btn) { btn.textContent = 'Message Sent!'; btn.disabled = true; }
      showToast('✓ Message sent — we\'ll reply within 24 hours.');
      setTimeout(() => { if (btn) { btn.textContent = 'Send Message'; btn.disabled = false; } }, 4000);
      contactForm.reset();
    });
  }

  /* ---- Toast Notification ---- */
  function showToast(message) {
    let toast = document.querySelector('.toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3500);
  }
  window.showToast = showToast;

  /* ---- Wishlist Button ---- */
  const wishBtn = document.querySelector('.btn-wish');
  if (wishBtn) {
    wishBtn.addEventListener('click', () => {
      wishBtn.innerHTML = wishBtn.innerHTML.includes('♡') ? '♥' : '♡';
      wishBtn.classList.toggle('wished');
      showToast(wishBtn.classList.contains('wished') ? '♥ Saved to wishlist' : 'Removed from wishlist');
    });
  }

  /* ---- Quick View / Quick Add ---- */
  document.querySelectorAll('.quick-add').forEach(btn => {
    btn.addEventListener('click', () => {
      const card  = btn.closest('.product-card');
      const name  = card && (card.querySelector('.pc-name') || card.querySelector('h3'));
      const price = card && card.querySelector('.price-cur');
      const img   = card && card.querySelector('.pc-img img');
      addToCart(
        name  ? name.textContent.trim()  : 'Product',
        price ? price.textContent.replace('$','').trim() : '0',
        img   ? img.src : 'https://placehold.co/76x76/f2f2f7/72728a?text=IMG',
        ''
      );
    });
  });

  /* ---- Shop Sidebar Toggle (mobile) ---- */
  const filterToggleBtn = document.getElementById('filterToggle');
  const shopSidebar     = document.getElementById('shopSidebar');
  const sidebarCloseBtn = document.getElementById('sidebarClose');
  const sidebarOverlay  = document.getElementById('sidebarOverlay');

  function openSidebar() {
    shopSidebar    && shopSidebar.classList.add('open');
    sidebarOverlay && sidebarOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    shopSidebar    && shopSidebar.classList.remove('open');
    sidebarOverlay && sidebarOverlay.classList.remove('show');
    document.body.style.overflow = '';
  }
  filterToggleBtn && filterToggleBtn.addEventListener('click', openSidebar);
  sidebarCloseBtn && sidebarCloseBtn.addEventListener('click', closeSidebar);
  sidebarOverlay  && sidebarOverlay.addEventListener('click', closeSidebar);

  /* ---- Shop Filters ---- */
  (function() {
    const grid = document.querySelector('.shop-products-grid');
    if (!grid) return;

    function applyShopFilters() {
      const cards    = grid.querySelectorAll('.product-card');
      const catOpts  = document.getElementById('filter-cats');
      const matOpts  = document.getElementById('filter-mats');
      const colOpts  = document.getElementById('filter-rats') && document.getElementById('filter-cols');
      const ratOpts  = document.getElementById('filter-rats');
      const colorOpts= document.getElementById('filter-cols');
      const priceRng = document.querySelector('.price-range');
      const countEl  = document.querySelector('.shop-count strong');

      const maxPrice = priceRng ? parseFloat(priceRng.value) : 200;

      function checkedVals(container) {
        if (!container) return [];
        return Array.from(container.querySelectorAll('input:checked')).map(i => i.value);
      }

      const catVals = checkedVals(catOpts);
      const allCat  = catVals.includes('all') || catVals.length === 0;
      const cats    = allCat ? [] : catVals;
      const mats    = checkedVals(matOpts);
      const cols    = checkedVals(colorOpts);
      const rats    = checkedVals(ratOpts);

      let visible = 0;
      cards.forEach(card => {
        const show =
          (cats.length === 0 || cats.includes(card.dataset.category)) &&
          (parseFloat(card.dataset.price || 0) <= maxPrice) &&
          (mats.length === 0 || mats.includes(card.dataset.material)) &&
          (cols.length === 0 || cols.includes(card.dataset.color)) &&
          (rats.length === 0 || rats.some(r => (parseInt(card.dataset.rating) || 0) >= parseInt(r)));
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      if (countEl) countEl.textContent = visible;
    }

    window._shopApplyFilters = applyShopFilters;

    // Category "All Products" mutual exclusivity
    const catOpts = document.getElementById('filter-cats');
    if (catOpts) {
      const allCb = catOpts.querySelector('input[value="all"]');
      catOpts.querySelectorAll('input').forEach(cb => {
        cb.addEventListener('change', () => {
          if (cb.value === 'all' && cb.checked) {
            catOpts.querySelectorAll('input').forEach(o => { if (o !== cb) o.checked = false; });
          } else if (cb.value !== 'all' && cb.checked && allCb) {
            allCb.checked = false;
          }
          applyShopFilters();
        });
      });
    }

    // Material / Color / Rating
    ['filter-mats', 'filter-cols', 'filter-rats'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.querySelectorAll('input').forEach(cb => cb.addEventListener('change', applyShopFilters));
    });

    // Sort
    const sortSel = document.querySelector('.sort-select');
    if (sortSel) {
      sortSel.addEventListener('change', () => {
        const all = Array.from(grid.querySelectorAll('.product-card'));
        const val = sortSel.value;
        all.sort((a, b) => {
          const pa = parseFloat(a.dataset.price) || 0, pb = parseFloat(b.dataset.price) || 0;
          const ra = parseInt(a.dataset.rating)  || 0, rb = parseInt(b.dataset.rating)  || 0;
          if (val === 'Price: Low to High')  return pa - pb;
          if (val === 'Price: High to Low') return pb - pa;
          if (val === 'Highest Rated')      return rb - ra;
          return 0;
        });
        all.forEach(c => grid.appendChild(c));
      });
    }

    applyShopFilters();
  })();

  /* ---- Price Range Filter ---- */
  const priceRange = document.querySelector('.price-range');
  const priceMax   = document.querySelector('.price-max');
  if (priceRange && priceMax) {
    priceRange.addEventListener('input', () => {
      priceMax.textContent = '$' + priceRange.value;
      window._shopApplyFilters && window._shopApplyFilters();
    });
  }

  /* ---- Coupon Code ---- */
  const applyBtn = document.querySelector('[data-apply-coupon]');
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const input = document.querySelector('.coupon-input');
      if (input && input.value.trim().toUpperCase() === 'DESK10') {
        showToast('🎉 Coupon applied — 10% off!');
      } else {
        showToast('⚠ Invalid coupon code.');
      }
    });
  }

  /* ---- View Toggle (shop grid/list) ---- */
  const shopProductsGrid = document.querySelector('.shop-products-grid');
  document.querySelectorAll('.vbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.vbtn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (shopProductsGrid) shopProductsGrid.classList.toggle('list-view', btn.title === 'List view');
    });
  });

  /* ---- Smooth scroll for anchor links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

  initEmojiSketch();

})();
