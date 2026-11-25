Follow DESIGN.md for all colours, type, spacing, radius, motion and icons.

# NexaHR Design System & Brand Identity Specification

**Version:** 1.0.0 (Phase 1 Global Tokens)  
**Target:** NexaHR Enterprise Human Resource Management & Payroll System  
**Philosophy:** Human-crafted, intentional, executive-grade enterprise software. Purposefully designed to eliminate generic, templated "AI-generated" aesthetics (neon glows, purple gradients, symmetrical 3-card grids, emojis as icons, uniform padding, and default Inter typography).

---

## 1. Brand Essence & Core Tenets

NexaHR is a mission-critical enterprise platform managing human capital, biometric attendance telemetry, payroll disbursement, and ATS recruitment pipelines. Its interface communicates institutional reliability, precision data handling, and understated warmth.

### The 6 Anti-AI Rules
1. **No gradient text or purple-to-blue hero gradients.** Use flat, solid brand colours for headings. Gradients are prohibited on typography and expansive card surfaces.
2. **No centered-hero-plus-three-cards defaults.** Employ asymmetry: left-aligned headers, lead metric emphasis (unequal card proportions), and structured data density.
3. **Real visual hierarchy.** Vary size, weight, and density deliberately. Reject identical card padding and uniform radii.
4. **Strict icon standards (Lucide only).** Emojis are never used as interface icons. All icons adhere to stroke-width 1.75 in 16px, 20px, or 24px frames.
5. **Distinct typographic voice.** Bricolage Grotesque for headings paired with Instrument Sans for body and UI controls. Tabular numbers enforced on all numerical data.
6. **Purposeful, subtle motion.** Micro-interactions ease over 150–250ms with a single calibrated curve (`cubic-bezier(0.16, 1, 0.3, 1)`). No neon glows, floating card translate leaps, or snapping state changes. Respect `prefers-reduced-motion`.

---

## 2. Color Palette & Token Architecture

All colors are rooted in an authoritative **Deep Teal** brand anchor paired with **Warm Slate** neutrals and a high-contrast **Amber** accent.

### 2.1 Primary Brand Scale (Deep Teal `#0F766E` / teal-700)
| Token | Hex Value | Role |
| :--- | :--- | :--- |
| `primary-50` | `#F0FDFA` | Lightest surface tint, active table row, subtle tag background |
| `primary-100` | `#CCFBF1` | Soft badge background, selected item container |
| `primary-200` | `#99F6E4` | Border for active components, subtle hover highlight |
| `primary-300` | `#5EEAD4` | Interactive link hover, focused borders |
| `primary-400` | `#2DD4BF` | Dark mode primary brand text & icons (WCAG AA on `#16211E`) |
| `primary-500` | `#14B8A6` | Dark mode interactive button fill, active tab indicator |
| `primary-600` | `#0D9488` | Hover state for primary buttons in light mode |
| `primary-700` | `#0F766E` | **Brand Anchor Colour**: Primary buttons, main active nav, key brands |
| `primary-800` | `#115E59` | Active press state for primary buttons, deep headings |
| `primary-900` | `#134E4A` | High-contrast text on teal-50 tints |
| `primary-950` | `#042F2E` | Dark mode deep teal container base |

### 2.2 Ink & Warm Neutrals (Warm Slate Scale)
Cool blue-gray (slate-500/slate-900) has been replaced with a warm slate scale with olive/sand undertones to feel grounded and physical rather than digital-cold.

| Token | Hex Value | Role |
| :--- | :--- | :--- |
| `neutral-50` | `#F6F5F1` | **Page Background (Light)**: Warm off-white |
| `neutral-100` | `#ECEAE4` | Inset backgrounds, search bars, table header backgrounds |
| `neutral-200` | `#E2E0D8` | **Border Default (Light)**: Subtle structural borders, card dividers |
| `neutral-300` | `#C7C5BB` | Hover borders, disabled element borders |
| `neutral-400` | `#909895` | Placeholder text, inactive tab text |
| `neutral-500` | `#5B6663` | **Muted Text (Light)**: Secondary labels, metadata (WCAG AA 5.3:1) |
| `neutral-600` | `#434D4A` | Medium-emphasis text, form field labels |
| `neutral-700` | `#2E3634` | Subheadings, section titles |
| `neutral-800` | `#1C2321` | **Body Text (Light)**: High readability charcoal ink (WCAG AA 15:1) |
| `neutral-900` | `#141A18` | Deepest surface for dark accents, tooltips |
| `neutral-950` | `#0F1715` | **Page Background (Dark)**: Deep warm charcoal |

