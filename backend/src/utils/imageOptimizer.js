import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert an image to WebP with 80 quality and save it.
 *
 * @param {string} inputFilePath - Full path to the original image
 * @returns {Promise<string|null>} Path/filename of the newly generated WebP file
 */
export const optimizeToWebp = async (inputFilePath) => {
  try {
    const ext = path.extname(inputFilePath).toLowerCase();
    
    // Only process jpg, jpeg, png
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      console.warn(`[ImageOptimizer] Unsupported file extension: ${ext}`);
      return null;
    }

    const fileName = path.basename(inputFilePath, ext);
    const webpFileName = `${fileName}.webp`;
    
    // Construct path for the generated webp image inside public/images/webp directory
    const publicWebpDir = path.join(__dirname, '..', '..', 'public', 'images', 'webp');
    
    // Ensure the output directory exists
    if (!fs.existsSync(publicWebpDir)) {
      fs.mkdirSync(publicWebpDir, { recursive: true });
    }

    const outputFilePath = path.join(publicWebpDir, webpFileName);

    // Compress image quality to 80 and save
    await sharp(inputFilePath)
      .webp({ quality: 80 })
      .toFile(outputFilePath);

    return outputFilePath;
  } catch (error) {
    console.error('[ImageOptimizer] Error optimizing image to WebP:', error);
    throw error;
  }
};
