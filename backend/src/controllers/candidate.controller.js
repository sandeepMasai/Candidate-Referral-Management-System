import Candidate, { CANDIDATE_STATUSES } from '../models/Candidate.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

export const createCandidate = async (req, res, next) => {
  try {
    console.log('Creating candidate - Request body:', {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      jobTitle: req.body.jobTitle,
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      fileSize: req.file?.size,
      user: req.user?._id,
    });

    const { name, email, phone, jobTitle } = req.body;

    // Validate required fields
    if (!name || !email || !phone || !jobTitle) {
      return res.status(400).json({
        message: 'Missing required fields: name, email, phone, and jobTitle are required.',
      });
    }

    const candidateData = {
      name,
      email,
      phone,
      jobTitle,
      referredBy: req.user?._id,
    };

    // Handle file upload via multer (backend uploads to Cloudinary)
    if (req.file) {
      try {
        console.log('File received via multer:', {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          hasBuffer: !!req.file.buffer,
          bufferLength: req.file.buffer?.length,
          fieldname: req.file.fieldname,
        });

        // Validate file exists and has buffer (memory storage required)
        if (!req.file.buffer) {
          console.error('ERROR: req.file.buffer is missing! Multer must use memory storage.');
          return res.status(500).json({
            message: 'File upload configuration error. Please contact support.',
          });
        }

        if (req.file.buffer.length === 0) {
          return res.status(400).json({
            message: 'Invalid file. File appears to be empty.',
          });
        }

        // Validate file type
        if (req.file.mimetype !== 'application/pdf') {
          return res.status(400).json({
            message: 'Only PDF files are allowed.',
          });
        }

        console.log('Starting Cloudinary upload...');
        // Upload file to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(req.file, req.file.originalname);
        
        if (!cloudinaryResult || !cloudinaryResult.secure_url) {
          throw new Error('Cloudinary upload succeeded but did not return a secure URL');
        }
        
        // Store Cloudinary secure URL and public ID
        candidateData.resumeUrl = cloudinaryResult.secure_url;
        candidateData.resumeFileName = req.file.originalname;
        candidateData.resumePublicId = cloudinaryResult.public_id;
      } catch (uploadError) {
        console.error('=== CLOUDINARY UPLOAD ERROR ===');
        console.error('Error message:', uploadError.message);
        console.error('Error name:', uploadError.name);
        console.error('HTTP code:', uploadError.http_code);
        console.error('Error stack:', uploadError.stack);
        console.error('Full error object:', JSON.stringify(uploadError, Object.getOwnPropertyNames(uploadError), 2));
        
        // Provide more detailed error message based on error type
        let errorMessage = 'Failed to upload resume. Please try again.';
        let statusCode = 500;
        
        // Check for specific error types
        if (uploadError.message) {
          const msg = uploadError.message.toLowerCase();
          
          if (msg.includes('cloudinary configuration') || msg.includes('missing')) {
            errorMessage = 'Server configuration error. Cloudinary credentials are missing.';
            statusCode = 500;
          } else if (uploadError.http_code === 401) {
            errorMessage = 'Cloudinary authentication failed. Invalid API credentials.';
            statusCode = 500;
          } else if (uploadError.http_code === 400) {
            errorMessage = 'Invalid file format or size. Please upload a valid PDF file (max 5MB).';
            statusCode = 400;
          } else if (uploadError.http_code === 413 || msg.includes('too large') || msg.includes('file size')) {
            errorMessage = 'File size exceeds the maximum allowed (5MB).';
            statusCode = 400;
          } else if (msg.includes('invalid') || msg.includes('format')) {
            errorMessage = 'Invalid file format. Please upload a valid PDF file.';
            statusCode = 400;
          } else if (msg.includes('network') || msg.includes('timeout')) {
            errorMessage = 'Network error. Please check your connection and try again.';
            statusCode = 500;
          }
        }
        
        // Always return detailed error message, not generic one
        const errorResponse = {
          message: errorMessage,
        };
        
        // Include debug info in development or if error message is generic
        if (process.env.NODE_ENV === 'development' || errorMessage === 'Failed to upload resume. Please try again.') {
          errorResponse.debug = {
            error: uploadError.message,
            http_code: uploadError.http_code,
            name: uploadError.name,
            type: uploadError.constructor?.name || 'Unknown',
          };
          // If we're returning generic message, include the actual error message too
          if (errorMessage === 'Failed to upload resume. Please try again.') {
            errorResponse.message = `${errorMessage} Error: ${uploadError.message}`;
          }
        }
        
        console.error('Returning error response:', errorResponse);
        return res.status(statusCode).json(errorResponse);
      }
    }

    console.log('Creating candidate in database:', {
      ...candidateData,
      referredBy: candidateData.referredBy?.toString(),
    });
    
    try {
      const candidate = await Candidate.create(candidateData);
      
      console.log('Candidate created successfully:', candidate._id);
      
      res.status(201).json({
        message: 'Candidate referred successfully',
        candidate,
      });
    } catch (dbError) {
      console.error('=== DATABASE ERROR ===');
      console.error('Error creating candidate:', dbError);
      console.error('Error details:', {
        name: dbError.name,
        message: dbError.message,
        code: dbError.code,
        errors: dbError.errors,
      });
      
      // If Cloudinary upload succeeded but DB save failed, try to delete the uploaded file
      if (candidateData.resumePublicId) {
        try {
          await deleteFromCloudinary(candidateData.resumePublicId);
          console.log('Cleaned up Cloudinary file after DB error');
        } catch (cleanupError) {
          console.error('Failed to cleanup Cloudinary file:', cleanupError);
        }
      }
      
      // Handle duplicate email error
      if (dbError.code === 11000) {
        return res.status(400).json({
          message: 'A candidate with this email already exists.',
        });
      }
      
      // Handle validation errors
      if (dbError.name === 'ValidationError') {
        const messages = Object.values(dbError.errors).map((e) => e.message);
        return res.status(400).json({
          message: 'Validation error',
          errors: messages,
        });
      }
      
      throw dbError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('=== ERROR IN createCandidate ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    
    // If it's a validation error or known error, return it
    if (error.status || error.statusCode) {
      return res.status(error.status || error.statusCode).json({
        message: error.message || 'An error occurred',
      });
    }
    
    // For unknown errors, pass to error handler
    next(error);
  }
};

export const getCandidates = async (req, res, next) => {
  try {
    const { status, jobTitle, q } = req.query;
    const filter = {};

    if (req.user.role !== 'admin') {
      filter.referredBy = req.user._id;
    }

    if (status && CANDIDATE_STATUSES.includes(status)) {
      filter.status = status;
    }

    if (jobTitle) {
      filter.jobTitle = { $regex: jobTitle, $options: 'i' };
    }

    if (q) {
      const searchRegex = { $regex: q, $options: 'i' };
      filter.$or = [{ name: searchRegex }, { jobTitle: searchRegex }, { status: searchRegex }];
    }

    const candidates = await Candidate.find(filter)
      .sort({ createdAt: -1 })
      .populate('referredBy', 'name email role');
    res.json({ candidates });
  } catch (error) {
    next(error);
  }
};

export const updateCandidateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const candidate = await Candidate.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    res.json({
      message: 'Status updated successfully',
      candidate,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCandidate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Delete resume from Cloudinary if it exists
    if (candidate.resumePublicId) {
      try {
        await deleteFromCloudinary(candidate.resumePublicId);
      } catch (deleteError) {
        console.error('Error deleting file from Cloudinary:', deleteError);
        // Continue with candidate deletion even if file deletion fails
      }
    }

    // Delete candidate from database
    await Candidate.findByIdAndDelete(id);

    res.json({ message: 'Candidate removed' });
  } catch (error) {
    next(error);
  }
};

export const getMetrics = async (req, res, next) => {
  try {
    const matchStage =
      req.user.role === 'admin' ? {} : { referredBy: req.user._id };

    const total = await Candidate.countDocuments(matchStage);
    const statusBuckets = await Candidate.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const byStatus = CANDIDATE_STATUSES.reduce(
      (acc, status) => ({
        ...acc,
        [status]: statusBuckets.find((bucket) => bucket._id === status)?.count || 0,
      }),
      {}
    );

    res.json({ total, byStatus });
  } catch (error) {
    next(error);
  }
};

