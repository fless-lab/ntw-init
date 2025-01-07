const magicNumbers: { type: string; signature?: number[] }[] = [
  { type: 'JPEG', signature: [0xff, 0xd8, 0xff] },
  { type: 'PNG', signature: [0x89, 0x50, 0x4e, 0x47] },
  { type: 'GIF', signature: [0x47, 0x49, 0x46, 0x38] },
  { type: 'PDF', signature: [0x25, 0x50, 0x44, 0x46] },
  { type: 'ZIP', signature: [0x50, 0x4b, 0x03, 0x04] },
  { type: 'TXT' },
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
