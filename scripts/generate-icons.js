import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'icons');

const sizes = [16, 48, 128];

// Simple, minimal pencil icon
const svgTemplate = (size) => `
<svg width="${size}" height="${size}" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
  <rect width="128" height="128" rx="28" fill="#5046e5"/>
  <g transform="translate(28, 28)">
    <path d="M60 12L12 60L8 68L16 64L64 16L60 12Z" fill="white" opacity="0.9"/>
    <path d="M52 8L64 20" stroke="white" stroke-width="8" stroke-linecap="round"/>
    <path d="M12 60L8 68L16 64" stroke="white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  </g>
</svg>
`;

async function generateIcons() {
  await mkdir(iconsDir, { recursive: true });

  for (const size of sizes) {
    const svg = svgTemplate(size);
    const buffer = Buffer.from(svg);

    await sharp(buffer)
      .resize(size, size)
      .png()
      .toFile(join(iconsDir, `icon${size}.png`));

    console.log(`Generated icon${size}.png`);
  }

  console.log('All icons generated!');
}

generateIcons().catch(console.error);
