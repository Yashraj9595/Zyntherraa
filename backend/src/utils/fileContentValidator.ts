import fs from 'fs';
import path from 'path';

// Magic bytes (file signatures) for common file types
const FILE_SIGNATURES: Record<string, string[][]> = {
  // Images
  'image/jpeg': [
    ['FF', 'D8', 'FF'], // JPEG
  ],
  'image/png': [
    ['89', '50', '4E', '47', '0D', '0A', '1A', '0A'], // PNG
  ],
  'image/gif': [
    ['47', '49', '46', '38', '37', '61'], // GIF87a
    ['47', '49', '46', '38', '39', '61'], // GIF89a
  ],
  'image/webp': [
    ['52', '49', '46', '46'], // RIFF (WebP starts with RIFF)
  ],
  // Videos
  'video/mp4': [
    ['00', '00', '00', '18', '66', '74', '79', '70', '6D', '70', '34', '32'], // MP4
    ['00', '00', '00', '20', '66', '74', '79', '70', '6D', '70', '34', '32'], // MP4
    ['00', '00', '00', '1C', '66', '74', '79', '70', '69', '73', '6F', '6D'], // MP4 (ISO Media)
  ],
  'video/webm': [
    ['1A', '45', 'DF', 'A3'], // WebM
  ],
  // Documents
  'application/pdf': [
    ['25', '50', '44', '46'], // %PDF
  ],
  'application/msword': [
    ['D0', 'CF', '11', 'E0', 'A1', 'B1', '1A', 'E1'], // MS Office (old format)
  ],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
    ['50', '4B', '03', '04'], // ZIP/Office Open XML (new format)
  ],
};

/**
 * Convert hex string to buffer for comparison
 */
function hexToBuffer(hex: string[]): Buffer {
  return Buffer.from(hex.map(h => parseInt(h, 16)));
}

/**
 * Check if file content matches expected MIME type by checking magic bytes
 */
export async function validateFileContent(
  filePath: string,
  expectedMimeType: string
): Promise<boolean> {
  try {
    // Get file signature patterns for expected MIME type
    const signatures = FILE_SIGNATURES[expectedMimeType];
    
    if (!signatures || signatures.length === 0) {
      // If we don't have a signature for this type, allow it (fallback to extension check)
      console.warn(`No file signature validation for MIME type: ${expectedMimeType}`);
      return true;
    }

    // Read first bytes of file (up to longest signature length)
    const maxSignatureLength = Math.max(...signatures.map(sig => sig.length));
    const buffer = Buffer.allocUnsafe(maxSignatureLength);
    const fd = fs.openSync(filePath, 'r');
    const bytesRead = fs.readSync(fd, buffer, 0, maxSignatureLength, 0);
    fs.closeSync(fd);

    if (bytesRead < maxSignatureLength) {
      // File too small, can't validate
      return false;
    }

    // Check if file matches any of the expected signatures
    for (const signature of signatures) {
      const signatureBuffer = hexToBuffer(signature);
      if (buffer.subarray(0, signature.length).equals(signatureBuffer)) {
        return true;
      }
    }

    // Special handling for WebP (needs to check for WEBP string after RIFF)
    if (expectedMimeType === 'image/webp') {
      // WebP files: RIFF...WEBP
      if (buffer.subarray(0, 4).toString('hex') === '52494646') {
        // Check for WEBP at position 8
        const webpCheck = Buffer.allocUnsafe(4);
        const fd2 = fs.openSync(filePath, 'r');
        fs.readSync(fd2, webpCheck, 0, 4, 8);
        fs.closeSync(fd2);
        if (webpCheck.toString('ascii') === 'WEBP') {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Error validating file content:', error);
    return false;
  }
}

/**
 * Validate file content from Express Multer file object
 */
export async function validateUploadedFileContent(
  file: Express.Multer.File,
  expectedMimeType: string
): Promise<boolean> {
  try {
    // If file is in memory (buffer), check buffer directly
    if (file.buffer) {
      return validateFileContentFromBuffer(file.buffer, expectedMimeType);
    }

    // If file is on disk, use file path
    if (file.path) {
      return await validateFileContent(file.path, expectedMimeType);
    }

    // Fallback: can't validate
    console.warn('Cannot validate file content: file has no buffer or path');
    return true; // Allow to prevent breaking existing functionality
  } catch (error) {
    console.error('Error validating uploaded file content:', error);
    return false;
  }
}

/**
 * Validate file content from buffer (for in-memory files)
 */
function validateFileContentFromBuffer(
  buffer: Buffer,
  expectedMimeType: string
): boolean {
  try {
    const signatures = FILE_SIGNATURES[expectedMimeType];
    
    if (!signatures || signatures.length === 0) {
      return true; // No signature to check
    }

    const maxSignatureLength = Math.max(...signatures.map(sig => sig.length));
    
    if (buffer.length < maxSignatureLength) {
      return false;
    }

    // Check if buffer matches any of the expected signatures
    for (const signature of signatures) {
      const signatureBuffer = hexToBuffer(signature);
      if (buffer.subarray(0, signature.length).equals(signatureBuffer)) {
        return true;
      }
    }

    // Special handling for WebP
    if (expectedMimeType === 'image/webp') {
      if (buffer.subarray(0, 4).toString('hex') === '52494646') {
        if (buffer.length >= 12 && buffer.subarray(8, 12).toString('ascii') === 'WEBP') {
          return true;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('Error validating file content from buffer:', error);
    return false;
  }
}

