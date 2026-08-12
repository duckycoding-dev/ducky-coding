export type ReadTimeLabelStyle = 'long' | 'short';

export function formatReadTime(
  minutes: number,
  style: ReadTimeLabelStyle = 'short',
): string {
  return style === 'long' ? `${minutes}-minute read` : `${minutes} min read`;
}