### 2.3 Accent Scale (Amber `#D97706`)
*Rule: Used strictly as a FILL with dark ink text on top (`#1C2321`) or high-contrast button fills. Never use raw amber text on a white surface (it fails WCAG AA).*

| Token | Hex Value | Role |
| :--- | :--- | :--- |
| `accent-50` | `#FFFBEB` | Light highlight tint |
| `accent-100` | `#FEF3C7` | Notice background |
| `accent-200` | `#FDE68A` | Soft tag background |
| `accent-400` | `#FBBF24` | Dark mode focus indicator |
| `accent-500` | `#F59E0B` | **Dark Mode Accent Fill** (AI High Score Badge) |
| `accent-600` | `#D97706` | **Light Mode Accent Anchor**: Key highlight badge fill |
| `accent-700` | `#B45309` | Hover state for accent buttons |
| `accent-800` | `#92400E` | High-contrast accessible text on amber-100 |

### 2.4 Semantic Color System
| Semantic | Light Fill / Bg | Text on White / Light | Dark Mode Fill | Dark Mode Text | Contrast Ratio |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Success** | `#DCFCE7` (green-100) | `#15803D` (green-700) | `#052E16` (green-950) | `#4ADE80` (green-400) | > 5.1:1 (AA) |
| **Warning** | `#FEF3C7` (amber-100) | `#92400E` (amber-800) | `#451A03` (amber-950) | `#FBBF24` (amber-400) | > 5.5:1 (AA) |
| **Danger** | `#FEE2E2` (rose-100) | `#B91C1C` (rose-700) | `#4C0519` (rose-950) | `#F87171` (rose-400) | > 5.0:1 (AA) |
| **Info** | `#E0F2FE` (sky-100) | `#0369A1` (sky-700) | `#082F49` (sky-950) | `#38BDF8` (sky-400) | > 5.4:1 (AA) |

### 2.5 Dark Mode Architecture
Dark mode avoids pure black (`#000000`) and cool navy (`#0B132B`). It uses warm charcoal tones derived from the warm slate scale:
- **Dark Page Background:** `#0F1715`
- **Dark Card Surface:** `#16211E`
- **Dark Elevated Surface (Modals, Popovers):** `#1D2C28`
- **Dark Inset Surface (Inputs, Inset Wells):** `#111A18`
- **Dark Border:** `#273834`
- **Dark Primary Text:** `#F1F5F4` (Contrast 14.1:1 against `#16211E`)
- **Dark Muted Text:** `#8B9A96` (Contrast 4.8:1 against `#16211E`)
- **Dark Brand Accent:** `#2DD4BF` (Teal 400) for high-contrast interactive states.

---

## 3. Typography System

The typographic pairing balances crisp character geometry in headings with high-speed data scannability in UI components.

### 3.1 Font Family Declarations
```css
/* Self-hosted via npm @fontsource-variable packages */
--font-heading: 'Bricolage Grotesque Variable', 'Bricolage Grotesque', system-ui, -apple-system, sans-serif;
--font-sans: 'Instrument Sans Variable', 'Instrument Sans', system-ui, -apple-system, sans-serif;
```
- **Heading Font:** **Bricolage Grotesque** (Weights: 600 SemiBold, 700 Bold). Used on all headings, page titles, card headers, and stat displays.
- **Body Font:** **Instrument Sans** (Weights: 400 Regular, 500 Medium, 600 SemiBold). Used on all paragraph copy, table data, inputs, labels, and navigation links.
- **Tabular Numbers Mandate:** All numeric data (attendance stamps, salary calculations, candidate counts, percentages, sparkline tooltips) MUST employ `font-variant-numeric: tabular-nums` (class: `tabular-nums` / `font-tabular`).

