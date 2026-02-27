import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import type { SatoriOptions } from 'satori';

const GOOGLE_FONTS_CSS =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;700&display=swap';

async function loadFonts(): Promise<{ bold: ArrayBuffer; regular: ArrayBuffer }> {
  // Fetch the CSS to extract font URLs
  // Use an older IE User-Agent to get TTF format (satori doesn't support woff2)
  const css = await fetch(GOOGLE_FONTS_CSS, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; Trident/6.0)',
    },
  }).then((res) => res.text());

  // Extract font URLs — Google returns regular first, then bold
  const urls = [...css.matchAll(/src:\s*url\(([^)]+)\)/g)].map((m) => m[1]);
  if (urls.length < 2) throw new Error('Failed to extract font URLs from Google Fonts CSS');

  const [regular, bold] = await Promise.all(
    urls.map((url) => fetch(url).then((res) => res.arrayBuffer())),
  );
  return { bold, regular };
}

let fontCache: { bold: ArrayBuffer; regular: ArrayBuffer } | null = null;

async function getFonts() {
  if (!fontCache) {
    fontCache = await loadFonts();
  }
  return fontCache;
}

function getAvatarDataUri(): string {
  const avatarPath = join(process.cwd(), 'public/images/avatar.png');
  const buffer = readFileSync(avatarPath);
  return `data:image/png;base64,${buffer.toString('base64')}`;
}

export async function generateOgImage(
  title: string,
  description?: string,
): Promise<Buffer> {
  const fonts = await getFonts();
  const avatarUri = getAvatarDataUri();

  const opts: SatoriOptions = {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Bricolage Grotesque',
        data: fonts.bold,
        weight: 700,
        style: 'normal',
      },
      {
        name: 'Bricolage Grotesque',
        data: fonts.regular,
        weight: 400,
        style: 'normal',
      },
    ],
  };

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: description ? 'space-between' : 'center',
          ...(description ? {} : { gap: '48px' }),
          background: 'linear-gradient(145deg, #4f8ff7 0%, #3b82f6 40%, #2563eb 100%)',
          padding: '64px 72px',
        },
        children: [
          // Top: Author byline (avatar + site name together)
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              },
              children: [
                {
                  type: 'img',
                  props: {
                    src: avatarUri,
                    width: 52,
                    height: 52,
                    style: {
                      borderRadius: '50%',
                    },
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 28,
                      fontFamily: 'Bricolage Grotesque',
                      fontWeight: 700,
                      color: 'rgba(255, 255, 255, 0.9)',
                      letterSpacing: '-0.01em',
                    },
                    children: 'aristotle.me',
                  },
                },
              ],
            },
          },
          // Title + description area — pushed to bottom
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: description
                        ? (title.length > 60 ? 48 : title.length > 40 ? 56 : 64)
                        : (title.length > 60 ? 56 : title.length > 40 ? 64 : 72),
                      fontFamily: 'Bricolage Grotesque',
                      fontWeight: 700,
                      color: 'white',
                      lineHeight: 1.15,
                      letterSpacing: '-0.02em',
                    },
                    children: title,
                  },
                },
                ...(description
                  ? [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: 28,
                            fontFamily: 'Bricolage Grotesque',
                            fontWeight: 400,
                            color: 'rgba(255, 255, 255, 0.7)',
                            lineHeight: 1.45,
                            marginTop: '20px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          },
                          children: description,
                        },
                      },
                    ]
                  : []),
              ],
            },
          },
        ],
      },
    },
    opts,
  );

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: 1200 },
  });
  const pngData = resvg.render();
  return pngData.asPng();
}
