import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadFolder = process.env.UPLOAD_DIR || 'uploads';
const uploadPath = path.join(process.cwd(), uploadFolder);
fs.mkdirSync(uploadPath, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const timestamp = Math.floor(Date.now() / 1000);

    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}-${safeName}`);
  },
});

const allowedMimeTypes = ['application/pdf'];
const maxFileSize = Number(process.env.MAX_FILE_SIZE_MB || 5) * 1024 * 1024;

const fileFilter = (_req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    cb(new Error('Only PDF resumes are allowed'));
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: maxFileSize },
  fileFilter,
});

export default upload;

