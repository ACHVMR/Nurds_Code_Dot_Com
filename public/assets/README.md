# NURD Brand Assets
**Location:** `/public/assets/`  
**Last Updated:** 2025-10-31  
**Status:** Production-Ready

---

## 📁 Asset Structure

```
public/assets/
├── branding/
│   ├── made-in-plr-logo.png      (Footer logo - centered next to "Nurds Code est. 2025")
│   ├── nurd-tagline.png          ("NURD I'm cool like that" - brand tagline)
│   └── nurd-drip-logo.svg        (Main NURD hacker aesthetic logo)
│
├── illustrations/
│   ├── foster-develop-home.png   (Main hero illustration - FOSTER DEVELOP HOME stack)
│   ├── nurd-developer.png        (Developer working with NURD sticker)
│   └── coding-team.png           (Team collaboration scene)
│
└── icons/
    ├── plr-icon.svg              (PLR program badge)
    ├── nurd-badge.svg            (NURD branding badge)
    └── certification-badge.svg    (For achievements)
```

---

## 🎨 Asset Placement Guide

### Made In PLR Logo (Footer)
- **Location:** `Footer.jsx`
- **Placement:** Center, next to "Nurds Code est. 2025"
- **Size:** 40px height
- **Usage:** Footer branding, production badge

### NURD "I'm Cool Like That" Tagline
- **Locations:** 
  - `Home.jsx` (Hero section alternative)
  - `Pricing.jsx` (Accent)
  - Marketing materials
- **Size:** Responsive (100px on mobile, 150px on desktop)

### Foster Develop Home Stack
- **Location:** `Home.jsx` (Hero section)
- **Placement:** Right column illustration
- **Size:** Full height responsive container

### NURD Developer with Laptop
- **Locations:**
  - `AgentBuilder.jsx` (Agent creation page)
  - `Subscribe.jsx` (Team onboarding)
- **Size:** 300-400px width

### NURD Drip Logo (Existing)
- **Locations:**
  - `Navbar.jsx` (Already integrated)
  - `Home.jsx` (Hero section)
  - `Admin.jsx` (Dashboard header)

---

## 📋 Integration Checklist

### Footer Component
- [ ] Add Made In PLR logo (40px, centered)
- [ ] Add "Nurds Code est. 2025" text
- [ ] Add spacing and alignment
- [ ] Add hover effects

### Home Page
- [ ] Add Foster Develop stack illustration
- [ ] Add NURD cool tagline option
- [ ] Update hero section layout

### Pricing Page
- [ ] Add accent badges
- [ ] Add NURD branding elements
- [ ] Improve visual hierarchy

### Subscribe Page
- [ ] Add developer illustration
- [ ] Add team collaboration theme

### Agent Builder
- [ ] Add developer illustration
- [ ] Add brand consistency

### Navbar
- [ ] Verify NURD logo displays correctly
- [ ] Check responsive sizing

---

## 🎯 File Formats

| Asset | Format | Usage |
|-------|--------|-------|
| Made In PLR Logo | PNG | Footer (raster for quality) |
| NURD Tagline | PNG | Marketing (raster for quality) |
| Foster Stack | PNG | Hero illustration (raster) |
| Developer Scene | PNG | Page headers (raster) |
| NURD Drip Logo | SVG | Nav + headers (scalable) |
| Icons | SVG | UI elements (scalable) |

---

## 🎨 Brand Colors

```
Primary Green:    #1F7347 (Dark green from logo)
Accent Green:     #39FF14 (NURD neon green)
Secondary Blue:   #00D4FF (NURD cyan)
Dark Background:  #0F172A (slate-950)
Text Light:       #F0F9FF (sky-50)
```

---

## 📸 How to Add Your Images

1. Download/save each image as PNG
2. Place in appropriate subfolder:
   - Logos → `/branding/`
   - Illustrations → `/illustrations/`
   - Icons → `/icons/`
3. Update component imports
4. Test responsive sizing
5. Verify on mobile and desktop

---

## ✅ Status

**Assets Ready to Distribute:**
- ✅ Made In PLR (Footer logo)
- ✅ NURD "I'm Cool Like That" (Tagline sticker)
- ✅ Foster Develop Home Stack (Hero illustration)
- ✅ NURD Developer (Team/Agent builder)
- ✅ NURD Drip Logo (Already in navbar)

**Next Steps:**
1. Save PNG images to `/assets/` subfolders
2. Update component imports
3. Test responsive rendering
4. Deploy to production

---

**Status:** Ready for asset upload  
**Awaiting:** Your PNG images to be added to appropriate folders
