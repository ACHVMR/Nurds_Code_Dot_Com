# 🎨 Nurds Code Asset Manifest
**Updated:** 2025-10-31  
**Structure:** Organized by type and usage

---

## 📁 Directory Structure

```
public/assets/
├── characters/
│   ├── acheevy-mascot-poses/
│   │   ├── acheevy-plug-me-in.png (neon plug visual)
│   │   ├── acheevy-plug-me-in-heavy.png (alternative)
│   │   ├── acheevy-deploying.png (with tablet)
│   │   ├── acheevy-portal.png (pointing out)
│   │   └── acheevy-confident.png (arms crossed)
│   │
│   ├── house-of-ang/
│   │   ├── boomer-ang-default.png (ACHEEVY branded)
│   │   ├── boomer-ang-confident.png (arms crossed)
│   │   ├── boomer-ang-deploying.png (with tablet/laptop)
│   │   └── boomer-ang-mascot.png (stylized version)
│   │
│   └── developers/
│       ├── dev-foster-develop.png (FOSTER DEVELOP wall - NURD theme)
│       ├── dev-skateboard.png (skateboarding scene - MADE IN PLR)
│       ├── dev-glasses.png (real photo developer)
│       └── dev-workspace.png (developer at desk scene)
│
├── logos/
│   ├── made-in-plr.svg (footer logo - centered)
│   ├── nurd-drip-hero.svg (subscription hero)
│   ├── nurd-tagline-sticker.png ("I'm cool like that")
│   └── nurds-code-badge.svg
│
├── plugs/
│   ├── plug-neon-curve.png (3D neon glowing plug)
│   ├── plug-energy-socket.png (socket with lightning)
│   ├── plug-circuit-heavy.png (circuit board plug - HEAVY branding)
│   └── plug-examples/
│       ├── plug-chatbot.png
│       ├── plug-api.png
│       ├── plug-form.png
│       └── plug-dashboard.png
│
└── illustrations/
    ├── house-of-ang-hero.png (hero for agent builder rebrand)
    ├── nurd-where-upskilling-awesome.png (tagline graphic)
    └── plug-store-background.png (marketplace theme)
```

---

## 🖼️ Asset Usage Guide

### 1. Footer (`src/components/Footer.jsx`)
- **Logo:** `public/assets/logos/made-in-plr.svg`
- **Placement:** Centered, next to "Nurds Code est. 2025"
- **Size:** 40-50px height
- **Link:** Optional (can link to PLR site)

```jsx
<div className="flex items-center justify-center gap-4">
  <img src="/assets/logos/made-in-plr.svg" alt="Made in PLR" className="h-10" />
  <span>Nurds Code est. 2025</span>
</div>
```

### 2. Subscribe Page (`src/pages/Subscribe.jsx`)
- **Hero Image:** `public/assets/logos/nurd-drip-hero.svg`
- **Placement:** Full hero section at top
- **Purpose:** Dramatic entry point for subscription tier selection
- **Effect:** Glow effect with cyan/purple neon theme

### 3. Agent Builder → House of Ang (`src/pages/AgentBuilder.jsx`)
- **Main Image:** `public/assets/characters/house-of-ang/boomer-ang-confident.png`
- **Rebrand Name:** "House of Ang"
- **Model Name:** "Boomer_Angs"
- **Description:** AI Agent model powering ACHEEVY
- **Tagline:** "Where upskilling becomes awesome"

### 4. Plug Store/Marketplace (`src/pages/Pricing.jsx` or Portal)
- **Hero Image:** `public/assets/plugs/plug-neon-curve.png` or `plug-circuit-heavy.png`
- **Purpose:** Centerpiece for "What Can You Create?"
- **Usage:** Show plug examples around main image
- **Gallery:** Circle of plug examples (chatbot, API, form, dashboard)

### 5. Home Page (`src/pages/Home.jsx`)
- **Developer Image:** `public/assets/developers/dev-foster-develop.png`
- **Skateboard Scene:** `public/assets/developers/dev-skateboard.png`
- **Tagline Sticker:** `public/assets/logos/nurd-tagline-sticker.png`

---

## 🎨 Brand Character Mapping

### ACHEEVY (Current Mascot)
- **Role:** AI Assistant/Helper
- **Appearance:** Neon suit, visor, tech-forward
- **Used In:** Editor, Chat, Voice interactions
- **Assets:** `public/assets/characters/acheevy-mascot-poses/`

### Boomer_Angs (AI Agent Model)
- **Role:** Universal AI Agent framework
- **Rebrand:** "House of Ang"
- **Model:** Powers ACHEEVY and Portal collaboration
- **Assets:** `public/assets/characters/house-of-ang/`
- **Page:** AgentBuilder → "House of Ang"

### Developer Characters
- **Role:** Relatable user personas
- **Styles:** Illustrated + realistic photos
- **Used In:** Home, onboarding, marketing
- **Assets:** `public/assets/developers/`

