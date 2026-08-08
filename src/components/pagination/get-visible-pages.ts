/**
 * Compute which page numbers to show.
 * Always: first, last, current, ±1 neighbor.
 * Ellipsis when gap > 1. Show all if ≤ 5 pages.
 */
export function getVisiblePages(
  current: number,
  total: number,
): (number | 'ellipsis')[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  pages.add(current);
  if (current > 1) pages.add(current - 1);
  if (current < total) pages.add(current + 1);

  const sorted = [...pages].sort((a, b) => a - b);
  const result: (number | 'ellipsis')[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const page = sorted[i];
    if (page === undefined) continue;
    const prev = sorted[i - 1];
    if (prev !== undefined && page - prev > 1) {
      result.push('ellipsis');
    }
    result.push(page);
  }

  return result;
}
