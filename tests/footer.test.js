// Feature: womens-health-wellness-website, Section: Footer

import { describe, it, expect, beforeEach } from 'vitest';

describe('Footer', () => {
  beforeEach(() => {
    loadDocument();
  });

  it('footer contains contact info, social icons, and newsletter form', () => {
    const footer = document.getElementById('contact');
    expect(footer).toBeTruthy();
    expect(footer.textContent.toLowerCase()).toContain('contact');
    expect(document.querySelectorAll('.social-link').length).toBe(3);
    expect(document.getElementById('newsletter-form')).toBeTruthy();
  });

  it('Facebook, Instagram, Twitter/X icons are present', () => {
    const socialLinks = document.querySelectorAll('.social-link');
    const hrefs = Array.from(socialLinks).map(link => link.getAttribute('href'));
    expect(hrefs.some(href => href.includes('facebook'))).toBe(true);
    expect(hrefs.some(href => href.includes('instagram'))).toBe(true);
    expect(hrefs.some(href => href.includes('twitter'))).toBe(true);
  });
});