### 3.2 Type Scale Specification
| Level | Font Family | Size | Weight | Line Height | Tracking | Usage |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | Bricolage Grotesque | 32px (2.0rem) | 700 Bold | 1.15 | -0.025em | Landing hero headline, KPI lead counter |
| **H1** | Bricolage Grotesque | 24px (1.5rem) | 700 Bold | 1.20 | -0.02em | Main page headers (`AppPageHeader`) |
| **H2** | Bricolage Grotesque | 18px (1.125rem)| 600 SemiBold | 1.25 | -0.015em | Major section headers, modal titles |
| **H3** | Bricolage Grotesque | 15px (0.9375rem)| 600 SemiBold | 1.35 | -0.01em | Card titles, drawer subheadings |
| **H4** | Bricolage Grotesque | 13px (0.8125rem)| 600 SemiBold | 1.40 | -0.005em | Group headers, table column headers |
| **Body** | Instrument Sans | 13px (0.8125rem)| 400/500 | 1.50 | 0.0em | Primary paragraphs, form fields, table cells |
| **Small** | Instrument Sans | 12px (0.75rem) | 500 Medium | 1.45 | 0.005em | Input helper text, metadata badges, subtext |
| **Caption** | Instrument Sans | 11px (0.6875rem)| 600 SemiBold | 1.35 | 0.02em | Badges, status chips, micro-labels |

---

## 4. Radius Scale (Strict 3-Tier Rule)

To abolish the generic "pill everything" and `rounded-3xl` AI look, the interface restricts corner rounding to exactly 3 functional tiers:

| Tier | Value | CSS Token | Class | Permitted Components |
| :--- | :--- | :--- | :--- | :--- |
| **Controls** | **8px** | `--radius-control: 8px` | `rounded-[8px]` / `rounded-md` | Buttons, Inputs, Selects, Badges, Filter chips, Dropdown menu items, Action buttons |
| **Cards** | **14px** | `--radius-card: 14px` | `rounded-[14px]` | Standard Metric Cards, Kanban candidate cards, Table container wrappers, Panels |
| **Surfaces**| **20px** | `--radius-surface: 20px` | `rounded-[20px]` | Modals, Slide-over Drawers, App Navigation Sidebar container |

*Rule:* Full pills (`rounded-full`) are strictly reserved for circular avatar frames, pulse dots, and compact numerical count indicators. Do NOT use `rounded-3xl` (24px) or custom 28px/32px/40px.

---

## 5. Spacing, Layout & Density Principles

### 5.1 4px Base Grid
All margins, padding, gaps, and component heights adhere to 4px multiples:
- Micro: 4px (`p-1`), 8px (`p-2`), 12px (`p-3`)
- Standard: 16px (`p-4`), 20px (`p-5`), 24px (`p-6`)
- Macro: 32px (`p-8`), 40px (`p-10`), 48px (`p-12`)

### 5.2 Density Hierarchy
1. **High Density (Data Tables, Kanban Pipeline, Attendance Logs):**
   - Compact vertical rhythm: `py-2.5 px-3` per cell.
   - Reduced font size (12px/13px) with tabular numbers.
   - Explicit row borders (`border-b border-neutral-200 dark:border-neutral-800`).
2. **Medium Density (Card Grids, Settings Panels):**
   - Internal padding: `p-4 sm:p-5`.
   - Grid gap: `gap-4 sm:gap-5`.
3. **Low Density (Page Summaries, Hero Banners):**
   - Padding: `p-6 sm:p-8`.
   - Structural gap: `gap-6`.

### 5.3 Asymmetric Layouts vs. Symmetrical 3-Card Defaults
- **Never default to a row of 3 or 4 identical boxes.**
- **Lead Metric Pattern:** In summary areas, feature 1 primary lead card (taking 40–50% width or distinctive visual weight, such as headcount or active payroll spend) flanked by supporting secondary metrics.
- **Left-Aligned Hierarchy:** All page titles, section titles, and modal headers are strictly left-aligned. Centered hero text is prohibited outside public marketing splash pages.

---

## 6. Elevation & Motion System

### 6.1 Shadow Scale (No Glowing Halos)
Drop shadows are neutral, subtle, and warm:
```css
/* Token definitions */
--shadow-subtle: 0 1px 3px rgba(20, 26, 24, 0.05), 0 1px 2px rgba(20, 26, 24, 0.03);
--shadow-elevated: 0 4px 12px rgba(20, 26, 24, 0.07), 0 2px 4px rgba(20, 26, 24, 0.04);
--shadow-drawer: 0 12px 32px rgba(20, 26, 24, 0.12), 0 4px 8px rgba(20, 26, 24, 0.06);
```
- **Subtle (`--shadow-subtle`):** Base state for cards and inputs.
- **Elevated (`--shadow-elevated`):** Hover states for cards, active dropdown menus, popovers.
- **Drawer (`--shadow-drawer`):** Modals, side-sheet slideover drawers.
- **Glow Ban:** No `shadow-blue-500/25` or `shadow-sky-400/40` ambient neon glows.

