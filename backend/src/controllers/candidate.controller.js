import Candidate, { CANDIDATE_STATUSES } from '../models/Candidate.js';

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
      candidateData.resumeUrl = `/uploads/${req.file.filename}`;
      candidateData.resumeFileName = req.file.originalname;
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
    const candidate = await Candidate.findByIdAndDelete(id);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

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

