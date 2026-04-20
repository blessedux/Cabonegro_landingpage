/**
 * Stacking order for explore route UI. Narrative panel is portaled to `document.body`
 * (`z-[100050]`); mobile drawer + burger must sit above it and below any future higher chrome.
 */
export const EXPLORE_UI_Z = {
  narrative: 'z-[100050]',
  mobileDrawerBackdrop: 'z-[100060]',
  mobileDrawerPanel: 'z-[100061]',
  /** Hamburger / close — above narrative so the menu can always be opened. */
  mobileBurger: 'z-[100062]',
} as const
