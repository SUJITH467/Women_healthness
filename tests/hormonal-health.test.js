// Feature: womens-health-wellness-website, Section: Hormonal Health

import { describe, it, expect, beforeEach } from 'vitest';

describe('Hormonal Health section', () => {
  beforeEach(() => {
    loadDocument();
  });

  it('contains menstrual health, pregnancy, and PCOS panels', () => {
    const container = document.getElementById('hormonal-health-tabs');
    expect(container).toBeTruthy();
    const panels = container.querySelectorAll('.tab-panel');
    expect(panels.length).toBe(3);
    const texts = Array.from(panels).map(panel => panel.textContent.toLowerCase());
    expect(texts.some(text => text.includes('menstrual'))).toBe(true);
    expect(texts.some(text => text.includes('pregnancy'))).toBe(true);
    expect(texts.some(text => text.includes('pcos'))).toBe(true);
  });
});