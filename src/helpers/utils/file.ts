const magicNumbers: { type: string; signature?: number[] }[] = [
  // fichiers
  { type: 'JPEG', signature: [0xff, 0xd8, 0xff] },
  { type: 'PNG', signature: [0x89, 0x50, 0x4e, 0x47] },
  { type: 'GIF', signature: [0x47, 0x49, 0x46, 0x38] },
  { type: 'PDF', signature: [0x25, 0x50, 0x44, 0x46] },
  { type: 'ZIP', signature: [0x50, 0x4b, 0x03, 0x04] },
  { type: 'TXT' },
  // Vidéos
  { type: 'MP4', signature: [0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70] },
  { type: 'MP4', signature: [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70] },
  { type: 'AVI', signature: [0x52, 0x49, 0x46, 0x46] },
  { type: 'MKV', signature: [0x1a, 0x45, 0xdf, 0xa3] },
  { type: 'MOV', signature: [0x00, 0x00, 0x00, 0x14, 0x66, 0x74, 0x79, 0x70] },
  // Audio
  { type: 'MP3', signature: [0x49, 0x44, 0x33] },
  { type: 'WAV', signature: [0x52, 0x49, 0x46, 0x46] },
  { type: 'FLAC', signature: [0x66, 0x4c, 0x61, 0x43] },
  { type: 'AAC', signature: [0xff, 0xf1] },
  { type: 'OGG', signature: [0x4f, 0x67, 0x67, 0x53] },
];

export const detectFileType = async (buffer: Buffer): Promise<string> => {
  for (const { type, signature } of magicNumbers) {
    if (
      signature &&
      buffer.slice(0, signature.length).equals(Buffer.from(signature))
    ) {
      return type;
    }
  }

  const isText = buffer.toString('utf-8').match(/^[\x20-\x7E\s]+$/);
  if (isText) {
    return 'TXT';
  }

  return 'unknown';
};
