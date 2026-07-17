---
name: Baobab Creative
colors:
  surface: '#fff8f4'
  surface-dim: '#efd6bf'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1e7'
  surface-container: '#ffead8'
  surface-container-high: '#fde4cd'
  surface-container-highest: '#f7dec7'
  on-surface: '#26190b'
  on-surface-variant: '#464653'
  inverse-surface: '#3c2e1e'
  inverse-on-surface: '#ffeee0'
  outline: '#767684'
  outline-variant: '#c7c5d5'
  surface-tint: '#4c51c1'
  primary: '#4a4ebe'
  on-primary: '#ffffff'
  primary-container: '#6368d9'
  on-primary-container: '#fffbff'
  inverse-primary: '#c0c1ff'
  secondary: '#835400'
  on-secondary: '#ffffff'
  secondary-container: '#ffae2e'
  on-secondary-container: '#6c4500'
  tertiary: '#00694b'
  on-tertiary: '#ffffff'
  tertiary-container: '#008560'
  on-tertiary-container: '#f5fff7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#04006d'
  on-primary-fixed-variant: '#3337a8'
  secondary-fixed: '#ffddb5'
  secondary-fixed-dim: '#ffb956'
  on-secondary-fixed: '#2a1800'
  on-secondary-fixed-variant: '#643f00'
  tertiary-fixed: '#7df9c6'
  tertiary-fixed-dim: '#5fdcac'
  on-tertiary-fixed: '#002115'
  on-tertiary-fixed-variant: '#005139'
  background: '#fff8f4'
  on-background: '#26190b'
  surface-variant: '#f7dec7'
typography:
  display-lg:
    fontFamily: Nunito Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-md:
    fontFamily: Nunito Sans
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Nunito Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-lg-mobile:
    fontFamily: Nunito Sans
    fontSize: 20px
    fontWeight: '700'
    lineHeight: 28px
  body-lg:
    fontFamily: Nunito Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-md:
    fontFamily: Nunito Sans
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
  label-bold:
    fontFamily: Nunito Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  label-sm:
    fontFamily: Nunito Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 48px
  xl: 64px
  container-margin: 32px
  gutter: 24px
---

## Brand & Style

This design system is built for curiosity, discovery, and creative play. It is designed specifically for children and educators, fostering an environment that feels warm, safe, and endlessly encouraging. The aesthetic is **Playful & Illustrative**, characterized by high-energy colors, organic soft-corners, and tactile-inspired elements that mimic physical toys or art supplies.

The style avoids clinical precision in favor of a "human-touched" feel. Layouts are generous and low-density to accommodate developing motor skills and shorter attention spans. Visual cues—such as expressive iconography and character-driven illustrations—take precedence over heavy text to guide users through their journey of learning and creation.

## Colors

The palette is vibrant and celebratory, rooted in a soft, warm cream background that reduces eye strain compared to pure white. 

- **Primary (Lion Blue):** Used for main actions and focus states.
- **Secondary (Baobab Orange):** Used for rewards, progress, and highlights.
- **Tertiary (Leaf Green):** Used for success states and nature-themed activities.
- **Accent (Coral Pink):** Used for storytelling and interactive "fun" zones.
- **Cream Background:** The foundational canvas for all content, providing a "paper-like" feel.
- **Soft Bark Neutral:** A warm, deep brown used for text and iconography instead of harsh black, maintaining the organic feel of the brand.

## Typography

This design system exclusively uses **Nunito Sans** for its rounded terminals and friendly, open letterforms. 

The typographic hierarchy is intentionally bold. Large font sizes ensure readability for early readers. Headlines use heavier weights (ExtraBold/Bold) to create a clear visual anchor on the page. Text should always be rendered with high contrast against the cream background, utilizing the "Soft Bark" neutral color for maximum comfort.

## Layout & Spacing

The layout follows a **Fluid Grid** model with high margins to create an "island" effect for content. 

- **Desktop:** 12-column grid with a 1200px max-width container, 24px gutters, and 32px side margins.
- **Tablet:** 8-column grid with 24px margins.
- **Mobile:** 4-column grid with 16px margins.

Spacing is generous to prevent the UI from feeling cluttered. Elements are grouped in clear card-like containers with substantial internal padding (24px to 32px) to define distinct "zones" of activity.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Soft Ambient Shadows**. 

Avoid harsh black shadows; instead, use shadows tinted with a hint of the "Soft Bark" neutral or the primary color to keep the UI feeling warm. 
- **Level 0 (Surface):** The Cream background.
- **Level 1 (Cards):** White background with a very soft, diffused shadow (15% opacity, 20px blur).
- **Level 2 (Interactive):** Elements like buttons or active chips use a slight vertical offset (4px) to appear "lifted" and ready to be pressed.
- **Level 3 (Modals):** High blur backdrop with 20% opacity tinting to bring focus to the foreground.

## Shapes

The shape language is **Organic and Rounded**. There are no sharp corners in this design system.

- **Small Components (Buttons, Chips):** Use 16px (1rem) corner radius.
- **Medium Components (Cards, Inputs):** Use 24px (1.5rem) corner radius.
- **Large Components (Banners, Sidebars):** Use 32px (2rem) corner radius.
- **Icons:** Should always feature rounded caps and corners to match the UI.

## Components

### Buttons & Inputs
- **Primary Buttons:** High-saturation background (Blue or Green) with Bold White text. Large padding (16px top/bottom) creates a "chunky" tap target.
- **Secondary Buttons:** White background with a colored 2px border and colored text.
- **Input Fields:** Pure white background, 2px "Soft Bark" border (at 20% opacity), and large 18px text. Search bars should include a prominent magnifying glass icon.

### Cards & Navigation
- **Activity Cards:** Feature a vertical stack—Illustration at the top, a thick colored "tab" footer at the bottom containing the category label.
- **Sidebar:** A simplified list of icons and labels with a distinct background color (e.g., a lighter tint of the cream background) to separate navigation from the workspace.
- **Active State:** Navigation items use a rounded-pill highlight (Primary/Secondary color) to indicate the current page.

### Progress & Feedback
- **Badges:** Circular or shield-shaped containers with high-quality illustrations or 3D-styled icons.
- **Progress Rings:** Thick stroke widths (8px+) using the Secondary (Orange) color to show completion.
- **Chips/Tags:** Used for filtering (e.g., "6 years +", "Art"), with a 100px border-radius for a full pill shape.