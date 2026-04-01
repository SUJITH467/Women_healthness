// Feature: womens-health-wellness-website, Section: Physical Health

import { describe, it, expect, beforeEach } from 'vitest';

describe('Physical Health section', () => {
  beforeEach(() => {
    loadDocument();
  });

  it('has at least 3 cards', () => {
    const cards = document.querySelectorAll('#physical-health-cards .card');
    expect(cards.length).toBeGreaterThanOrEqual(3);
  });
});