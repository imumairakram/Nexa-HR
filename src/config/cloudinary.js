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
 * @param {Object} options - Upload options (folder, transformation, public_id, type, etc.)
 * @returns {Promise<Object>} Cloudinary upload response object
 */
const uploadToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isCloudinaryConfigured()) {
      // In production, do not write files to local ephemeral container disk if Cloudinary is unconfigured
      if (process.env.NODE_ENV === 'production') {
        console.warn(
          '[CLOUDINARY WARNING]: Cloudinary is not configured in production environment. File disk storage skipped to avoid ephemeral data loss or disk saturation. Extracted text is retained.'
        );
        return resolve({
          secure_url: null,
          url: null,
          public_id: null,
          bytes: buffer.length,
          format: null,
        });
      }

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
 * Generates a short-lived signed download URL for an authenticated asset.
 * @param {string} publicId - Cloudinary public ID or asset URL
 * @param {Object} options - Options including expires_at, format, resource_type, attachment
 * @returns {string|null} Signed download URL
 */
const getSignedDownloadUrl = (publicId, options = {}) => {
  if (!isCloudinaryConfigured() || !publicId) {
    return null;
  }

  let cleanPublicId = publicId;
  let detectedFormat = options.format || 'pdf';

  if (publicId.startsWith('http://') || publicId.startsWith('https://')) {
    try {
      const parsedUrl = new URL(publicId);
      const parts = parsedUrl.pathname.split('/');
      const vIndex = parts.findIndex((p) => /^v\d+$/.test(p));
      if (vIndex !== -1 && vIndex + 1 < parts.length) {
        cleanPublicId = parts.slice(vIndex + 1).join('/');
      } else {
        const afterUpload = parts.slice(parts.indexOf('upload') + 1 || parts.indexOf('authenticated') + 1 || 4);
        cleanPublicId = afterUpload.join('/');
      }
      const extMatch = cleanPublicId.match(/\.([a-zA-Z0-9]+)$/);
      if (extMatch) {
        detectedFormat = extMatch[1];
        cleanPublicId = cleanPublicId.replace(/\.[a-zA-Z0-9]+$/, '');
      }
    } catch (e) {
      cleanPublicId = publicId;
    }
  }

  const resourceType = options.resource_type || 'raw';
  const expiresAt = options.expires_at || Math.floor(Date.now() / 1000) + 15 * 60; // 15 mins

  try {
    return cloudinary.utils.private_download_url(cleanPublicId, detectedFormat, {
      resource_type: resourceType,
      type: 'authenticated',
      expires_at: expiresAt,
      attachment: options.attachment || false,
    });
  } catch (error) {
    console.error('[CLOUDINARY SIGN URL ERROR]:', error.message);
    try {
      return cloudinary.url(cleanPublicId, {
        resource_type: resourceType,
        type: 'authenticated',
        sign_url: true,
        expires_at: expiresAt,
      });
    } catch (fallbackError) {
      return null;
    }
  }
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
  getSignedDownloadUrl,
  deleteFromCloudinary,
};
