const multer = require('multer');

// Configure memory storage (stores file in memory as Buffer for direct cloud streaming)
const storage = multer.memoryStorage();

// File filter to restrict uploads strictly to image types
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type: ${file.mimetype}. Only JPEG, PNG, WEBP, and GIF images are allowed.`
      ),
      false
    );
  }
};

// 5MB maximum file size limit
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter,
});

/**
 * Middleware wrapper to cleanly handle Multer-specific errors (e.g. file size exceeded)
 */
const handleUploadMiddleware = (fieldName = 'avatar') => {
  return (req, res, next) => {
    // Support common field names: 'avatar', 'image', 'file', 'profilePicture'
    const uploader = upload.fields([
      { name: 'avatar', maxCount: 1 },
      { name: 'image', maxCount: 1 },
      { name: 'file', maxCount: 1 },
      { name: 'profilePicture', maxCount: 1 },
    ]);

    uploader(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: 'Uploaded file is too large. Maximum allowed size is 5MB.',
          });
        }
        return res.status(400).json({
          success: false,
          message: `File upload error: ${err.message}`,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      // Normalize single file object on req.file
      if (req.files) {
        const found =
          req.files.avatar?.[0] ||
          req.files.image?.[0] ||
          req.files.file?.[0] ||
          req.files.profilePicture?.[0];
        if (found) {
          req.file = found;
        }
      }

      next();
    });
  };
};

module.exports = {
  upload,
  handleUploadMiddleware,
};
