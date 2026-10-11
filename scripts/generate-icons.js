import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + len));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function createPng(size, isMaskable = false) {
  const width = size;
  const height = size;
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(height * rowLength);

  const cx = width / 2;
  const cy = height / 2;
  const r = width * (isMaskable ? 0.38 : 0.44);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (isMaskable) {
        // Full bleed background for maskable
        let bgR = 136, bgG = 19, bgB = 55; // PKS Crimson #881337
        if (dist <= r) {
          // Inside emblem circle - Gold gradient
          const goldRatio = Math.max(0, Math.min(1, (y / height)));
          const gr = Math.round(245 * (1 - goldRatio * 0.2));
          const gg = Math.round(158 * (1 - goldRatio * 0.2));
          const gb = 11;
          rawData[pxOffset] = gr;
          rawData[pxOffset + 1] = gg;
          rawData[pxOffset + 2] = gb;
          rawData[pxOffset + 3] = 255;
        } else {
          rawData[pxOffset] = bgR;
          rawData[pxOffset + 1] = bgG;
          rawData[pxOffset + 2] = bgB;
          rawData[pxOffset + 3] = 255;
        }
      } else {
        // Rounded squircle / icon background
        const cornerR = width * 0.22;
        const inBox = Math.abs(dx) <= (cx - cornerR) || Math.abs(dy) <= (cy - cornerR);
        const nearCorner = Math.abs(dx) > (cx - cornerR) && Math.abs(dy) > (cy - cornerR);
        const cornerDist = Math.sqrt(Math.pow(Math.abs(dx) - (cx - cornerR), 2) + Math.pow(Math.abs(dy) - (cy - cornerR), 2));
        const insideRoundedRect = inBox || (nearCorner && cornerDist <= cornerR);

        if (insideRoundedRect) {
          if (dist <= r * 0.72) {
            // Gold radar core
            rawData[pxOffset] = 245;
            rawData[pxOffset + 1] = 158;
            rawData[pxOffset + 2] = 11;
            rawData[pxOffset + 3] = 255;
          } else {
            // Maroon crimson background
            rawData[pxOffset] = 136; // #881337
            rawData[pxOffset + 1] = 19;
            rawData[pxOffset + 2] = 55;
            rawData[pxOffset + 3] = 255;
          }
        } else {
          // Transparent
          rawData[pxOffset] = 0;
          rawData[pxOffset + 1] = 0;
          rawData[pxOffset + 2] = 0;
          rawData[pxOffset + 3] = 0;
        }
      }
    }
  }

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // ColorType RGBA
  ihdrData[10] = 0; // Compression
  ihdrData[11] = 0; // Filter
  ihdrData[12] = 0; // Interlace

  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrChunk = makeChunk('IHDR', ihdrData);
  const idatChunk = makeChunk('IDAT', zlib.deflateSync(rawData));
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, true));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(64, false));

console.log('PWA PNG Icons successfully generated in public/');
