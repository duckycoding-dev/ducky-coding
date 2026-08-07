export function initScrollToTopButton(buttonId: string): void {
  const button = document.getElementById(buttonId);
  if (!button) return;

  const minimumHeightToShow =
    window.innerHeight ?? document.documentElement.clientHeight;

  const toggleButtonVisibility = (): void => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > minimumHeightToShow) {
      button.tabIndex = 0;
      button.classList.add('opacity-100', 'pointer-events-auto');
      button.classList.remove('opacity-0', 'pointer-events-none');
    } else {
      button.tabIndex = -1;
      button.classList.add('opacity-0', 'pointer-events-none');
      button.classList.remove('opacity-100', 'pointer-events-auto');
    }
  };

  window.addEventListener('scroll', toggleButtonVisibility, {
    passive: true,
  });

  toggleButtonVisibility();
}
