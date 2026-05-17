# Swapifhy - Visual Design System

## Design Philosophy

**Core Concept**: "Human-Centric Professionalism". A move away from generic "startup" templates. The design should feel hand-crafted, substantial, and premium. It balances trustworthiness with organic, fluid interactions that surprise and delight.

**Visual Language**:
-   **Typography**: Editorial and clean. `Outfit` for personality in headers, `Inter` (or `Plus Jakarta Sans`) for unmatched readability in body.
-   **Color**: Deep, rich tones anchored by a strong primary blue, contrasted with vibrant but controlled accents.
-   **Motion**: Physics-based, smooth (GSAP). Elements shouldn't just "fade in"; they should arrive with weight and purpose.
-   **Depth**: "Premium Glass" - frosted blurred backgrounds with subtle noise textures and delicate borders, rather than heavy drop shadows.

## Color Palette

### Primary Colors
-   **Midnight Blue**: #0F172A (Text / BG base)
-   **Electric Blue**: #3B82F6 (Primary Action) - *Vibrant but standard*
-   **Deep Indigo**: #4F46E5 (Secondary / Gradient base)

### Secondary & Accents
-   **Soft Surface**: #F8FAFC (Light BG)
-   **Glass White**: rgba(255, 255, 255, 0.7) (Card BG)
-   **Vibrant Teal**: #14B8A6 (Success / Growth)
-   **Warm Coral**: #F43F5E (Alerts / Energy)

### Functional Colors
-   **Text Primary**: #0F172A
-   **Text Secondary**: #64748B
-   **Border Subtle**: rgba(148, 163, 184, 0.2)

## Typography

### Font Stack
-   **Headers**: `Outfit`, sans-serif (Weights: 500, 700)
-   **Body**: `Inter`, sans-serif (Weights: 400, 500)

### Scale
-   **Display**: 4.5rem (72px) - Tight leading (1.1)
-   **H1**: 3rem (48px)
-   **H2**: 2.25rem (36px)
-   **Body Lead**: 1.25rem (20px)
-   **Body**: 1rem (16px)

## UI Components & Effects

### Premium Glass Card
-   Background: `rgba(255, 255, 255, 0.65)`
-   Backdrop Filter: `blur(16px) saturate(180%)`
-   Border: `1px solid rgba(255, 255, 255, 0.5)`
-   Shadow: `0 8px 32px rgba(0, 0, 0, 0.05)`

### Buttons
-   **Primary**: Solid color/gradient, slight noise texture overlay, scale on hover.
-   **Secondary**: Border-only or soft ton-sur-ton background.

### Animations (GSAP)
-   **Parallax**: Subtle vertical movement of background elements vs foreground.
-   **Magnetic**: Buttons/Cards attract cursor slightly.
-   **Reveal**: Staggered entry with `y` translation and `opacity`.
