import { describe, expect, it } from 'vitest';

import { renderCardShell, TITLE_BOX } from './card-shell.ts';

const BASE = {
  title: 'A title',
  titleFontSize: 88,
  chips: [{ label: 'HTML', tone: 'accent' as const }],
  logoPath: '/tmp/logo.png',
  width: 1200,
  height: 630,
};

describe('renderCardShell', () => {
  it('includes the title and its computed size', () => {
    const html = renderCardShell({ ...BASE, title: 'Hello world' });
    expect(html).toContain('Hello world');
    expect(html).toContain('88px');
  });

  it('escapes text that would break the markup', () => {
    const html = renderCardShell({
      ...BASE,
      title: 'Tags & <script>alert("x")</script>',
    });
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('&amp;');
  });

  it('renders every chip with its tone colour', () => {
    const html = renderCardShell({
      ...BASE,
      chips: [
        { label: 'HTML', tone: 'accent' },
        { label: 'a18y', tone: 'accent2' },
      ],
    });
    expect(html).toContain('HTML');
    expect(html).toContain('a18y');
    expect(html).toContain('#ff3de9');
    expect(html).toContain('#3de9ff');
  });

  it('omits the eyebrow when not supplied', () => {
    const without = renderCardShell(BASE);
    const withIt = renderCardShell({ ...BASE, eyebrow: '/posts/thing' });
    expect(withIt).toContain('/posts/thing');
    expect(without).not.toContain('/posts/');
  });

  it('omits the trailing text when not supplied', () => {
    const withIt = renderCardShell({ ...BASE, trailing: '5 min read' });
    expect(withIt).toContain('5 min read');
    expect(renderCardShell(BASE)).not.toContain('min read');
  });

  it('embeds the logo path as the watermark', () => {
    const html = renderCardShell({ ...BASE, logoPath: '/x/duck.png' });
    expect(html).toContain('/x/duck.png');
  });

  it('carries the agreed frame values', () => {
    const html = renderCardShell(BASE);
    expect(html).toContain('#ccf9ff'); // 28px margin colour
    expect(html).toContain('28px');
    expect(html).toContain('1200px');
    expect(html).toContain('630px');
  });

  it('exposes a title box smaller than the canvas', () => {
    expect(TITLE_BOX.width).toBeLessThan(1200);
    expect(TITLE_BOX.height).toBeLessThan(630);
    expect(TITLE_BOX.width).toBeGreaterThan(0);
    expect(TITLE_BOX.height).toBeGreaterThan(0);
  });

  it('derives the title box from the real frame geometry', () => {
    // Pinned deliberately. A hand-written box that disagrees with the rendered
    // layout makes the fitted title overflow and pushes the meta row out of the
    // plate — which is exactly what happened with a 1080x326 guess.
    // width:  1200 - 2*28 margin - 2*8 border - 2*52 padding
    expect(TITLE_BOX.width).toBe(1024);
    // height: 630 - 2*28 - 2*8 - 2*52, less eyebrow 58, meta 74, two 26 gaps
    expect(TITLE_BOX.height).toBe(270);
  });

  it('renders no chips at all when given an empty list', () => {
    const html = renderCardShell({ ...BASE, chips: [] });
    expect(html).not.toContain('class="chip"');
  });
});