### 6.2 Motion & Easing
```css
--ease-brand: cubic-bezier(0.16, 1, 0.3, 1); /* Ease Out Expo */
--duration-fast: 150ms;   /* Button hover/active, checkbox toggles */
--duration-normal: 250ms; /* Drawers, tab switches, modal entrance */
```
- Interactive states shift **border color and elevation**, not translation distance (`hover:-translate-y-1` is banned).
- Motion respects system accessibility settings:
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 7. Iconography Specification

- **Library:** `lucide-react` exclusively.
- **Stroke Width:** `1.75` for all icons (consistent, crisp, avoiding heavy 2.0 or 2.5 chunks).
- **Standard Sizes:**
  - `16px` (`w-4 h-4`): Table actions, inline text icons, button icons.
  - `20px` (`w-5 h-5`): Navigation bar, card header primary icons.
  - `24px` (`w-6 h-6`): Modal header hero icons, empty state illustrations.
- **Emoji Ban:** Under no circumstance should Unicode emojis (`🎉`, `💼`, `🛡️`, `💰`) be used as interface icons. Replace with semantic Lucide equivalents (`PartyPopper`, `Briefcase`, `ShieldCheck`, `DollarSign`, `Award`).

---

## 8. AI Score Badge Specification

The AI Candidate Screening score badge is an intentional accent highlight:

| Threshold | Rating | Light Mode Styling | Dark Mode Styling | Contrast |
| :--- | :--- | :--- | :--- | :--- |
| **>= 85** | High Match | `bg-amber-500 text-[#1C2321] border border-amber-600/40` | `bg-amber-400 text-[#0F1715] border border-amber-300/40` | > 6.0:1 (AA) |
| **70 – 84**| Passing | `bg-teal-700 text-white border border-teal-800` | `bg-teal-600 text-white border border-teal-500/40` | > 4.7:1 (AA) |
| **< 70** | Review / Low | `bg-[#ECEAE4] text-[#1C2321] border border-[#E2E0D8]` | `bg-[#273834] text-[#F1F5F4] border border-[#384E48]` | > 10:1 (AA) |

- **Shape:** `rounded-[8px]` (control radius), `px-2 py-0.5`, `text-[11px] font-bold`.
- **Icon:** Lucide `Sparkles` (`w-3 h-3 stroke-[1.75]`).
- **Numbers:** Tabular nums enforced.

---

## 9. Comprehensive Do / Don't Checklist

| Category | DO | DON'T |
| :--- | :--- | :--- |
| **Colors** | Use solid Deep Teal (`#0F766E`) for primary elements and warm slate for text. | Don't use purple-to-blue gradients (`from-sky to-blue`, `from-indigo to-purple`). |
| **Headings**| Use solid ink or brand teal with Bricolage Grotesque font. | Don't use `bg-clip-text text-transparent` gradient headings. |
| **Banners** | Use flat, warm tinted surfaces (`bg-teal-50/60`, `border-teal-200/80`). | Don't place `blur-3xl` ambient glow bubbles behind hero sections. |
| **Layout** | Structure asymmetrical metric headers (1 lead card + secondary cards). | Don't default to 3 or 4 identical square cards with centered icons. |
| **Corner Radius** | Use strictly 8px (controls), 14px (cards), and 20px (surfaces). | Don't slap `rounded-3xl` (24px) or `rounded-[32px]` on everything. |
| **Icons** | Use Lucide icons with stroke width 1.75. | Don't use Unicode emojis as UI icons in menus, selects, or tables. |
| **Motion** | Eased color and subtle shadow transitions (150–250ms). | Don't use bouncy `hover:-translate-y-1` or `scale-105` snapping jumps. |
| **Contrast** | Use Amber as a FILL with dark text (`#1C2321`). | Don't use amber or yellow as raw small text on white backgrounds. |
| **Numbers** | Add `tabular-nums` on all metrics, timestamps, and payroll tables. | Don't let numbers jitter with variable-width sans figures. |

---

*This document is the authoritative design contract for all NexaHR user interface engineering.*

