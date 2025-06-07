import pako from 'pako';
import { Buffer } from 'buffer';

export function compressAndEncode(input: string): string {
  const compressed = pako.deflate(input);
  return Buffer.from(compressed).toString('base64');
}