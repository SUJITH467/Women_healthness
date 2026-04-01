// Feature: womens-health-wellness-website, Section: Blog

import { describe, it, expect, beforeEach } from 'vitest';

describe('Blog section', () => {
  beforeEach(() => {
    loadDocument();
  });

  it('section has ≥ 6 article cards', () => {
    const cards = document.querySelectorAll('#blog-cards .card');
    expect(cards.length).toBeGreaterThanOrEqual(6);
  });
});