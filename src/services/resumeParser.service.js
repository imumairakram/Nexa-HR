const mammoth = require('mammoth');
const { uploadToCloudinary } = require('../config/cloudinary');

/**
 * Extract plain text from PDF buffer
 * Supports both pdf-parse v1 function API and v2 class API
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
async function extractTextFromPdf(buffer) {
  try {
    const pdfModule = require('pdf-parse');
    if (typeof pdfModule === 'function') {
      const parsed = await pdfModule(buffer);
      return (parsed.text || '').trim();
    } else if (pdfModule && pdfModule.PDFParse) {
      const parser = new pdfModule.PDFParse({ data: buffer });
      const result = await parser.getText();
      return (result.text || '').trim();
    } else if (pdfModule && typeof pdfModule.default === 'function') {
      const parsed = await pdfModule.default(buffer);
      return (parsed.text || '').trim();
    }
    throw new Error('Unsupported pdf-parse interface');
  } catch (error) {
    console.error('[RESUME PARSER] PDF extraction error:', error.message);
    return '';
  }
}

/**
 * Extract plain text from DOCX buffer using mammoth
 * @param {Buffer} buffer
 * @returns {Promise<string>}
 */
async function extractTextFromDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return (result.value || '').trim();
  } catch (error) {
    console.error('[RESUME PARSER] DOCX extraction error:', error.message);
    return '';
  }
}

/**
 * Upload CV buffer directly to Cloudinary (memory stream)
 * @param {Buffer} buffer
 * @param {string} filename
 * @param {string} mimetype
 * @returns {Promise<string|null>} Cloudinary secure_url
 */
async function uploadResumeToCloudinary(buffer, filename, mimetype) {
  try {
    const sanitizedName = (filename || 'resume')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 50);
    const publicId = `cv_${Date.now()}_${sanitizedName}`;

    const uploadResult = await uploadToCloudinary(buffer, {
      folder: 'nexahr/resumes',
      resource_type: 'raw',
      type: 'authenticated', // Authenticated access: requires signed URLs for secure access
      transformation: [],
      public_id: publicId,
      mimetype: mimetype || 'application/pdf',
    });

    // In Cloudinary mode, store the authenticated public_id or url; in local mode, store the relative path
    return uploadResult.public_id || uploadResult.secure_url || uploadResult.url || null;
  } catch (error) {
    console.error('[RESUME PARSER] Cloudinary upload failed:', error.message);
    return null;
  }
}

/**
 * Parses a resume file buffer and uploads original file to Cloudinary
 *
 * @param {Object} params
 * @param {Buffer} params.buffer - Raw file buffer
 * @param {string} params.filename - Original file name (e.g. "John_Doe_CV.pdf")
 * @param {string} params.mimetype - File mime type
 * @returns {Promise<{
 *   text: string,
 *   parseStatus: 'SUCCESS' | 'FAILED',
 *   resumeUrl: string|null,
 *   rawBuffer: Buffer,
 *   isShortOrScanned: boolean
 * }>}
 */
async function parseResume({ buffer, filename = '', mimetype = '' }) {
  if (!buffer || !Buffer.isBuffer(buffer)) {
    throw new Error('Valid resume buffer is required for parsing');
  }

  const lowerName = filename.toLowerCase();
  const lowerMime = (mimetype || '').toLowerCase();
  const isPdf = lowerName.endsWith('.pdf') || lowerMime.includes('pdf');
  const isDocx = lowerName.endsWith('.docx') || lowerMime.includes('wordprocessingml') || lowerMime.includes('docx');

  let extractedText = '';

  if (isPdf) {
    extractedText = await extractTextFromPdf(buffer);
  } else if (isDocx) {
    extractedText = await extractTextFromDocx(buffer);
  } else {
    // Attempt PDF first, then DOCX
    extractedText = await extractTextFromPdf(buffer);
    if (!extractedText) {
      extractedText = await extractTextFromDocx(buffer);
    }
  }

  // Upload original to Cloudinary in parallel or sequence
  const resumeUrl = await uploadResumeToCloudinary(
    buffer,
    filename,
    isPdf ? 'application/pdf' : isDocx ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : mimetype
  );

  // If text is very short (< 50 chars), it's likely a scanned PDF or empty
  const isShortOrScanned = !extractedText || extractedText.length < 50;
  const parseStatus = isShortOrScanned ? 'FAILED' : 'SUCCESS';

  return {
    text: extractedText,
    parseStatus,
    resumeUrl,
    rawBuffer: buffer,
    filename,
    mimetype: isPdf ? 'application/pdf' : isDocx ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : mimetype,
    isShortOrScanned,
  };
}

module.exports = {
  parseResume,
  extractTextFromPdf,
  extractTextFromDocx,
  uploadResumeToCloudinary,
};

