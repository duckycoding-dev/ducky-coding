export const swipeToTriggerCheckbox = (checkbox: HTMLInputElement) => {
  // Swipe detection variables
  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 100; // Minimum distance to be considered a swipe

  function handleTouchStart(event: TouchEvent) {
    touchStartX = event.changedTouches[0]?.screenX ?? 0;
  }

  // Function to determine swipe direction and update checkbox
  function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) < minSwipeDistance) {
      return; // Not a significant swipe
    }

    if (swipeDistance > 0) {
      // Right swipe
      checkbox.checked = true;
    } else {
      // Left swipe
      checkbox.checked = false;
    }
  }

  function handleTouchEnd(event: TouchEvent) {
    touchEndX = event.changedTouches[0]?.screenX ?? 0;
    handleSwipe();
  }

  // Add event listeners
  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchend', handleTouchEnd, false);
};
