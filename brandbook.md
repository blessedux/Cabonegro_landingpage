# Cabo Negro Brandbook

## Comprehensive Branding Analysis & Guidelines

**Last Updated:** January 2025  
**Project:** Cabo Negro Landing Page  
**Status:** ✅ Font Unification Completed - PP Neue Montreal as Single Typography

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Typography System](#typography-system)
3. [Color System](#color-system)
4. [Component-Specific Branding](#component-specific-branding)
5. [Inconsistencies & Issues](#inconsistencies--issues)
6. [Unification Recommendations](#unification-recommendations)
7. [Implementation Roadmap](#implementation-roadmap)

---

## Executive Summary

### Current Branding State

The Cabo Negro website currently uses a **multi-font, multi-color system** with several inconsistencies that need unification. The brand identity is built around:

- **Primary Brand Color:** RGB(54, 95, 148) / HSL(213, 39%, 46%) - A distinctive blue
- **Primary Font:** PP Neue Montreal (sans-serif)
- **Secondary Font:** TheGoodMonolith (monospace)
- **Accent Font:** Playfair Display (serif) - defined but rarely used
- **Body Font:** Inter - loaded but inconsistently applied

### Key Findings

1. **Font Inconsistencies:** ✅ **RESOLVED**

   - ✅ Inter removed from layout - PP Neue Montreal now unified as single typography
   - ⚠️ Playfair Display is defined but rarely implemented (can be removed if not needed)
   - ✅ Inline fontFamily styles removed from Hero components
   - ✅ Font application unified across all language variants

2. **Color Inconsistencies:**

   - Brand blue RGB(54, 95, 148) used in gradients but not standardized
   - Mix of CSS variables, Tailwind classes, and hardcoded hex values
   - Inconsistent gray scale usage
   - Multiple accent colors (blue-400, green-400, purple-400, orange-400, cyan-400) without clear hierarchy

3. **Typography Inconsistencies:**
   - Heading sizes vary across similar components
   - Inconsistent responsive breakpoints
   - Mix of inline fontSize styles and Tailwind classes
   - Letter spacing and line height not standardized

---

## Typography System

### Font Families

#### 1. Primary Font: PP Neue Montreal

- **Source:** `fonts.cdnfonts.com/css/pp-neue-montreal`
- **Type:** Sans-serif
- **Usage:** Primary brand font for headings and body text
- **Tailwind Class:** `font-primary`
- **Defined In:** `tailwind.config.ts`
- **Loaded In:** `src/components/FontLoader.tsx`
- **Usage Locations:**
  - Hero sections (Hero.tsx, Hero-es.tsx, Hero-fr.tsx, Hero-zh.tsx)
  - Preloader components (all variants)
  - Primary headings across the site
- **Status:** ✅ Well-defined and consistently used for main content

#### 2. Secondary Font: TheGoodMonolith

- **Source:** `fonts.cdnfonts.com/css/thegoodmonolith`
- **Type:** Monospace
- **Usage:** Technical text, preloader timestamps, code-like elements
- **Tailwind Class:** `font-secondary`
- **Defined In:** `tailwind.config.ts`
- **Loaded In:** `src/components/FontLoader.tsx`
- **Usage Locations:**
  - Preloader components (timestamp displays)
  - Technical/UI elements requiring monospace
- **Status:** ✅ Properly used for technical elements

#### 3. Accent Font: Playfair Display

- **Source:** `fonts.googleapis.com/css2?family=Playfair+Display`
- **Type:** Serif
- **Usage:** Intended for decorative/display text
- **Tailwind Class:** `font-playfair`
- **Defined In:** `tailwind.config.ts`
- **Loaded In:** `src/components/FontLoader.tsx`
- **Usage Locations:**
  - ⚠️ **RARELY USED** - Defined but not implemented in components
- **Status:** ⚠️ **UNDERUTILIZED** - Consider removing or finding use cases

#### 4. Body Font: PP Neue Montreal (Unified)

- **Source:** `fonts.cdnfonts.com/css/pp-neue-montreal`
- **Type:** Sans-serif
- **Usage:** ✅ **UNIFIED** - Now used as the single typography font for all text
- **Applied In:** `src/app/globals.css` via `@apply font-primary` on body element
- **Status:** ✅ **COMPLETED** - Inter removed, PP Neue Montreal is now the default body font

#### 5. System Fonts

- **Fallbacks:** `sans-serif`, `monospace`
- **Usage:** Fallback when custom fonts fail to load
- **Status:** ✅ Properly configured

### Typography Scale

#### Heading Hierarchy

##### H1 - Hero Titles

- **Desktop:** `text-7xl` (4.5rem / 72px)
- **Tablet:** `text-6xl` (3.75rem / 60px)
- **Mobile:** `text-4xl` (2.25rem / 36px)
- **Responsive:** `text-4xl sm:text-5xl md:text-6xl lg:text-7xl`
- **Font Weight:** `font-bold` (700)
- **Font Family:** `font-primary` (PP Neue Montreal)
- **Line Height:** `leading-tight`
- **Letter Spacing:** Default (no tracking class)
- **Usage:** Hero sections, main page titles
- **Files:** Hero.tsx, Hero-es.tsx, Hero-fr.tsx, Hero-zh.tsx

##### H2 - Section Headings

**Variant 1 (Large Sections):**

- **Desktop:** `text-5xl` (3rem / 48px)
- **Tablet:** `text-4xl` (2.25rem / 36px)
- **Mobile:** `text-4xl` (2.25rem / 36px)
- **Responsive:** `text-4xl md:text-5xl`
- **Font Weight:** `font-bold`
- **Usage:** Major section titles (Stats, FAQ, Partners)

**Variant 2 (Medium Sections):**

- **Desktop:** `text-4xl` (2.25rem / 36px)
- **Tablet:** `text-3xl` (1.875rem / 30px)
- **Mobile:** `text-2xl` (1.5rem / 24px)
- **Responsive:** `text-2xl md:text-4xl`
- **Font Weight:** `font-bold`
- **Usage:** Subsection headings

**Variant 3 (Partners Section):**

- **Desktop:** `text-6xl` (3.75rem / 60px)
- **Tablet:** `text-5xl` (3rem / 48px)
- **Mobile:** `text-4xl` (2.25rem / 36px)
- **Responsive:** `text-4xl sm:text-5xl lg:text-6xl`
- **Font Weight:** `font-bold`
- **Letter Spacing:** `tracking-tight`
- **Usage:** Partners section subtitle

##### H3 - Subsection Headings

**Variant 1:**

- **Desktop:** `text-2xl` (1.5rem / 24px)
- **Mobile:** `text-2xl` (1.5rem / 24px)
- **Font Weight:** `font-bold`
- **Usage:** Feature titles, card headings

**Variant 2:**

- **Desktop:** `text-xl md:text-2xl` (1.25rem / 20px → 1.5rem / 24px)
- **Font Weight:** `font-bold` or `font-semibold`
- **Usage:** Smaller subsection headings

**Variant 3:**

- **Desktop:** `text-lg md:text-xl` (1.125rem / 18px → 1.25rem / 20px)
- **Font Weight:** `font-semibold`
- **Usage:** FAQ questions, form labels

##### H4 - Minor Headings

- **Size:** `text-base` (1rem / 16px) or `text-lg` (1.125rem / 18px)
- **Font Weight:** `font-bold`
- **Usage:** Feature card titles, small section labels

#### Body Text Scale

##### Large Body Text

- **Desktop:** `text-2xl` (1.5rem / 24px)
- **Tablet:** `text-xl` (1.25rem / 20px)
- **Mobile:** `text-lg` (1.125rem / 18px)
- **Responsive:** `text-lg sm:text-xl md:text-2xl`
- **Usage:** Hero subtitles, large descriptive text
- **Line Height:** `leading-relaxed`

##### Medium Body Text

- **Desktop:** `text-lg` (1.125rem / 18px)
- **Tablet:** `text-base md:text-lg` (1rem / 16px → 1.125rem / 18px)
- **Mobile:** `text-base` (1rem / 16px)
- **Usage:** Standard paragraph text, descriptions
- **Line Height:** `leading-relaxed` or default

##### Small Body Text

- **Desktop:** `text-base` (1rem / 16px)
- **Tablet:** `text-sm md:text-base` (0.875rem / 14px → 1rem / 16px)
- **Mobile:** `text-sm` (0.875rem / 14px)
- **Usage:** Captions, metadata, secondary information
- **Line Height:** Default

##### Extra Small Text

- **Desktop:** `text-sm` (0.875rem / 14px)
- **Mobile:** `text-xs sm:text-sm` (0.75rem / 12px → 0.875rem / 14px)
- **Usage:** Timestamps, fine print, preloader text
- **Line Height:** Default or `leading-tight`

#### Font Weights

| Weight   | Tailwind Class  | Value | Usage                                |
| -------- | --------------- | ----- | ------------------------------------ |
| Thin     | `font-thin`     | 100   | Rarely used (GradientHeading only)   |
| Light    | `font-light`    | 300   | Preloader text                       |
| Normal   | `font-normal`   | 400   | Body text, preloader labels          |
| Medium   | `font-medium`   | 500   | Buttons, labels, metadata            |
| Semibold | `font-semibold` | 600   | FAQ questions, subsection headings   |
| Bold     | `font-bold`     | 700   | **Most common** - Headings, emphasis |
| Black    | `font-black`    | 900   | Rarely used (GradientHeading only)   |

#### Letter Spacing

| Spacing | Tailwind Class     | Usage                                |
| ------- | ------------------ | ------------------------------------ |
| Tighter | `tracking-tighter` | Large display headings               |
| Tight   | `tracking-tight`   | Section headings, Partners titles    |
| Normal  | (default)          | Body text, most headings             |
| Wide    | `tracking-wide`    | Uppercase labels, preloader text     |
| Wider   | `tracking-wider`   | Preloader timestamps                 |
| Widest  | `tracking-widest`  | Preloader labels, uppercase emphasis |

#### Line Height

| Height  | Tailwind Class    | Usage                        |
| ------- | ----------------- | ---------------------------- |
| Tight   | `leading-tight`   | Headings, compact text       |
| Normal  | (default)         | Most body text               |
| Relaxed | `leading-relaxed` | Paragraphs, descriptive text |

### GradientHeading Component

**Location:** `src/components/ui/gradient-heading.tsx`

A reusable heading component with predefined size variants:

| Size | Mobile      | Tablet     | Desktop         |
| ---- | ----------- | ---------- | --------------- |
| xxs  | `text-base` | `text-lg`  | `text-lg`       |
| xs   | `text-lg`   | `text-xl`  | `text-2xl`      |
| sm   | `text-xl`   | `text-2xl` | `text-3xl`      |
| md   | `text-2xl`  | `text-3xl` | `text-4xl`      |
| lg   | `text-3xl`  | `text-4xl` | `text-5xl`      |
| xl   | `text-4xl`  | `text-5xl` | `text-6xl`      |
| xll  | `text-5xl`  | `text-6xl` | `text-[5.4rem]` |
| xxl  | `text-5xl`  | `text-6xl` | `text-[6rem]`   |
| xxxl | `text-5xl`  | `text-6xl` | `text-[8rem]`   |

**Status:** ⚠️ **UNDERUTILIZED** - Defined but not consistently used across components

---

## Color System

### Primary Brand Color

**RGB(54, 95, 148)** / **HSL(213, 39%, 46%)**

This is the core brand blue color mentioned in `globals.css` comments and used throughout the site.

- **Hex:** `#369F94` (Note: RGB(54, 95, 148) = #365F94, verify actual hex)
- **RGB:** `rgb(54, 95, 148)`
- **HSL:** `hsl(213, 39%, 46%)`
- **Usage:**
  - CSS variable: `--primary: 213 39% 46%`
  - CSS variable: `--accent: 213 39% 46%`
  - CSS variable: `--ring: 213 39% 46%`
  - Gradients: `rgba(54, 95, 148, 0.08)`, `rgba(54, 95, 148, 0.06)`, `rgba(54, 95, 148, 0.02)`
  - Background patterns in Partners section
- **Status:** ✅ Defined in CSS variables but also hardcoded in gradients

### Color Palette

#### CSS Variables (HSL Format)

Defined in `src/app/globals.css`:

```css
--background: 0 0% 100%           /* White */
--foreground: 0 0% 10%            /* Near black */
--card: 0 0% 98%                  /* Off-white */
--card-foreground: 0 0% 10%      /* Near black */
--popover: 0 0% 98%               /* Off-white */
--popover-foreground: 0 0% 10%    /* Near black */
--primary: 213 39% 46%            /* Brand blue */
--primary-foreground: 0 0% 100%   /* White */
--secondary: 0 0% 95%             /* Light gray */
--secondary-foreground: 0 0% 10%  /* Near black */
--muted: 0 0% 96%                 /* Very light gray */
--muted-foreground: 0 0% 45%      /* Medium gray */
--accent: 213 39% 46%             /* Brand blue (same as primary) */
--accent-foreground: 0 0% 100%     /* White */
--destructive: 0 84.2% 60.2%      /* Red */
--destructive-foreground: 0 0% 100% /* White */
--border: 0 0% 90%                 /* Light gray */
--input: 0 0% 90%                  /* Light gray */
--ring: 213 39% 46%               /* Brand blue */
```

#### Neutral Colors (Gray Scale)

Used extensively throughout the site via Tailwind classes:

| Color    | Tailwind Class                      | Usage                                            |
| -------- | ----------------------------------- | ------------------------------------------------ |
| Gray 900 | `text-gray-900`, `bg-gray-900`      | Dark text on light backgrounds, dark backgrounds |
| Gray 700 | `text-gray-700`                     | Body text on light backgrounds                   |
| Gray 600 | `text-gray-600`                     | Secondary text, FAQ answers                      |
| Gray 500 | `text-gray-500`                     | Muted text, metadata                             |
| Gray 400 | `text-gray-400`                     | Subtle text, descriptions                        |
| Gray 300 | `text-gray-300`                     | Light text on dark backgrounds                   |
| Black    | `text-black`, `bg-black`, `#000000` | Primary dark color, hero backgrounds             |
| White    | `text-white`, `bg-white`, `#ffffff` | Primary light color, text on dark                |

#### Accent Colors

Multiple accent colors used without clear hierarchy:

| Color      | Tailwind Class                     | Usage                      | Status             |
| ---------- | ---------------------------------- | -------------------------- | ------------------ |
| Blue 400   | `text-blue-400`, `bg-blue-400`     | Stats, highlights          | ⚠️ Not brand color |
| Green 400  | `text-green-400`, `bg-green-400`   | Success states, H₂V stats  | ⚠️ Inconsistent    |
| Purple 400 | `text-purple-400`, `bg-purple-400` | Stats, highlights          | ⚠️ Inconsistent    |
| Orange 400 | `text-orange-400`, `bg-orange-400` | Timeline, highlights       | ⚠️ Inconsistent    |
| Cyan 400   | `text-cyan-400`, `bg-cyan-400`     | Scroll indicators, accents | ⚠️ Inconsistent    |
| Cyan 500   | `text-cyan-500`                    | Press section source       | ⚠️ Inconsistent    |

**Issue:** These accent colors should be standardized or replaced with brand color variations.

#### Hardcoded Colors

Found throughout components (should be replaced with design tokens):

- `#000000` - Black (hero backgrounds, text)
- `#ffffff` - White (text on dark, backgrounds)
- `rgba(54, 95, 148, ...)` - Brand blue in gradients
- `rgba(0, 0, 0, ...)` - Black with opacity
- `rgba(255, 255, 255, ...)` - White with opacity

### Background Colors

#### Light Sections

- **White:** `bg-white` - Partners section, FAQ, forms
- **Off-white:** `bg-background` (CSS variable) - Default background
- **Card:** `bg-card` (CSS variable) - Card backgrounds

#### Dark Sections

- **Black:** `bg-black`, `#000000` - Hero sections, navigation
- **Dark gray:** `bg-gray-900` - Language switcher, dark UI elements

### Text Colors

#### On Dark Backgrounds

- **Primary:** `text-white`, `#ffffff`
- **Secondary:** `text-gray-300`, `text-gray-400`
- **Muted:** `text-gray-500`

#### On Light Backgrounds

- **Primary:** `text-black`, `text-foreground` (CSS variable)
- **Secondary:** `text-gray-700`, `text-gray-600`
- **Muted:** `text-gray-500`, `text-muted-foreground` (CSS variable)

---

## Component-Specific Branding

### Hero Sections

**Files:** `Hero.tsx`, `Hero-es.tsx`, `Hero-fr.tsx`, `Hero-zh.tsx`

#### Typography

- **H1:** `text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-primary`
- **Subtitle:** `text-lg sm:text-xl md:text-2xl italic`
- **Font Family:** PP Neue Montreal (via `font-primary` class and inline `fontFamily` style)
- **Color:** White (`text-white`, `#ffffff`)
- **Text Shadow:** `0 2px 4px rgba(0,0,0,0.3)`

#### Colors

- **Background:** Black (`#000000`, `bg-black`)
- **Text:** White (`#ffffff`, `text-white`)

#### Issues

- ⚠️ Inline `fontFamily` styles duplicate Tailwind classes
- ⚠️ Hardcoded color values instead of CSS variables

### Navigation (Navbar)

**Files:** `Navbar.tsx`, `Navbar-es.tsx`, `Navbar-zh.tsx`

#### Typography

- **Links:** `text-sm uppercase`
- **Font Weight:** Default (normal)
- **Letter Spacing:** Default

#### Colors

- **Background:** Transparent with backdrop blur
- **Text:** Dynamic - white on dark sections, black on light sections
- **Hover:** `hover:text-gray-300` or `hover:text-gray-900`

#### Issues

- ⚠️ No consistent font family specified
- ⚠️ Color logic is complex and scattered

### Partners Section

**Files:** `Partners.tsx`, `Partners-es.tsx`

#### Typography

- **H3 (Title):** `text-3xl sm:text-4xl lg:text-5xl font-bold text-black tracking-tight`
- **H2 (Subtitle):** `text-4xl sm:text-5xl lg:text-6xl font-bold text-black tracking-tight`
- **Description:** `text-black text-lg`
- **Font Family:** Not explicitly set (inherits from body)

#### Colors

- **Background:** White (`bg-white`)
- **Text:** Black (`text-black`, `#000000`)
- **Accent Gradients:** `rgba(54, 95, 148, ...)` - Brand blue with opacity

#### Issues

- ⚠️ Inline `color: '#000000 !important'` overrides
- ⚠️ Brand blue gradients hardcoded instead of using CSS variables

### Stats Section

**Files:** `Stats.tsx`, `Stats-es.tsx`

#### Typography

- **H2:** `text-4xl md:text-5xl font-bold text-white`
- **Large Numbers:** `text-6xl md:text-7xl font-bold`
- **Labels:** `text-lg font-medium`
- **Descriptions:** `text-sm md:text-base`

#### Colors

- **Background:** Dark (inherited from hero/background)
- **Text:** White for headings, gray-300/400 for body
- **Numbers:** White or gray-900 (depending on context)

### FAQ Section

**Files:** `FAQ.tsx`, `FAQ-es.tsx`, `FAQ-zh.tsx`

#### Typography

- **H2:** `text-4xl md:text-5xl font-bold`
- **Questions:** `text-lg font-semibold`
- **Answers:** `text-gray-700` (light mode) or default (dark mode)

#### Colors

- **Background:** White (`bg-white`) or default
- **Text:** `text-foreground` (CSS variable) or `text-gray-700`
- **Borders:** `border-gray-200`
- **Hover:** `hover:border-accent`

### Features Section

**Files:** `Features.tsx`, `Features-simple.tsx`

#### Typography

- **H2:** `text-4xl md:text-5xl font-bold` or `text-4xl md:text-6xl font-bold`
- **Feature Titles:** `text-base font-bold uppercase tracking-tight`
- **Descriptions:** `text-sm font-bold`
- **Highlights:** `text-xs font-semibold`

#### Colors

- **Text:** `text-foreground` (CSS variable)
- **Accent Bullets:** `text-accent` (CSS variable)

### Buttons

**File:** `src/components/ui/button.tsx`

#### Typography

- **Base:** `text-sm font-medium`
- **Sizes:**
  - Default: `h-9 px-4 py-2`
  - Small: `h-8 px-3 text-xs`
  - Large: `h-10 px-8`

#### Colors

- **Default:** `bg-primary text-primary-foreground`
- **Outline:** `border border-input bg-background hover:bg-accent`
- **Secondary:** `bg-secondary text-secondary-foreground`
- **Ghost:** `hover:bg-accent hover:text-accent-foreground`

#### Hero Buttons (Custom)

- **Style:** `uppercase border-white text-white bg-transparent hover:bg-white hover:text-black`
- **Font:** `text-sm md:text-base`

### Preloaders

**Files:** `preloader.tsx`, `preloader-en.tsx`, `preloader-es.tsx`, `preloader-fr.tsx`, `preloader-zh.tsx`, `preloader-b.tsx`

#### Typography

- **Timestamps:** `text-xs sm:text-sm font-secondary uppercase tracking-wider`
- **Labels:** `text-xs sm:text-sm font-primary uppercase tracking-widest font-normal`
- **Descriptions:** `text-xs sm:text-sm font-primary font-light tracking-wider`

#### Colors

- **Background:** White (`#ffffff`) or Black (`#000000`) depending on variant
- **Text:** Black or White depending on background

---

## Inconsistencies & Issues

### Font Inconsistencies

1. **Inter Font Not Used Consistently**

   - Inter is loaded in `layout.tsx` but body text often uses `font-primary` (PP Neue Montreal)
   - **Impact:** Inconsistent body text rendering
   - **Files Affected:** Most components

2. **Playfair Display Unused**

   - Defined in Tailwind config but never used
   - **Impact:** Unnecessary font loading
   - **Recommendation:** Remove or find use cases

3. **Inline Font Family Styles** ✅ **RESOLVED**

   - ✅ Removed inline `fontFamily` styles from all Hero components
   - ✅ Now using only Tailwind `font-primary` class
   - **Files Updated:** Hero.tsx, Hero-es.tsx, Hero-fr.tsx, Hero-zh.tsx

4. **Missing Font Family on Some Components**
   - Many components don't specify font family, relying on inheritance
   - **Impact:** Inconsistent rendering if body font changes

### Color Inconsistencies

1. **Brand Blue Hardcoded**

   - Brand blue `rgba(54, 95, 148, ...)` hardcoded in gradients
   - **Impact:** Difficult to update brand color globally
   - **Files:** Partners.tsx, Partners-es.tsx, elegant-dark-pattern.tsx

2. **Multiple Accent Colors Without Hierarchy**

   - blue-400, green-400, purple-400, orange-400, cyan-400 all used
   - **Impact:** No clear brand identity, confusing color usage
   - **Files:** Stats.tsx, HowItWorks.tsx, Explore.tsx, Timeline.tsx

3. **Mix of Color Systems**

   - CSS variables, Tailwind classes, and hardcoded hex/rgba values
   - **Impact:** Difficult to maintain, inconsistent theming

4. **Gray Scale Inconsistency**
   - Multiple gray shades used without clear purpose
   - **Impact:** Inconsistent visual hierarchy

### Typography Inconsistencies

1. **Heading Sizes Vary**

   - Similar components use different heading sizes
   - **Example:** FAQ H2 uses `text-4xl md:text-5xl`, Stats H2 uses same, but Partners H2 uses `text-4xl sm:text-5xl lg:text-6xl`
   - **Impact:** Inconsistent visual hierarchy

2. **Responsive Breakpoints Inconsistent**

   - Some use `sm:`, `md:`, `lg:`, others use `md:` only
   - **Impact:** Inconsistent responsive behavior

3. **Inline Font Size Styles**

   - AboutUs component uses inline `fontSize: 'clamp(...)'` styles
   - **Impact:** Breaks design system, harder to maintain
   - **File:** AboutUs.tsx

4. **Letter Spacing Not Standardized**

   - Mix of `tracking-tight`, `tracking-tighter`, `tracking-wide`, etc.
   - **Impact:** Inconsistent text appearance

5. **GradientHeading Underutilized**
   - Component exists but not used consistently
   - **Impact:** Duplicate heading code across components

### Component-Specific Issues

1. **Hero Sections**

   - Inline styles duplicate Tailwind classes
   - Hardcoded colors instead of CSS variables

2. **Partners Section**

   - Inline `!important` color overrides
   - Hardcoded brand blue gradients

3. **Navigation**

   - Complex color logic scattered across component
   - No explicit font family

4. **Buttons**
   - Hero buttons use custom styles instead of Button component variants

---

## Unification Recommendations

### 1. Font Standardization

#### Primary Font Strategy

- **Use PP Neue Montreal for:**
  - All headings (H1-H6)
  - Body text (replace Inter)
  - Navigation
  - Buttons
  - All primary UI text

#### Secondary Font Strategy

- **Use TheGoodMonolith for:**
  - Technical displays
  - Timestamps
  - Code-like elements
  - Preloader technical text

#### Remove or Implement

- **Playfair Display:** Either remove from config or define specific use cases (e.g., decorative quotes, special headings)
- **Inter:** Remove from layout.tsx if not using, or standardize as body font

#### Implementation Steps ✅ **COMPLETED**

1. ✅ Removed Inter from `layout.tsx` - replaced with `font-primary` on body
2. ✅ Removed inline `fontFamily` styles from Hero components (all 4 language variants)
3. ✅ Added `font-primary` to body element in `globals.css` for site-wide inheritance
4. ✅ Added explicit `font-primary` class to key sections (Partners, Stats, FAQ)
5. ✅ Updated BlurTextAnimation default to use `font-primary`
6. ✅ Updated layout-preloader to use `font-primary` class instead of inline style

**Result:** PP Neue Montreal is now the unified single typography font across the entire website.

### 2. Color System Consolidation

#### Brand Color Standardization

1. **Create Brand Color Tokens:**

   ```css
   --brand-blue: 213 39% 46%;
   --brand-blue-light: 213 39% 60%;
   --brand-blue-dark: 213 39% 35%;
   --brand-blue-alpha-10: 213 39% 46% / 0.1;
   --brand-blue-alpha-20: 213 39% 46% / 0.2;
   ```

2. **Replace Hardcoded Values:**

   - Find all instances of `rgba(54, 95, 148, ...)`
   - Replace with CSS variable or Tailwind class
   - Update Partners section gradients

3. **Standardize Accent Colors:**
   - Define clear accent color hierarchy
   - Use brand blue variations instead of multiple colors
   - Or define semantic colors (success, warning, info, error)

#### Gray Scale Standardization

Create clear gray scale with defined purposes:

- **Gray 900:** Primary dark text
- **Gray 700:** Secondary text
- **Gray 600:** Tertiary text
- **Gray 500:** Muted text
- **Gray 400:** Subtle text on dark
- **Gray 300:** Light text on dark

### 3. Typography Scale Unification

#### Standardized Heading Sizes

**H1 (Hero):**

```tsx
className =
  "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold font-primary leading-tight";
```

**H2 (Section):**

```tsx
className = "text-3xl sm:text-4xl md:text-5xl font-bold font-primary";
```

**H3 (Subsection):**

```tsx
className = "text-xl sm:text-2xl md:text-3xl font-bold font-primary";
```

**H4 (Minor):**

```tsx
className = "text-lg sm:text-xl font-semibold font-primary";
```

#### Standardized Body Text

**Large:**

```tsx
className = "text-lg sm:text-xl md:text-2xl font-primary leading-relaxed";
```

**Medium:**

```tsx
className = "text-base sm:text-lg font-primary leading-relaxed";
```

**Small:**

```tsx
className = "text-sm sm:text-base font-primary";
```

#### Letter Spacing Standards

- **Headings:** `tracking-tight` (default)
- **Uppercase Labels:** `tracking-wide`
- **Body Text:** Default (no tracking)

### 4. Component Standardization

#### Use GradientHeading Component

- Replace custom heading implementations with GradientHeading
- Ensures consistency across components

#### Standardize Button Usage

- Use Button component variants instead of custom styles
- Create new variants if needed (e.g., `hero` variant)

#### Remove Inline Styles

- Replace inline `fontSize`, `fontFamily`, `color` styles with Tailwind classes
- Use CSS variables for dynamic colors

### 5. Design Token System

#### Create Design Tokens File

Create `src/styles/tokens.css` or extend `globals.css`:

```css
:root {
  /* Brand Colors */
  --brand-blue: 213 39% 46%;
  --brand-blue-light: 213 39% 60%;
  --brand-blue-dark: 213 39% 35%;

  /* Typography */
  --font-primary: "PP Neue Montreal", sans-serif;
  --font-secondary: "TheGoodMonolith", monospace;
  --font-accent: "Playfair Display", serif;

  /* Spacing Scale */
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;

  /* Typography Scale */
  --text-xs: 0.75rem;
  --text-sm: 0.875rem;
  --text-base: 1rem;
  --text-lg: 1.125rem;
  --text-xl: 1.25rem;
  --text-2xl: 1.5rem;
  --text-3xl: 1.875rem;
  --text-4xl: 2.25rem;
  --text-5xl: 3rem;
  --text-6xl: 3.75rem;
  --text-7xl: 4.5rem;
}
```

#### Update Tailwind Config

Extend Tailwind config to use design tokens:

```typescript
theme: {
  extend: {
    fontFamily: {
      primary: ['PP Neue Montreal', 'sans-serif'],
      secondary: ['TheGoodMonolith', 'monospace'],
      accent: ['Playfair Display', 'serif'],
    },
    colors: {
      brand: {
        blue: 'hsl(var(--brand-blue))',
        'blue-light': 'hsl(var(--brand-blue-light))',
        'blue-dark': 'hsl(var(--brand-blue-dark))',
      },
      // ... existing colors
    },
  },
}
```

---

## Implementation Roadmap

### Phase 1: Analysis & Planning (Current)

- ✅ Complete font inventory
- ✅ Complete color inventory
- ✅ Complete typography analysis
- ✅ Document inconsistencies
- ✅ Create brandbook

### Phase 2: Design Token System

1. Create design tokens file
2. Update Tailwind config
3. Define brand color variations
4. Standardize gray scale

### Phase 3: Font Unification

1. Remove Inter or standardize usage
2. Remove inline fontFamily styles
3. Add font-primary to all components
4. Remove Playfair Display or define use cases

### Phase 4: Color Unification

1. Replace hardcoded brand blue with tokens
2. Standardize accent colors
3. Consolidate gray usage
4. Update all components to use design tokens

### Phase 5: Typography Unification

1. Create typography utility classes
2. Standardize heading sizes
3. Standardize body text sizes
4. Remove inline fontSize styles
5. Standardize letter spacing and line height

### Phase 6: Component Standardization

1. Update Hero components
2. Update Navigation
3. Update all sections
4. Standardize button usage
5. Use GradientHeading consistently

### Phase 7: Testing & Refinement

1. Test across all pages
2. Test responsive breakpoints
3. Verify color consistency
4. Check font loading
5. Performance audit

---

## Appendix: File Reference

### Key Configuration Files

- `tailwind.config.ts` - Font families, color system
- `src/app/globals.css` - CSS variables, base styles
- `src/components/FontLoader.tsx` - Font loading
- `src/app/layout.tsx` - Inter font setup

### Component Files Analyzed

- Hero: `Hero.tsx`, `Hero-es.tsx`, `Hero-fr.tsx`, `Hero-zh.tsx`
- Navigation: `Navbar.tsx`, `Navbar-es.tsx`, `Navbar-zh.tsx`
- Sections: `AboutUs.tsx`, `Features.tsx`, `Stats.tsx`, `Partners.tsx`, `FAQ.tsx`, `Contact.tsx`, `SimpleFooter.tsx`
- UI: `button.tsx`, `gradient-heading.tsx`, `preloader.tsx` (all variants)

### Color Usage Locations

- Brand blue gradients: `Partners.tsx`, `Partners-es.tsx`, `elegant-dark-pattern.tsx`
- Accent colors: `Stats.tsx`, `HowItWorks.tsx`, `Explore.tsx`, `Timeline.tsx`
- Hardcoded colors: Multiple components (see inconsistencies section)

---

**End of Brandbook**
