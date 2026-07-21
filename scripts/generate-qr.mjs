#!/usr/bin/env node

/**
 * Generador de código QR para la expoferia.
 *
 * Uso:
 *   npm run qr -- https://tu-dominio.com
 *
 * Genera:
 *   public/qr-expo.svg
 *   public/qr-expo.png
 */

import { writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '..', 'public');

const url = process.argv[2];

if (!url || !url.startsWith('http')) {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║            Generador de QR — Nutrición Animal               ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Uso:                                                        ║
║    npm run qr -- https://tu-dominio.com                      ║
║                                                              ║
║  Ejemplo:                                                    ║
║    npm run qr -- https://nutricion-animal.vercel.app         ║
║                                                              ║
║  Se generarán:                                               ║
║    public/qr-expo.svg                                        ║
║    public/qr-expo.png                                        ║
║                                                              ║
║  ⚠ No uses una URL de localhost.                             ║
║  ⚠ Usa la URL pública definitiva (HTTPS).                   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
  process.exit(1);
}

async function generate() {
  try {
    const QRCode = await import('qrcode');

    // SVG
    const svgString = await QRCode.toString(url, {
      type: 'svg',
      errorCorrectionLevel: 'H',
      margin: 4,
      width: 512,
      color: { dark: '#143B63', light: '#FFFFFF' },
    });
    const svgPath = resolve(publicDir, 'qr-expo.svg');
    writeFileSync(svgPath, svgString, 'utf-8');
    console.log(`✓ SVG generado: ${svgPath}`);

    // PNG
    const pngPath = resolve(publicDir, 'qr-expo.png');
    await QRCode.toFile(pngPath, url, {
      errorCorrectionLevel: 'H',
      margin: 4,
      width: 512,
      color: { dark: '#143B63', light: '#FFFFFF' },
    });
    console.log(`✓ PNG generado: ${pngPath}`);

    console.log(`\n✓ QR listo para: ${url}`);
    console.log('  Prueba el QR con varios teléfonos antes de imprimir.');
  } catch (error) {
    console.error('Error al generar el QR:', error.message);
    process.exit(1);
  }
}

generate();
