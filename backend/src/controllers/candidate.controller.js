import Candidate, { CANDIDATE_STATUSES } from '../models/Candidate.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

export const createCandidate = async (req, res, next) => {
  try {
    const { name, email, phone, jobTitle } = req.body;

    const candidateData = {
      name,
      email,
      phone,
      jobTitle,
      referredBy: req.user?._id,
    };

    if (req.file) {
      try {
        // Upload file to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(req.file, req.file.originalname);
        
        // Store Cloudinary secure URL and public ID
        candidateData.resumeUrl = cloudinaryResult.secure_url;
        candidateData.resumeFileName = req.file.originalname;
        candidateData.resumePublicId = cloudinaryResult.public_id; // Store public_id for deletion later
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        return res.status(500).json({
          message: 'Failed to upload resume. Please try again.',
        });
      }
    }

    const candidate = await Candidate.create(candidateData);
    res.status(201).json({
      message: 'Candidate referred successfully',
      candidate,
    });
  } catch (error) {
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

