# DESKnet Shopify Theme

A modern, minimal, professional Shopify eCommerce theme for DESKnet — workspace accessories for students, developers, creators, and remote workers.

---

## Theme Structure

```
desknet1/
├── assets/
│   ├── theme.css          # Full design system & all component styles
│   └── theme.js           # Cart, interactions, animations, popups
├── config/
│   ├── settings_schema.json  # Theme editor settings
│   └── settings_data.json    # Default setting values
├── layout/
│   └── theme.liquid       # Main HTML layout (head, body, cart drawer, popup)
├── locales/
│   └── en.default.json    # English translations
├── sections/
│   ├── announcement-bar.liquid    # Top bar with marquee messaging
│   ├── header.liquid              # Sticky header with mobile menu
│   ├── hero.liquid                # Full-height dark hero section
│   ├── featured-products.liquid   # 4-product grid showcase
│   ├── features-grid.liquid       # Why DESKnet benefits (4 cards)
│   ├── best-sellers.liquid        # Dark-themed top products
│   ├── workspace-transformation.liquid  # Split visual + checklist
│   ├── testimonials.liquid        # 3-column review cards + rating
│   ├── trust-signals.liquid       # 4-column trust bar
│   ├── newsletter.liquid          # Email capture with gradient bg
│   ├── instagram-gallery.liquid   # 6-grid social gallery
│   ├── footer.liquid              # Dark footer with all links
│   ├── cart-drawer.liquid         # Slide-in cart with AJAX
│   ├── main-product.liquid        # Full product page with tabs & reviews
│   ├── main-collection.liquid     # Shop grid with filters & sort
│   ├── page-about.liquid          # About us story page
│   ├── page-contact.liquid        # Contact form + info
│   ├── page-faq.liquid            # Searchable accordion FAQ
│   ├── page-shipping.liquid       # Shipping & returns policy
│   ├── page-privacy.liquid        # Privacy policy
│   ├── page-terms.liquid          # Terms of service
│   └── page-refunds.liquid        # Refund policy
├── snippets/
│   ├── product-card.liquid        # Product card component (live data)
│   ├── product-card-placeholder.liquid  # Static demo cards
│   └── meta-tags.liquid           # OG/Twitter meta tags
└── templates/
    ├── index.json             # Homepage
    ├── product.json           # Product page
    ├── collection.json        # Collection/shop page
    ├── cart.liquid            # Cart page
    ├── 404.liquid             # Not found page
    ├── page.about.json        # About page
    ├── page.contact.json      # Contact page
    ├── page.faq.json          # FAQ page
    ├── page.shipping.json     # Shipping & Returns page
    ├── page.privacy.json      # Privacy Policy page
    ├── page.terms.json        # Terms of Service page
    └── page.refunds.json      # Refund Policy page
```

---

## Design System

### Color Palette
- **Background:** `#ffffff` (white)
- **Surface:** `#f7f7f5` (warm off-white)
- **Dark Background:** `#0d0d12` (near-black)
- **Accent:** `#4f46e5` (electric indigo)
- **Accent Light:** `#ede9fe`
- **Cyan:** `#06b6d4` (secondary accent)
- **Text:** `#111118`
- **Muted:** `#6b7280`

### Typography
- **Headings:** Syne (Google Fonts) — Bold, tight letter-spacing
- **Body:** Inter (Google Fonts) — Clean, readable
- **Mono:** JetBrains Mono — For labels, tags, specs

---

## Shopify Setup Instructions

### 1. Upload Theme
Upload this folder as a zip to your Shopify Admin → Online Store → Themes → Upload theme.

### 2. Create Products
Create these 5 products in your Shopify Admin:

| Product | Handle | Suggested Price | Compare Price |
|---------|--------|----------------|---------------|
| Adjustable Laptop Stand | `adjustable-laptop-stand` | $49.99 | $69.99 |
| Minimal Desk Mat XL | `minimal-desk-mat` | $34.99 | $49.99 |
| Cable Management Kit | `cable-management-kit` | $24.99 | — |
| RGB Desk Light Bar | `rgb-desk-light-bar` | $39.99 | $54.99 |
| Wireless Charging Pad | `wireless-charging-pad` | $44.99 | $59.99 |

### 3. Create Collections
Create these collections and assign products:
- **All Products** — all products (`/collections/all`)
- **Desk Accessories** — (`/collections/desk-accessories`)
- **Stands & Mounts** — (`/collections/stands-mounts`)
- **Lighting** — (`/collections/lighting`)
- **Organization** — (`/collections/organization`)
- **Best Sellers** — tag products with `best-seller`
- **New Arrivals** — tag products with `new`

### 4. Create Pages
Create these pages in Shopify Admin → Online Store → Pages:
- **About** (URL: `/pages/about`) → Template: `page.about`
- **Contact** (URL: `/pages/contact`) → Template: `page.contact`
- **FAQ** (URL: `/pages/faq`) → Template: `page.faq`
- **Shipping & Returns** (URL: `/pages/shipping-returns`) → Template: `page.shipping`
- **Privacy Policy** (URL: `/pages/privacy-policy`) → Template: `page.privacy`
- **Terms of Service** (URL: `/pages/terms-of-service`) → Template: `page.terms`
- **Refund Policy** (URL: `/pages/refund-policy`) → Template: `page.refunds`

### 5. Navigation
Set up navigation menus at Online Store → Navigation:
- **Main menu:** Shop All, Accessories, Stands & Mounts, Lighting, Organization, About

---

## Features

- ✅ AJAX Cart Drawer with real-time updates
- ✅ Email popup with 15% discount offer
- ✅ Sticky add-to-cart bar on product pages
- ✅ Mobile-responsive hamburger menu
- ✅ Scroll animations (Intersection Observer)
- ✅ Product tabs (Description, Specs, Shipping, Reviews)
- ✅ FAQ accordion with search and category filters
- ✅ Announcement bar with auto-marquee
- ✅ Product quick view support
- ✅ Wishlist button (visual feedback)
- ✅ Header scroll effect
- ✅ Toast notifications
- ✅ Newsletter form
- ✅ Filter & sort on collection page
- ✅ Review display (rating bars + individual reviews)
- ✅ Trust badges throughout
- ✅ Sticky policy sidebar navigation
- ✅ Shipping rate table
- ✅ SEO meta tags (OG + Twitter)
- ✅ Theme editor customizable settings
