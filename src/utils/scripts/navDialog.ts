const CLOSING_CLASS = 'closing';
const ACTIVE_CLASS = 'active';
const MD_BREAKPOINT = 768;

interface NavDialogElements {
  dialog: HTMLDialogElement;
  toggle: HTMLElement | null;
  backdrop: HTMLElement | null;
}

let elements: NavDialogElements | undefined;

function getElements(): NavDialogElements | undefined {
  if (elements) return elements;

  const dialog = document.getElementById(
    'nav-dialog',
  ) as HTMLDialogElement | null;
  const toggle = document.getElementById('nav-toggle');
  const backdrop = document.getElementById('nav-backdrop');

  if (!dialog) return undefined;

  elements = { dialog, toggle, backdrop };
  return elements;
}

export function openNav(): void {
  const els = getElements();
  if (!els || window.innerWidth >= MD_BREAKPOINT) return;

  els.dialog.show();
  els.backdrop?.classList.add(ACTIVE_CLASS);
  els.toggle?.setAttribute('aria-expanded', 'true');
}

export function closeNav(): void {
  const els = getElements();
  if (!els || !els.dialog.open) return;

  // Animate out: add closing class, wait for transition, then close
  els.dialog.classList.add(CLOSING_CLASS);
  els.backdrop?.classList.remove(ACTIVE_CLASS);
  els.toggle?.setAttribute('aria-expanded', 'false');

  const onEnd = (): void => {
    els.dialog.classList.remove(CLOSING_CLASS);
    els.dialog.close();
    els.dialog.removeEventListener('transitionend', onEnd);
  };

  els.dialog.addEventListener('transitionend', onEnd);
}

export function isNavOpen(): boolean {
  const els = getElements();
  return els?.dialog.open ?? false;
}

/** Force-close the dialog without animation (for viewport changes) */
function forceClose(): void {
  const els = getElements();
  if (!els || !els.dialog.open) return;

  els.dialog.classList.remove(CLOSING_CLASS);
  els.dialog.close();
  els.backdrop?.classList.remove(ACTIVE_CLASS);
  els.toggle?.setAttribute('aria-expanded', 'false');
}

/** Auto-close when viewport crosses the md breakpoint */
const mdQuery = window.matchMedia(`(min-width: ${MD_BREAKPOINT}px)`);
mdQuery.addEventListener('change', (e) => {
  if (e.matches) {
    forceClose();
  }
});
