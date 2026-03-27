# Design System Strategy: SIKBO Restaurant Intelligence

## 1. Overview & Creative North Star: "The Culinary Architect"
This design system moves beyond the generic SaaS "box-on-box" layout. Our Creative North Star is **The Culinary Architect**. Much like a high-end Michelin-star kitchen, the interface must feel surgically precise yet tangibly organic. We achieve this through "Editorial Asymmetry"—using expansive white space (whitespace as a functional element, not a void) and a sophisticated hierarchy that treats data like a menu: legible, prioritized, and elegant. 

We reject the "Bootstrap" look by eliminating rigid borders and instead using **Tonal Depth** and **Asymmetric Grouping** to guide the eye.

## 2. Colors & Surface Philosophy
The palette is rooted in a deep, authoritative foundation contrasted by airy, translucent layers.

### The "No-Line" Rule
**Strict Mandate:** Designers are prohibited from using 1px solid borders to define sections. 
*   Boundaries must be created through background shifts. For example, a `surface-container-low` (#F1F4F6) dashboard card should sit on a `background` (#F8F9FA) canvas. 
*   Use the Spacing Scale (specifically `spacing.6` or `spacing.8`) to create "void-based separation" instead of lines.

### Surface Hierarchy & Nesting
Treat the UI as a physical stack of materials.
*   **Base Layer:** `surface` (#F8F9FA) - The canvas.
*   **Secondary Content:** `surface-container-low` (#F1F4F6) - Sub-navigation or secondary sidebars.
*   **Actionable Cards:** `surface-container-lowest` (#FFFFFF) - The highest "lift" for primary data.
*   **The Signature Sidebar:** `primary` (#1A1C23 / #5C5E66) - A deep, monolithic anchor that provides visual weight.

### The "Glass & Gradient" Rule
To inject "soul" into the data, use Glassmorphism for floating overlays (e.g., filter menus). Apply `surface-container-lowest` with 80% opacity and a `20px` backdrop blur. For primary CTAs, use a subtle linear gradient from `primary` (#5C5E66) to `primary-dim` (#50525A) at a 135° angle to create a metallic, premium sheen.

## 3. Typography: Editorial Authority
We utilize a dual-font strategy to balance character with utility.

*   **Display & Headlines (Manrope):** Our "Voice." Manrope’s geometric yet warm curves provide a modern, architectural feel. Use `display-lg` for top-level restaurant metrics to make numbers feel like "Hero" elements.
*   **Body & UI (Inter):** Our "Tool." Inter provides maximum legibility for dense kitchen analytics and inventory lists.
*   **Hierarchy Tip:** Pair a `headline-sm` (Manrope, Bold) with a `label-sm` (Inter, Medium, All-Caps) for card headers to create an editorial contrast that feels like a premium print magazine.

## 4. Elevation & Depth
We eschew traditional drop shadows in favor of **Ambient Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking." A `surface-container-lowest` card placed on a `surface-container-low` background creates a natural, soft lift without the "dirty" look of grey shadows.
*   **Ambient Shadows:** If a card must float (e.g., a dragged kitchen order), use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(43, 52, 55, 0.06)`. Note the use of the `on-surface` color (#2B3437) for the shadow tint rather than pure black.
*   **The "Ghost Border" Fallback:** If accessibility requires a stroke, use `outline-variant` (#ABB3B7) at 15% opacity. It should be felt, not seen.

## 5. Component Logic
Components must feel "chunky" and tactile, utilizing the `xl` (1.5rem) and `lg` (1rem) roundedness tokens.

*   **Buttons:**
    *   *Primary:* Gradient-filled (Primary to Primary-Dim), `xl` roundedness, high-contrast `on-primary` text.
    *   *Tertiary:* No background, no border. Use `primary` text color with an `on-surface-variant` icon.
*   **Cards & Lists:** **Absolute prohibition of divider lines.** Separate list items using `spacing.2` vertical gaps and subtle background hover states (`surface-container-high`).
*   **Input Fields:** Use `surface-container-lowest` with a 2px inset transition on focus. Avoid floating labels; use `label-md` placed 0.5rem above the field for an "ordered" look.
*   **Restaurant Intelligence Specials:** 
    *   *The "Pulse" Chip:* For "Success/Promote" metrics, use a `success-container` background with a 10% opacity pulse animation to signify real-time data flow.
    *   *The "Heat-Map" List:* For kitchen bottlenecks, use tonal shifts of `error-container` (soft reds) rather than harsh outlines.

## 6. Do's and Don'ts

### Do
*   **DO** use asymmetric padding. A wider left-side gutter (e.g., `spacing.10`) creates a high-end gallery feel.
*   **DO** use `display-sm` for large numerical data (e.g., Revenue). Numbers are the stars of SIKBO.
*   **DO** use "Micro-interactions." A 200ms ease-out scale effect (1.02x) when hovering over a restaurant performance card.

### Don't
*   **DON'T** use 100% black text. Always use `on-surface` (#2B3437) for a softer, premium reading experience.
*   **DON'T** use "Standard" 4px corners. SIKBO is premium; stay within the `lg` (16px) to `xl` (24px) range.
*   **DON'T** crowd the sidebar. Use `spacing.12` of top padding to let the SIKBO logo breathe.

### Accessibility Note
While we prioritize "No-Line" design, ensure that color contrast between `surface` and `surface-container` tiers meets WCAG AA standards (minimum 3:1) to ensure the hierarchy is perceivable by all users.