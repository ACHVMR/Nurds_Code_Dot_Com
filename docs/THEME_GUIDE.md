# Nurds Code Design System - Theme Guide

## Official Brand Colors

This document defines the official Nurds Code Dark Theme colors. All UI components should use these colors for consistency across the platform.

---

## Color Palette

### Primary Colors

| Color Name | Hex Code | RGB | Usage |
|-----------|----------|-----|-------|
| **Neon Cyan** | `#00E5FF` | rgb(0, 229, 255) | Primary accent, buttons, links, focus states |
| **Neon Orange** | `#FF5E00` | rgb(255, 94, 0) | Secondary accent, alerts, warnings, CTAs |
| **Neon Green** | `#00FF41` | rgb(0, 255, 65) | Success states, terminal output, code highlights |

### Background Colors

| Color Name | Hex Code | RGB | Usage |
|-----------|----------|-----|-------|
| **Obsidian Black** | `#0A0A0A` | rgb(10, 10, 10) | Main background |
| **Surface** | `#111111` | rgb(17, 17, 17) | Cards, panels |
| **Elevated** | `#161616` | rgb(22, 22, 22) | Modals, tooltips, popovers |

### Text Colors

| Color Name | Hex Code | RGB | Usage |
|-----------|----------|-----|-------|
| **Text Primary** | `#FFFFFF` | rgb(255, 255, 255) | Headings, important text |
| **Text Secondary** | `#999999` | rgb(153, 153, 153) | Body text, descriptions |
| **Text Muted** | `#555555` | rgb(85, 85, 85) | Placeholders, disabled text |

### Border Colors

| Color Name | Hex Code | RGBA | Usage |
|-----------|----------|------|-------|
| **Border Default** | `#282828` | rgba(255, 255, 255, 0.1) | Default borders |
| **Border Focus** | `rgba(0, 229, 255, 0.3)` | - | Focus/active borders |

---

## Glow Effects

### Box Shadows

```css
/* Cyan Glow */
box-shadow: 0 0 20px rgba(0, 229, 255, 0.5);

/* Orange Glow */
box-shadow: 0 0 20px rgba(255, 94, 0, 0.5);

/* Green Glow */
box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
```

### Usage Examples

```css
/* Primary Button */
.btn-primary {
  background: #00E5FF;
  color: #0A0A0A;
  box-shadow: 0 0 20px rgba(0, 229, 255, 0.5);
}

/* Alert Button */
.btn-alert {
  background: #FF5E00;
  color: #FFFFFF;
  box-shadow: 0 0 20px rgba(255, 94, 0, 0.5);
}

/* Success State */
.status-success {
  color: #00FF41;
  border: 1px solid #00FF41;
  box-shadow: 0 0 10px rgba(0, 255, 65, 0.3);
}
```

---

## Typography

### Font Families

| Font | Usage | Fallback |
|------|-------|----------|
| **Inter** | Body text, UI | `ui-sans-serif, system-ui` |
| **JetBrains Mono** | Code, terminal, monospace | `monospace` |
| **Orbitron** | Headings, brand (Flutter) | `sans-serif` |
| **Rajdhani** | Body text (Flutter) | `sans-serif` |

### Font Sizes (Tailwind Scale)

```js
{
  'xs': '0.75rem',   // 12px
  'sm': '0.875rem',  // 14px
  'base': '1rem',    // 16px
  'lg': '1.125rem',  // 18px
  'xl': '1.25rem',   // 20px
  '2xl': '1.5rem',   // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem',  // 36px
}
```

---

## Tailwind Configuration

### Using Colors in Tailwind

```jsx
// Text
<p className="text-neon-cyan">Cyan text</p>
<p className="text-neon-orange">Orange text</p>
<p className="text-neon-green">Green text</p>

// Backgrounds
<div className="bg-background">Obsidian background</div>
<div className="bg-surface">Surface background</div>

// Borders
<div className="border border-cyan-glow">Cyan border</div>

// Shadows
<button className="shadow-neon-cyan">Cyan glow</button>
<button className="shadow-neon-orange">Orange glow</button>
```

### CSS Variables

```css
:root {
  /* Primary Brand Colors */
  --neon-cyan: #00E5FF;
  --neon-orange: #FF5E00;
  --neon-green: #00FF41;

  /* Backgrounds */
  --bg-primary: #0A0A0A;
  --bg-secondary: #111111;
  --bg-surface: #161616;

  /* Text */
  --text-primary: #FFFFFF;
  --text-secondary: #999999;
  --text-muted: #555555;

  /* Glows */
  --cyan-glow: rgba(0, 229, 255, 0.3);
  --orange-glow: rgba(255, 94, 0, 0.3);
  --neon-glow: rgba(0, 255, 65, 0.25);
}
```

---

## Flutter Theme (Dart)

