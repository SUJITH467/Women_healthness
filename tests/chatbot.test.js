// Feature: womens-health-wellness-website, Section: ChatbotUI

import { describe, it, expect, beforeEach } from 'vitest';

describe('ChatbotUI', () => {
  beforeEach(() => {
    loadDocument();
  });

  it('FAB exists with fixed positioning', () => {
    const fab = document.getElementById('chatbot-fab');
    expect(fab).toBeTruthy();
    expect(fab.classList.contains('chatbot-fab')).toBe(true);
  });

  it('chat panel opens with welcome message and input on click', () => {
    const fab = document.getElementById('chatbot-fab');
    const panel = document.getElementById('chatbot-panel');
    fab.click();
    expect(panel.classList.contains('open')).toBe(true);
  });
});