const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPngBuffer(width, height, r, g, b) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type RGB
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data (Filter byte 0 + RGB per pixel)
  const rowSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const offset = y * rowSize;
    rawData[offset] = 0; // Filter 0
    for (let x = 0; x < width; x++) {
      const pxOffset = offset + 1 + x * 3;
      // Draw rounded/colored icon pattern
      const dx = x - width / 2;
      const dy = y - height / 2;
      const distSq = dx * dx + dy * dy;
      const maxDistSq = (width * 0.45) * (width * 0.45);

      if (distSq < maxDistSq) {
        // Gold #E8A93B center symbol area
        if (Math.abs(dx) < width * 0.25 && Math.abs(dy) < height * 0.25) {
          rawData[pxOffset] = 232;
          rawData[pxOffset + 1] = 169;
          rawData[pxOffset + 2] = 59;
        } else {
          rawData[pxOffset] = r;
          rawData[pxOffset + 1] = g;
          rawData[pxOffset + 2] = b;
        }
      } else {
        // Dark emerald background #1B3B36
        rawData[pxOffset] = 27;
        rawData[pxOffset + 1] = 59;
        rawData[pxOffset + 2] = 54;
      }
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const typeAndData = Buffer.concat([typeBuf, data]);

  const crc = crc32(typeAndData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc >>> 0, 0);

  return Buffer.concat([length, typeAndData, crcBuf]);
}

function crc32(buf) {
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
    }
  }
  return (crc ^ -1) >>> 0;
}

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

console.log('Generating PWA PNG Icons...');
fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), createPngBuffer(192, 192, 79, 121, 66));
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), createPngBuffer(512, 512, 79, 121, 66));
console.log('Done generating icon-192.png and icon-512.png!');
