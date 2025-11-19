import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { Readable } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Use memory storage for multer (files will be in req.file.buffer)
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
    // Generate a unique filename
    const timestamp = Date.now();
    const safeName = originalName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    const publicId = `candidate-resumes/${timestamp}-${safeName.replace('.pdf', '')}`;

    // Upload using stream (more efficient for larger files)
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'candidate-resumes',
          resource_type: 'raw',
          public_id: publicId,
          format: 'pdf',
          overwrite: false,
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );

      // Create readable stream from buffer and pipe to Cloudinary
      const bufferStream = Readable.from(file.buffer);
      bufferStream.pipe(uploadStream);
    });
  } catch (error) {
    console.error('Error preparing upload to Cloudinary:', error);
    throw error;
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

