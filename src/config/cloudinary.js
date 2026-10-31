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
      // Fallback for local development: Save file to local uploads directory instead of storing heavy base64 data URIs
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(process.cwd(), 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const mimeType = options.mimetype || 'application/octet-stream';
      let ext = 'bin';
      if (mimeType.includes('pdf')) ext = 'pdf';
      else if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
      else if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('word') || mimeType.includes('docx')) ext = 'docx';

      const filename = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${ext}`;
      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, buffer);

      const fileUrl = `/uploads/${filename}`;
      return resolve({
        secure_url: fileUrl,
        url: fileUrl,
        public_id: filename,
        bytes: buffer.length,
        format: ext,
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
