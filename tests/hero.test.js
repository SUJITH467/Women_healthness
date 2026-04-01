// Feature: womens-health-wellness-website, Section: Hero

import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Hero section', () => {
  beforeEach(() => {
    loadDocument();
  });

  it('clicking CTA button triggers scroll to #physical-health', () => {
    const cta = document.querySelector('.cta-btn');
    const target = document.getElementById('physical-health');
    const mockScrollIntoView = vi.fn();
    target.scrollIntoView = mockScrollIntoView;

    cta.click();

    expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' });
  });
});