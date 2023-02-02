import { z } from 'zod';
import { nonEmptyString, uint8Array } from '../../lib/schemas/customTypes';

// _id is the ASCII hex string of the sha256 hash of the blob contents
export const Blob = z.object({
  // Blob contents
  value: uint8Array,
  // Browser-detected MIME type, like 'image/png'
  mimeType: nonEmptyString,
  // ASCII hex string of the md5 digest of the blob contents, like
  // 'd41d8cd98f00b204e9800998ecf8427e'
  md5: z.string().regex(/^[0-9a-fA-F]{32}$/),
  // Size, in bytes, of the blob contents.
  size: z.number().int().nonnegative(),
});

export default Blob;
