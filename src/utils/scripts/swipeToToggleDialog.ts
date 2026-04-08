import { closeNav, isNavOpen, openNav } from './navDialog';

export function initSwipeNavigation(): void {
  let touchStartX = 0;
  let touchEndX = 0;
  const minSwipeDistance = 100;

  const handleTouchStart = (event: TouchEvent): void => {
    touchStartX = event.changedTouches[0]?.screenX ?? 0;
  };

  const handleSwipe = (): void => {
    const swipeDistance = touchEndX - touchStartX;

    if (Math.abs(swipeDistance) < minSwipeDistance) return;

    if (swipeDistance > 0 && !isNavOpen()) {
      openNav();
    } else if (swipeDistance < 0 && isNavOpen()) {
      closeNav();
    }
  };

  const handleTouchEnd = (event: TouchEvent): void => {
    touchEndX = event.changedTouches[0]?.screenX ?? 0;
    handleSwipe();
  };

  document.addEventListener('touchstart', handleTouchStart, false);
  document.addEventListener('touchend', handleTouchEnd, false);
}
