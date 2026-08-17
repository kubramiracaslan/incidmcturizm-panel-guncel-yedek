TasaT---
name: Inci DMC Corporate Obsidian
colors:
  surface: '#071708'
  surface-dim: '#071708'
  surface-bright: '#003d32'
  surface-container-lowest: '#031105'
  surface-container-low: '#0f1f10'
  surface-container: '#132314'
  surface-container-high: '#1e2e1e'
  surface-container-highest: '#283928'
  on-surface: '#d4e8cf'
  on-surface-variant: '#c0c8c4'
  inverse-surface: '#d4e8cf'
  inverse-on-surface: '#243424'
  outline: '#8b928f'
  outline-variant: '#414845'
  surface-tint: '#a5cfc2'
  primary: '#a5cfc2'
  on-primary: '#0c372d'
  primary-container: '#002d24'
  on-primary-container: '#6d968a'
  inverse-primary: '#3e665b'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#d8c3ad'
  on-tertiary: '#3b2e1f'
  tertiary-container: '#312516'
  on-tertiary-container: '#9e8b77'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c0ecdd'
  primary-fixed-dim: '#a5cfc2'
  on-primary-fixed: '#002019'
  on-primary-fixed-variant: '#264e43'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#f5dfc8'
  tertiary-fixed-dim: '#d8c3ad'
  on-tertiary-fixed: '#251a0b'
  on-tertiary-fixed-variant: '#534433'
  background: '#071708'
  on-background: '#d4e8cf'
  surface-variant: '#283928'
  surface-deep: '#001a15'
  mint-glow: '#34D399'
  sand-light: '#FAF3EB'
typography:
  display-lg:
    fontFamily: Montserrat
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Montserrat
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-md:
    fontFamily: Montserrat
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Montserrat
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Montserrat
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  table-data:
    fontFamily: Montserrat
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-desktop: 32px
  container-max-width: 1440px
  table-cell-padding: 12px 16px
---

## Brand & Style

The design system is engineered for a high-end destination management agency (DMC) portal, prioritizing data density and professional utility. The brand personality is authoritative yet technologically advanced, blending the heritage of luxury travel with the precision of modern SaaS.

The visual style is **Corporate Modern with a Dark Mode focus**. It utilizes a "Deep Sea" palette to create a low-strain environment for travel agents who spend long hours managing bookings. The aesthetic balances professionalism with contemporary flair through subtle glassmorphism on top-level containers and high-precision line work. This ensures that complex information—from flight itineraries to hotel allocations—remains legible and structured.

## Colors

The palette is anchored by a sophisticated "Deep Forest" base. 

- **Primary (#002d24):** Used for navigation sidebars, header backgrounds, and primary structural containers.
- **Secondary (#10B981):** The "Mint" accent used for call-to-actions, status indicators (e.g., "Confirmed"), and active states. It provides high contrast against the dark backgrounds.
- **Tertiary (#F1DBC4):** A "Sand" neutral used sparingly for subtle highlights or secondary text to evoke a sense of travel and warmth without breaking the professional dark theme.
- **Surface Strategy:** Backgrounds utilize `#001a15` for the base canvas, with cards and tables using the Primary `#002d24` to create depth.

## Typography

This design system standardizes on **Montserrat** to maintain brand continuity while projecting a clean, geometric feel. 

- **Hierarchy:** Use bold weights for headers to ensure they pop against dark surfaces. 
- **Data Legibility:** For agent panels, `body-md` and `table-data` are the workhorses. They are sized slightly smaller than consumer apps to maximize the information displayed on a single screen.
- **Technical Accents:** **JetBrains Mono** (or a similar monospace) is used for labels and ID tags (e.g., Booking IDs, PNR codes) to give them a distinct, "system-generated" look that agents can quickly identify.

## Layout & Spacing

The layout follows a **Fixed-Fluid hybrid grid**. The main navigation is a fixed 240px sidebar, while the content area expands to a maximum width of 1440px.

- **8pt Grid System:** All padding and margins are multiples of 4px/8px to ensure mathematical balance.
- **Information Density:** For the agent panel, use a "Compact" spacing model. Vertical padding in tables is reduced to 12px to allow more rows to be visible above the fold.
- **Breakpoints:**
  - **Desktop (Default):** 12-column grid, 16px gutters.
  - **Large Desktop (1440px+):** Centered container with 32px side margins.
  - **Tablet:** Sidebar collapses into a hamburger menu to preserve horizontal space for data tables.

## Elevation & Depth

In this dark-themed system, depth is communicated through **Tonal Elevation** and **Inner Strokes** rather than heavy shadows.

- **Level 0 (Canvas):** The deepest background (`#001a15`).
- **Level 1 (Cards/Tables):** The primary color (`#002d24`) with a subtle 1px border of `#ffffff10` (10% white) to define edges.
- **Level 2 (Modals/Popovers):** A slightly lighter shade with a "Glass" effect (Backdrop blur: 12px) and a more pronounced border.
- **Interaction Shadow:** Active elements use a "Mint Glow"—a soft, 8px blur shadow using the secondary color at 20% opacity—to indicate focus without cluttering the UI.

## Shapes

The design system uses a **Soft (0.25rem)** roundedness approach. This maintains the "corporate" feel by keeping edges relatively crisp, which is more efficient for packing tabular data and grid-based forms.

- **Small Components:** Checkboxes and small tags use `rounded-sm` (2px).
- **Standard Components:** Buttons, inputs, and cards use `rounded-md` (4px).
- **Large Components:** Modals and main dashboard panels use `rounded-lg` (8px).

## Components

### Buttons
- **Primary:** Filled with `#10B981`, text in dark primary color. High contrast for main actions like "Create Booking."
- **Secondary:** Outlined with 1px Mint border. Used for "Cancel" or "Export" functions.
- **Ghost:** Text-only in Tertiary color for low-priority actions.

### Data Tables
- **Header:** Darker than the row background with all-caps `label-sm` typography.
- **Zebra Striping:** Use a 2% lighter tint for alternating rows to aid horizontal tracking.
- **Hover State:** Rows should highlight with a 1px Mint left-border and a subtle background shift.

### Input Fields
- Dark backgrounds with a 1px border. On focus, the border transitions to Mint with a subtle outer glow. 
- Labels are positioned above the field using `label-sm`.

### Cards
- Used for dashboard summaries (e.g., "Total Revenue," "Active Trips"). 
- Should include a small Mint-colored icon in the top right to tie back to the brand.

### Chips & Status Tags
- **Confirmed:** Mint background (20% opacity) with Mint text.
- **Pending:** Sand background (20% opacity) with Sand text.
- **Cancelled:** Subtle Red-tinted background with white text.