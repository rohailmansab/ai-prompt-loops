import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const webpHandler = (req, res, next) => {
  // Proceed if client accepts WebP
  if (req.headers.accept && req.headers.accept.includes('image/webp')) {
    const ext = path.extname(req.url).toLowerCase();
    
    // Only intercept common image formats
    if (['.jpg', '.jpeg', '.png'].includes(ext)) {
      const fileName = path.basename(req.url, ext);
      
      // Based on requirements, WebP images are stored in /images/webp/
      const webpUrl = `/images/webp/${fileName}.webp`;
      
      // Check if the WebP file actually exists on the server to serve it
      const publicDir = path.join(__dirname, '..', '..', 'public');
      const webpFilePath = path.join(publicDir, 'images', 'webp', `${fileName}.webp`);

      if (fs.existsSync(webpFilePath)) {
        // Option 1: Rewrite req.url to let express.static handle it
        req.url = webpUrl;
      }
    }
  }

  next();
};
