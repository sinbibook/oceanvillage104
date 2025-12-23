/**
 * Popup Modal Handler
 * - Auto-show on page load
 * - "Don't show today" functionality with localStorage
 * - Close on overlay click, button click, or ESC key
 * - Accessibility: focus management and focus trap
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'popup_hidden_until';

  const popupOverlay = document.getElementById('popup-modal');
  const popupClose = document.querySelector('.popup-close');
  const popupConfirmBtn = document.querySelector('.popup-confirm-btn');
  const popupTodayHide = document.getElementById('popup-today-hide');
  const popupContainer = document.querySelector('.popup-container');

  if (!popupOverlay) return;

  let previouslyFocusedElement = null;

  /**
   * Get all focusable elements within the popup
   */
  function getFocusableElements() {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])'
    ].join(', ');

    return popupContainer.querySelectorAll(focusableSelectors);
  }

  /**
   * Trap focus within the popup
   */
  function trapFocus(e) {
    if (e.key !== 'Tab') return;

    const focusableElements = getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      // Shift + Tab: go to last element if on first
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab: go to first element if on last
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }

  /**
   * Check if popup should be shown
   */
  function shouldShowPopup() {
    const hiddenUntil = localStorage.getItem(STORAGE_KEY);
    if (!hiddenUntil) return true;

    const now = new Date().getTime();
    return now > parseInt(hiddenUntil, 10);
  }

  /**
   * Show popup with animation
   */
  function showPopup() {
    previouslyFocusedElement = document.activeElement;
    popupOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Move focus to close button after animation
    setTimeout(function() {
      if (popupClose) popupClose.focus();
    }, 300);
  }

  /**
   * Hide popup with animation
   */
  function hidePopup() {
    // If "don't show today" is checked, save to localStorage
    if (popupTodayHide && popupTodayHide.checked) {
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0); // Set to midnight tonight
      localStorage.setItem(STORAGE_KEY, tomorrow.getTime().toString());
    }

    popupOverlay.classList.remove('active');
    document.body.style.overflow = '';

    // Restore focus to previously focused element
    if (previouslyFocusedElement) {
      previouslyFocusedElement.focus();
    }
  }

  /**
   * Initialize popup
   */
  function init() {
    // Check if popup should be shown
    if (!shouldShowPopup()) return;

    // Show popup after a short delay for better UX
    setTimeout(showPopup, 500);

    // Close button click
    if (popupClose) {
      popupClose.addEventListener('click', hidePopup);
    }

    // Confirm button click
    if (popupConfirmBtn) {
      popupConfirmBtn.addEventListener('click', hidePopup);
    }

    // Overlay click (close when clicking outside)
    popupOverlay.addEventListener('click', function(e) {
      if (e.target === popupOverlay) {
        hidePopup();
      }
    });

    // Keyboard events: ESC to close, Tab for focus trap
    document.addEventListener('keydown', function(e) {
      if (!popupOverlay.classList.contains('active')) return;

      if (e.key === 'Escape') {
        hidePopup();
      } else if (e.key === 'Tab') {
        trapFocus(e);
      }
    });

    // Prevent popup container click from closing
    if (popupContainer) {
      popupContainer.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
