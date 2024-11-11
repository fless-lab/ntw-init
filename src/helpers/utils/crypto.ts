import * as crypto from 'crypto';

/**
 * @param text
 * @param secretKey
 * @returns
 */

export function encryptAES(text: string, secretKey: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * @param encryptedText
 * @param secretKey
 * @returns
 */
export function decryptAES(encryptedText: string, secretKey: string): string {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift() as string, 'hex');
  const encrypted = textParts.join(':');
  const key = crypto.scryptSync(secretKey, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