```dart
// app_theme.dart
class AppTheme {
  static const Color obsidian = Color(0xFF0A0A0A);
  static const Color neonCyan = Color(0xFF00E5FF);
  static const Color neonOrange = Color(0xFFFF5E00);
  static const Color terminalGreen = Color(0xFF00FF41);

  static ThemeData get darkTheme {
    return ThemeData.dark().copyWith(
      scaffoldBackgroundColor: obsidian,
      primaryColor: neonCyan,
      colorScheme: ColorScheme.dark(
        primary: neonCyan,
        secondary: neonOrange,
        tertiary: terminalGreen,
        surface: Color(0xFF111111),
      ),
    );
  }
}
```

---

## Semantic Color Usage

### When to Use Each Color

#### Neon Cyan (#00E5FF)
- **Primary CTAs**: "Get Started", "Sign Up", "Deploy"
- **Interactive elements**: Buttons, links, tabs
- **Focus states**: Input borders, active navigation
- **Brand elements**: Logo accent, hero sections

#### Neon Orange (#FF5E00)
- **Alerts & Warnings**: Error states, important notices
- **Secondary CTAs**: "Learn More", "Cancel", "Delete"
- **Hot features**: New badges, trending items
- **Highlights**: Selected items, emphasized text

#### Neon Green (#00FF41)
- **Success states**: Completed actions, confirmations
- **Code elements**: Syntax highlighting, terminal output
- **Status indicators**: Online, active, running
- **Data visualization**: Positive metrics, growth

---

## Accessibility

### Contrast Ratios (WCAG AA)

| Foreground | Background | Ratio | Pass |
|-----------|------------|-------|------|
| Neon Cyan | Obsidian | 7.2:1 | ✅ AAA |
| Neon Orange | Obsidian | 4.8:1 | ✅ AA |
| Neon Green | Obsidian | 12.1:1 | ✅ AAA |
| White | Obsidian | 19.5:1 | ✅ AAA |

### Recommendations

- Use **Neon Cyan** or **Neon Green** for text on dark backgrounds
- Use **Obsidian** or **White** text on Neon Orange backgrounds
- Avoid using Neon Orange for small text (< 14px)
- Always test with accessibility tools

---

## Animation Guidelines

### Hover Effects

```css
/* Button Hover */
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px var(--cyan-glow);
  transition: all 0.2s ease;
}

/* Glow Pulse */
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 10px var(--cyan-glow); }
  50% { box-shadow: 0 0 30px var(--cyan-glow); }
}

.glow-animate {
  animation: glow-pulse 2s ease-in-out infinite;
}
```

### Focus Rings

```css
/* Accessible Focus */
input:focus,
button:focus {
  outline: 2px solid var(--neon-cyan);
  outline-offset: 2px;
  box-shadow: 0 0 10px var(--cyan-glow);
}
```

---

## Components Examples

### Primary Button

```jsx
<button className="
  bg-neon-cyan
  text-background
  px-6 py-3
  rounded-lg
  font-mono
  font-bold
  shadow-neon-cyan
  hover:shadow-neon-cyan
  hover:-translate-y-1
  transition-all
">
  Deploy Now
</button>
```

### Card

```jsx
<div className="
  bg-surface
  border border-white/10
  rounded-xl
  p-6
  hover:border-neon-cyan/30
  transition-colors
">
  <h3 className="text-neon-cyan font-mono text-xl mb-2">
    Project Name
  </h3>
  <p className="text-text-secondary">
    Description goes here...
  </p>
</div>
```

### Alert (Warning)

```jsx
<div className="
  bg-surface
  border-l-4 border-neon-orange
  p-4
  shadow-neon-orange
">
  <p className="text-neon-orange font-mono">
    ⚠️ Warning: High token usage detected
  </p>
</div>
```

---

## Migration Guide

### Legacy Colors to New Colors

| Old Color | Old Hex | New Color | New Hex |
|-----------|---------|-----------|---------|
| `accent` | `#FFC000` | `neon-cyan` | `#00E5FF` |
| `neon` | `#00FF88` | `neon-green` | `#00FF41` |
| `background` | `#050505` | `background` | `#0A0A0A` |

### Find and Replace

```bash
# Legacy accent color
find . -type f -name "*.css" -exec sed -i 's/#FFC000/#00E5FF/g' {} +
find . -type f -name "*.jsx" -exec sed -i 's/accent-/neon-cyan-/g' {} +

# Legacy neon green
find . -type f -name "*.css" -exec sed -i 's/#00FF88/#00FF41/g' {} +
```

---

## Resources

- **Figma Design Kit**: [Coming Soon]
- **Color Picker**: Use [coolors.co](https://coolors.co/0a0a0a-00e5ff-ff5e00-00ff41) to visualize
- **Accessibility Checker**: [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)

---

## Questions?

For design system questions, open an issue or contact the Nurds Code design team.

**Last Updated**: 2026-01-09
