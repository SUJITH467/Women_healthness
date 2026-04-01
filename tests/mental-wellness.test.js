// Feature: womens-health-wellness-website, Section: Mental Wellness

import { describe, it, expect, beforeEach } from 'vitest';

describe('Mental Wellness section', () => {
  beforeEach(() => {
    loadDocument();
  });

  it('contains stress, mindfulness, and emotional health content', () => {
    const accordion = document.getElementById('mental-wellness-accordion');
    expect(accordion).toBeTruthy();
    const items = accordion.querySelectorAll('.accordion-item');
    expect(items.length).toBe(3);
    const texts = Array.from(items).map(item => item.textContent.toLowerCase());
    expect(texts.some(text => text.includes('stress'))).toBe(true);
    expect(texts.some(text => text.includes('mindfulness'))).toBe(true);
    expect(texts.some(text => text.includes('emotional'))).toBe(true);
  });
});