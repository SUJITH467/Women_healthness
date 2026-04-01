# Implementation Plan: Women's Health & Wellness Website

## Overview

Build a single-page application using vanilla HTML, CSS, and JavaScript. The implementation proceeds section by section, wiring each component into the main app as it's built. Property-based tests use fast-check; unit tests use plain Jest or Vitest.

## Tasks

- [x] 1. Project scaffold and global styles
  - Create `index.html` with semantic HTML5 structure (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`) and CDN links for AOS and Font Awesome
  - Create `styles.css` with CSS custom properties for light/dark color palettes (soft pinks, purples, whites, gradients), base reset, typography (min 16px body, web-safe or Google Font), and `scroll-behavior: smooth`
  - Create `app.js` with `DOMContentLoaded` entry point and module stubs for all managers
  - Create `tests/setup.js` and configure test runner (Vitest) with jsdom environment
  - _Requirements: 1.1, 1.3, 1.5, 13.2_

- [-] 2. Responsive layout and visual design
  - Implement mobile-first CSS grid/flexbox layout with media queries at 768px, 1024px, and 1440px breakpoints
  - Add global styles for rounded corners, box shadows, and CSS transitions (200ms–400ms) on cards and buttons
  - Ensure no horizontal overflow at any breakpoint by setting `max-width: 100%; overflow-x: hidden` on body and containers
  - _Requirements: 1.2, 1.3, 1.4_

  - [-] 2.1 Write property test for no horizontal overflow (Property 1)
    - **Property 1: No Horizontal Overflow at Any Breakpoint**
    - **Validates: Requirements 1.2**
    - Use fast-check to sample from `{320, 768, 1024, 1440}` and assert `document.body.scrollWidth <= document.body.clientWidth`
    - `// Feature: womens-health-wellness-website, Property 1: No horizontal overflow at any breakpoint`

- [~] 3. Navigation bar (`NavManager`)
  - Add sticky `<nav>` with links to all 8 sections: Hero, Physical Health, Mental Wellness, Hormonal Health, Wellness Tracker, Testimonials, Blog, Contact/Footer
  - Implement hamburger toggle button (hidden above 768px); clicking it toggles `.nav-open` class with CSS transition
  - Implement `NavManager` with `IntersectionObserver` to apply `.active` class to the link matching the visible section
  - Embed theme toggle button in nav
  - Ensure all nav links and hamburger button have visible `:focus` styles and `tabIndex >= 0`
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 13.3_

  - [~] 3.1 Write unit tests for NavManager
    - Assert nav contains links to all 8 required sections (Req 12.1)
    - Assert nav has sticky/fixed positioning (Req 12.3)
    - Assert hamburger button exists and nav links are hidden below 768px (Req 12.5)
    - _Requirements: 12.1, 12.3, 12.5_

  - [~] 3.2 Write property test for nav links point to existing section IDs (Property 17)
    - **Property 17: Nav Links Point to Existing Section IDs**
    - **Validates: Requirements 12.2**
    - For each nav link `href`, assert `document.querySelector(href)` is not null
    - `// Feature: womens-health-wellness-website, Property 17: Nav links point to existing section IDs`

  - [~] 3.3 Write property test for active nav link matches visible section (Property 18)
    - **Property 18: Active Nav Link Matches Visible Section**
    - **Validates: Requirements 12.4**
    - For a random section intersection, assert only that section's nav link has `.active` class
    - `// Feature: womens-health-wellness-website, Property 18: Active nav link matches visible section`

  - [~] 3.4 Write property test for hamburger menu toggle round trip (Property 19)
    - **Property 19: Hamburger Menu Toggle Is a Round Trip**
    - **Validates: Requirements 12.6**
    - For any menu state, toggle hamburger twice and assert original state restored
    - `// Feature: womens-health-wellness-website, Property 19: Hamburger menu toggle is a round trip`

- [~] 4. Hero section
  - Add `<section id="hero">` with headline, subtext, and CTA button labeled "Start Your Wellness Journey"
  - Apply full-viewport-height gradient background via CSS
  - Add CSS `@keyframes` fade-in/slide-up animation on headline and subtext (completes within 1s)
  - Wire CTA button click to smooth-scroll to `#physical-health`
  - Add hover effect on CTA button (color shift + shadow within 200ms)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [~] 4.1 Write unit test for hero CTA scroll
    - Assert clicking CTA button triggers scroll to `#physical-health` (Req 2.5)
    - _Requirements: 2.5_

- [ ] 5. Physical Health section
  - Add `<section id="physical-health">` with a grid of 3 cards (exercise, diet, sleep)
  - Each card: Font Awesome icon, title, summary text, and hidden detail overlay revealed on hover via CSS transition (300ms)
  - Add `data-aos="fade-up"` attributes to cards; initialize AOS in `app.js`
  - Ensure each card has an `alt`-equivalent accessible label
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [~] 5.1 Write unit tests for Physical Health section
    - Assert section has ≥ 3 cards (Req 3.1)
    - _Requirements: 3.1_

  - [~] 5.2 Write property test for physical health cards contain required elements (Property 2)
    - **Property 2: Physical Health Cards Contain Required Elements**
    - **Validates: Requirements 3.2**
    - For each card, assert presence of icon/img element, title element, and summary text element
    - `// Feature: womens-health-wellness-website, Property 2: Physical health cards contain required elements`

- [ ] 6. Mental Wellness section (`AccordionTabs` — tips)
  - Add `<section id="mental-wellness">` with 3 expandable tips (stress, mindfulness, emotional health)
  - Implement accordion toggle: clicking a tip toggles `max-height` CSS transition (300ms); all tips collapsed by default
  - Apply consistent open/close behavior (accordion or multi-expand) across all tips
  - Use calming visual elements consistent with design palette
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [~] 6.1 Write unit tests for Mental Wellness section
    - Assert section contains stress, mindfulness, and emotional health content (Req 4.1)
    - _Requirements: 4.1_

  - [~] 6.2 Write property test for expandable tips collapsed by default (Property 3)
    - **Property 3: Expandable Tips Are Collapsed by Default**
    - **Validates: Requirements 4.2**
    - On load, for each tip content panel, assert it is in a collapsed/hidden state
    - `// Feature: womens-health-wellness-website, Property 3: Expandable tips are collapsed by default`

  - [~] 6.3 Write property test for accordion toggle round trip (Property 4)
    - **Property 4: Accordion Toggle Is a Round Trip**
    - **Validates: Requirements 4.3, 4.4**
    - For a random tip index, click once → assert open; click again → assert closed
    - `// Feature: womens-health-wellness-website, Property 4: Accordion toggle is a round trip`

- [ ] 7. Hormonal Health section (`AccordionTabs` — panels)
  - Add `<section id="hormonal-health">` with tab/accordion UI for menstrual health, pregnancy, and PCOS
  - Implement `AccordionTabs`: clicking a tab shows its panel and hides all others (CSS transition ≤ 300ms)
  - Add `data-aos` entrance animation on the container
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [~] 7.1 Write unit tests for Hormonal Health section
    - Assert section contains menstrual health, pregnancy, and PCOS panels (Req 5.1)
    - _Requirements: 5.1_

  - [~] 7.2 Write property test for only one panel visible at a time (Property 5)
    - **Property 5: Hormonal Health — Only One Panel Visible at a Time**
    - **Validates: Requirements 5.3, 5.4**
    - For a random tab selection, assert exactly 1 panel is visible and all others are hidden
    - `// Feature: womens-health-wellness-website, Property 5: Only one panel visible at a time`

- [ ] 8. Daily Wellness Tracker (`WellnessTracker`)
  - Add `<section id="wellness-tracker">` with water counter (0–8, increment/decrement buttons), mood selector (5 emoji options), exercise checkbox, and reset button
  - Implement `WellnessTracker` with `state`, `load()`, `save()`, `reset()`, `updateUI()` as per design interface
  - Clamp water at 0 (disable decrement) and 8 (disable increment)
  - Render water progress bar: width = `(water / 8) * 100%`
  - Persist state to `localStorage` key `wellness_tracker`; wrap all `localStorage` calls in try/catch
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

  - [~] 8.1 Write unit tests for WellnessTracker
    - Assert tracker section has water, mood, and exercise inputs (Req 6.1)
    - Assert reset clears all values to defaults (Req 6.5)
    - _Requirements: 6.1, 6.5_

  - [~] 8.2 Write property test for tracker UI reflects state immediately (Property 6)
    - **Property 6: Tracker UI Reflects State Immediately**
    - **Validates: Requirements 6.2**
    - For random tracker input values, assert UI display matches state after each update
    - `// Feature: womens-health-wellness-website, Property 6: Tracker UI reflects state immediately`

  - [~] 8.3 Write property test for tracker state persists across sessions (Property 7)
    - **Property 7: Tracker State Persists Across Sessions (Round Trip)**
    - **Validates: Requirements 6.3**
    - For random tracker state objects, serialize → deserialize via `load()` → assert equality
    - `// Feature: womens-health-wellness-website, Property 7: Tracker state persists across sessions`

  - [~] 8.4 Write property test for water progress bar reflects current value (Property 8)
    - **Property 8: Water Progress Bar Reflects Current Value**
    - **Validates: Requirements 6.4**
    - For random `n` in [0, 8], assert `progressBar.style.width === \`${Math.round((n/8)*100)}%\``
    - `// Feature: womens-health-wellness-website, Property 8: Water progress bar reflects current value`

- [~] 9. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Quotes Carousel (`Carousel`)
  - Add `<section id="testimonials">` with 4+ quote objects rendered as slides
  - Implement `Carousel` with `next()`, `prev()`, `goTo(index)`, `startAuto()`, `pauseAuto()` as per design interface
  - Add prev/next buttons and dot indicators; CSS opacity + transform transition (400ms)
  - Auto-advance every 5s; pause 10s on user interaction; wrap index correctly
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [~] 10.1 Write unit tests for Carousel
    - Assert section has ≥ 4 quotes (Req 7.1)
    - Assert prev/next buttons and dot indicators exist (Req 7.2)
    - Assert auto-advance timer is set up (Req 7.4)
    - Assert carousel pauses on interaction (Req 7.5)
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

  - [~] 10.2 Write property test for carousel navigation wraps correctly (Property 9)
    - **Property 9: Carousel Navigation Wraps Correctly**
    - **Validates: Requirements 7.3**
    - For random carousel index and direction, assert correct wrap-around index
    - `// Feature: womens-health-wellness-website, Property 9: Carousel navigation wraps correctly`

- [ ] 11. Blog / Resources section
  - Add `<section id="blog">` with 6+ article cards, each with Font Awesome icon, title, excerpt, and "Read More" link
  - Add hover effect (lift shadow + image scale within 200ms) via CSS
  - Add staggered `data-aos="fade-up"` with `data-aos-delay` increments on each card
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [~] 11.1 Write unit tests for Blog section
    - Assert section has ≥ 6 article cards (Req 8.1)
    - _Requirements: 8.1_

  - [~] 11.2 Write property test for article cards contain required elements (Property 23)
    - **Property 23: Article Cards Contain Required Elements**
    - **Validates: Requirements 8.2**
    - For each article card, assert icon/img, title, excerpt, and "Read More" link are present
    - `// Feature: womens-health-wellness-website, Property 23: Article cards contain required elements`

- [ ] 12. Footer and Newsletter form (`NewsletterForm`)
  - Add `<footer id="contact">` with contact info, social icons (Facebook, Instagram, Twitter/X with hover effects), and newsletter email form
  - Implement `NewsletterForm`: on valid email submit → show confirmation + clear input; on invalid → show inline error, no submit
  - Ensure footer stacks to single column below 768px
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [~] 12.1 Write unit tests for Footer
    - Assert footer contains contact info, social icons, and newsletter form (Req 9.1)
    - Assert Facebook, Instagram, Twitter/X icons are present (Req 9.2)
    - _Requirements: 9.1, 9.2_

  - [~] 12.2 Write property test for newsletter form accepts valid emails (Property 10)
    - **Property 10: Newsletter Form Accepts Valid Emails**
    - **Validates: Requirements 9.3**
    - For random valid email strings, assert confirmation shown and input cleared
    - `// Feature: womens-health-wellness-website, Property 10: Newsletter form accepts valid emails`

  - [~] 12.3 Write property test for newsletter form rejects invalid emails (Property 11)
    - **Property 11: Newsletter Form Rejects Invalid Emails**
    - **Validates: Requirements 9.4**
    - For random invalid email strings (empty, no @, no domain), assert inline error shown and input not cleared
    - `// Feature: womens-health-wellness-website, Property 11: Newsletter form rejects invalid emails`

- [ ] 13. Theme Toggle (`ThemeManager`)
  - Implement `ThemeManager` with `init()`, `toggle()`, `apply(theme)` as per design interface
  - `init()` reads `localStorage` key `theme`; falls back to `prefers-color-scheme`; calls `apply()`
  - `toggle()` flips theme and calls `save()` + `apply()`
  - `apply(theme)` sets `data-theme` on `<html>`; CSS custom properties drive all color changes with 300ms transition
  - Wire theme toggle button in nav to `ThemeManager.toggle()`
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [~] 13.1 Write unit tests for ThemeManager
    - Assert theme toggle button exists in nav (Req 10.1)
    - Assert ThemeManager defaults to `prefers-color-scheme` when no localStorage value (Req 10.5)
    - _Requirements: 10.1, 10.5_

  - [~] 13.2 Write property test for theme toggle round trip (Property 12)
    - **Property 12: Theme Toggle Is a Round Trip**
    - **Validates: Requirements 10.2**
    - For any theme, call `toggle()` twice and assert `data-theme` returns to original value
    - `// Feature: womens-health-wellness-website, Property 12: Theme toggle is a round trip`

  - [~] 13.3 Write property test for theme preference persists (Property 13)
    - **Property 13: Theme Preference Persists (Round Trip)**
    - **Validates: Requirements 10.4**
    - For any theme value, apply → save → `init()` → assert same theme applied
    - `// Feature: womens-health-wellness-website, Property 13: Theme preference persists`

- [ ] 14. Chatbot UI (`ChatbotUI`)
  - Add fixed floating action button (bottom-right) that opens/closes chat panel with CSS `transform: translateY` transition (300ms)
  - Implement `ChatbotUI` with `toggle()`, `handleInput(text)`, `appendMessage(text, sender)` as per design interface
  - Pre-load 5+ Q&A keyword pairs (stress, water, sleep, exercise, pcos) and fallback message
  - Wire text input submit to `handleInput`; append user and bot messages to chat panel
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

  - [~] 14.1 Write unit tests for ChatbotUI
    - Assert FAB exists with fixed positioning (Req 11.1)
    - Assert chat panel opens with welcome message and input on click (Req 11.2)
    - _Requirements: 11.1, 11.2_

  - [~] 14.2 Write property test for chatbot toggle round trip (Property 14)
    - **Property 14: Chatbot Toggle Is a Round Trip**
    - **Validates: Requirements 11.3**
    - For any chatbot panel state, call `toggle()` twice and assert original visibility restored
    - `// Feature: womens-health-wellness-website, Property 14: Chatbot toggle is a round trip`

  - [~] 14.3 Write property test for chatbot returns correct pre-defined responses (Property 15)
    - **Property 15: Chatbot Returns Correct Pre-Defined Responses**
    - **Validates: Requirements 11.4**
    - For each keyword in response map, assert `handleInput(keyword)` returns the mapped response
    - `// Feature: womens-health-wellness-website, Property 15: Chatbot returns correct pre-defined responses`

  - [~] 14.4 Write property test for chatbot returns fallback for unknown input (Property 16)
    - **Property 16: Chatbot Returns Fallback for Unknown Input**
    - **Validates: Requirements 11.5**
    - For random strings not containing any keyword, assert `handleInput()` returns fallback message
    - `// Feature: womens-health-wellness-website, Property 16: Chatbot returns fallback for unknown input`

- [~] 15. Checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Accessibility and performance pass
  - Add non-empty `alt` attributes to all `<img>` elements
  - Verify all interactive elements have `tabIndex >= 0` and visible `:focus` CSS styles
  - Verify CSS custom properties produce ≥ 4.5:1 contrast ratio in both light and dark themes
  - Wrap all `localStorage` calls in try/catch for graceful degradation
  - Ensure AOS and Font Awesome failures degrade gracefully (content still visible, text fallbacks for icons)
  - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6_

  - [~] 16.1 Write property test for all images have alt attributes (Property 20)
    - **Property 20: All Images Have Alt Attributes**
    - **Validates: Requirements 13.1**
    - For each `<img>` element, assert `alt` attribute is a non-empty string
    - `// Feature: womens-health-wellness-website, Property 20: All images have alt attributes`

  - [~] 16.2 Write property test for all interactive elements are keyboard focusable (Property 21)
    - **Property 21: All Interactive Elements Are Keyboard Focusable**
    - **Validates: Requirements 13.3**
    - For each button, link, and input, assert `tabIndex >= 0` and a `:focus` style is defined
    - `// Feature: womens-health-wellness-website, Property 21: All interactive elements are keyboard focusable`

  - [~] 16.3 Write property test for text contrast ratio meets WCAG AA in both themes (Property 22)
    - **Property 22: Text Contrast Ratio Meets WCAG AA in Both Themes**
    - **Validates: Requirements 13.4**
    - For each text element in both light and dark themes, assert contrast ratio ≥ 4.5:1
    - `// Feature: womens-health-wellness-website, Property 22: Text contrast ratio meets WCAG AA`

- [~] 17. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with a minimum of 100 iterations per property
- Unit tests use Vitest with jsdom environment
- All `localStorage` access must be wrapped in try/catch for graceful degradation
- AOS and Font Awesome are loaded via CDN; failures must not break content rendering