### Plug Visuals
- **Role:** Represent customizable capabilities
- **Style:** 3D neon/circuit board aesthetic
- **Used In:** Plug Store, Pricing, Portal
- **Assets:** `public/assets/plugs/`

---

## 📐 Image Specifications

### Logo Sizes
- **Footer Logo (Made in PLR):** 40-50px height, SVG preferred
- **NURD Drip (Subscribe Hero):** Full viewport width, max-width 800px at center
- **Tagline Stickers:** 120-150px width

### Character Images
- **Standard Character:** 400-600px width for hero sections
- **Mascot Poses:** 200-300px for inline usage
- **Full Body:** Transparent background (PNG)

### Plug Images
- **Featured Plug:** 500-800px for centerpiece
- **Gallery Plugs:** 200-300px for grid layout
- **Icon Plugs:** 100-150px for navigation

---

## 🎯 Page Asset Mapping

| Page | Hero Asset | Secondary Assets | Purpose |
|------|-----------|-----------------|---------|
| Home | dev-foster-develop.png | nurd-tagline-sticker.png | Onboarding, inspiration |
| Subscribe | nurd-drip-hero.svg | (none) | Dramatic tier selection |
| Pricing | plug-neon-curve.png | plug examples (4x) | "What can you create?" |
| AgentBuilder | boomer-ang-confident.png | house-of-ang-hero.png | Rebrand to "House of Ang" |
| Editor | acheevy-deploying.png | (dynamic) | AI assistant context |
| Admin | (dashboard theme) | (varied) | System admin area |
| NURD Portal | nurd-where-upskilling.png | plug-examples | Portal introduction |

---

## 🚀 Implementation Checklist

### Step 1: Asset Organization ✅
- [x] Create `/public/assets/` directory structure
- [ ] Copy/move all brand images to appropriate folders
- [ ] Rename images for consistency

### Step 2: Footer Update
- [ ] Update Footer.jsx with Made in PLR logo
- [ ] Center logo with "Nurds Code est. 2025"
- [ ] Add hover effect

### Step 3: Subscribe Page Rebrand
- [ ] Replace Subscribe.jsx hero with NURD Drip
- [ ] Update heading/tagline
- [ ] Add neon glow effect

### Step 4: AgentBuilder → House of Ang
- [ ] Rename page heading to "House of Ang"
- [ ] Update tagline: "Where upskilling becomes awesome"
- [ ] Add AI Agent model info: "Powered by Boomer_Angs"
- [ ] Replace hero image with Boomer_Angs character
- [ ] Update description text

### Step 5: Plug Centerpiece
- [ ] Create plug showcase component
- [ ] Feature plug-neon-curve.png as centerpiece
- [ ] Circle 4 example plugs around it (chatbot, API, form, dashboard)
- [ ] Add caption: "What Can You Create?"

### Step 6: Home Page Updates
- [ ] Add dev-foster-develop.png hero
- [ ] Add skateboard scene illustration
- [ ] Integrate tagline sticker

### Step 7: Testing & Polish
- [ ] Test all images responsive
- [ ] Verify glow effects work
- [ ] Check mobile layout
- [ ] Ensure brand consistency

---

## 🎨 Design Specifications

### Color Palette (Reference)
- **Primary Neon:** Cyan (#39FF14)
- **Accent Neon:** Purple (#D946EF)
- **Dark Background:** Slate-950 (#0F172A)
- **Gold Accent:** Orange (#EA8C55 - from Boomer_Angs helmet)

### Typography
- **Headings:** Bold, uppercase where appropriate
- **Taglines:** Italic, neon green highlight
- **Body:** Clean sans-serif (Tailwind default)

### Effects
- **Glow:** drop-shadow with cyan/purple (2-4px blur)
- **Neon:** text-shadow with matching color
- **Hover:** Scale 1.05, brightness increase

---

## 📱 Responsive Behavior

### Desktop (1024px+)
- Full-size hero images
- Side-by-side layouts
- Large character displays

### Tablet (768px-1023px)
- Medium hero images
- Stacked layouts
- Scaled-down characters

### Mobile (< 768px)
- Optimized hero crops
- Full-width images
- Smaller character sizes

---

## 🔗 Asset Reference URLs

All images located at:
- `/public/assets/characters/`
- `/public/assets/logos/`
- `/public/assets/plugs/`
- `/public/assets/illustrations/`
- `/public/assets/developers/`

Import in React:
```jsx
import acheevy from '/assets/characters/acheevy-deploying.png';
import madeInPLR from '/assets/logos/made-in-plr.svg';
import plug from '/assets/plugs/plug-neon-curve.png';
```

Or use directly:
```jsx
<img src="/assets/logos/made-in-plr.svg" alt="Made in PLR" />
```

---

**Status:** Asset structure ready  
**Next:** Copy images to folders and update components
