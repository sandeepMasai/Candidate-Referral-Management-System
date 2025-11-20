import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Ensure environment variables are loaded before configuring Cloudinary
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Validate Cloudinary configuration on startup
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.warn('  Warning: Cloudinary configuration is missing. Resume uploads will fail.');
  console.warn('Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file');
} else {
  console.log(' Cloudinary configured successfully');
}

// Use memory storage for multer (files will be in req.file.buffer)
// This is required for Cloudinary upload which needs buffer data
const storage = multer.memoryStorage();

// File filter for PDFs only
const allowedMimeTypes = ['application/pdf'];
const maxFileSize = Number(process.env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024;

const fileFilter = (_req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error('Only PDF resumes are allowed'));
  } else {
    cb(null, true);
  }
};

// Create multer upload middleware
const upload = multer({
  storage: storage,
  limits: { fileSize: maxFileSize },
  fileFilter: fileFilter,
});

// Helper function to upload file to Cloudinary
export const uploadToCloudinary = async (file, originalName) => {
  try {
    // Re-validate Cloudinary configuration at runtime
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      console.error('Cloudinary configuration check:', {
        cloudName: cloudName ? 'SET' : 'MISSING',
        apiKey: apiKey ? 'SET' : 'MISSING',
        apiSecret: apiSecret ? 'SET' : 'MISSING',
      });
      throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
    }

    // Re-configure Cloudinary to ensure credentials are available
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    // Generate a unique filename
    // IMPORTANT: Keep .pdf extension for raw uploads so Cloudinary serves with correct content-type
    // NOTE: Do NOT include folder in public_id - it's set separately in upload options
    const timestamp = Date.now();
    const safeName = originalName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    // Ensure the filename ends with .pdf for proper content-type handling
    const baseName = safeName.endsWith('.pdf') ? safeName : `${safeName}.pdf`;
    const publicId = `${timestamp}-${baseName}`; // No folder prefix - folder is set in upload options

    console.log('Uploading to Cloudinary:', {
      publicId: publicId,
      fileSize: file.buffer.length,
      mimetype: file.mimetype,
    });

    // Use upload_stream for better PDF handling (preserves file integrity)
    // This method is more reliable for binary files like PDFs
    // The .pdf extension in public_id ensures correct content-type
    const uploadPromise = new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'candidate-resumes',
          resource_type: 'raw', // Treat PDF as raw file (not image)
          public_id: publicId, // Includes .pdf extension for correct content-type
          access_mode: 'public', // Required for public access to PDFs
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Create a readable stream from the buffer and pipe it to Cloudinary
      const bufferStream = new Readable();
      bufferStream.push(file.buffer);
      bufferStream.push(null); // Signal end of stream
      bufferStream.pipe(uploadStream);
    });

    const result = await uploadPromise;

    if (!result || !result.secure_url) {
      throw new Error('Cloudinary upload did not return a valid result');
    }

    console.log('Cloudinary upload successful:', {
      secure_url: result.secure_url,
      public_id: result.public_id,
    });

    return result;

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    console.error('Error details:', {
      message: error.message,
      http_code: error.http_code,
      name: error.name,
      stack: error.stack,
    });

    // Provide more specific error messages
    let errorMessage = 'Failed to upload resume to Cloudinary.';

    if (error.http_code === 401 || error.message?.includes('Must supply api_key')) {
      errorMessage = 'Cloudinary authentication failed. Please check your API credentials.';
    } else if (error.http_code === 400) {
      errorMessage = 'Invalid file format. Please upload a valid PDF file.';
    } else if (error.message?.includes('format') || error.message?.includes('type')) {
      errorMessage = 'File format error. Please ensure the PDF is valid and not corrupted.';
    }

    const enhancedError = new Error(errorMessage);
    enhancedError.originalError = error;
    enhancedError.http_code = error.http_code;
    throw enhancedError;
  }
};

// Helper function to delete file from Cloudinary
export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'raw',
    });
    return result;
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    throw error;
  }
};

// Helper function to get secure URL
export const getSecureUrl = (publicId) => {
  return cloudinary.url(publicId, {
    resource_type: 'raw',
    secure: true,
  });
};

export { cloudinary, upload };
export default upload;

