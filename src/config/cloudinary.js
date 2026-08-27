const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Checks if all required Cloudinary environment variables are present.
 */
const isCloudinaryConfigured = () => {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
};

/**
 * Uploads a file buffer directly to Cloudinary using streams (for ephemeral hosting like Render).
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {Object} options - Upload options (folder, transformation, public_id, etc.)
 * @returns {Promise<Object>} Cloudinary upload response object
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      // Fallback for local development if Cloudinary credentials are not yet set in .env
      console.warn(
        '[CLOUDINARY WARNING] Cloudinary credentials (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) not fully configured. Using optimized base64 data URI fallback for local dev persistence.'
      );
      const mimeType = options.mimetype || 'image/jpeg';
      const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;
      return resolve({
        secure_url: base64Data,
        url: base64Data,
        public_id: `local_fallback_${Date.now()}`,
        bytes: buffer.length,
        format: mimeType.split('/')[1] || 'jpeg',
      });
    }

    const defaultOptions = {
      folder: 'nexahr/avatars',
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
      ...options,
    };

    const uploadStream = cloudinary.uploader.upload_stream(defaultOptions, (error, result) => {
      if (error) {
        console.error('[CLOUDINARY UPLOAD ERROR]:', error);
        return reject(error);
      }
      resolve(result);
    });

    const readable = new Readable();
    readable._read = () => {};
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Delete an asset from Cloudinary by public ID if needed.
 */
const deleteFromCloudinary = async (publicId) => {
  if (!isCloudinaryConfigured() || !publicId || publicId.startsWith('local_fallback_')) {
    return { result: 'ok' };
  }
  return await cloudinary.uploader.destroy(publicId);
};

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
  uploadToCloudinary,
  deleteFromCloudinary,
};
