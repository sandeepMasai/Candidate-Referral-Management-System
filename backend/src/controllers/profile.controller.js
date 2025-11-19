import Profile from '../models/Profile.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    res.json({ profile });
  } catch (error) {
    next(error);
  }
};

export const upsertProfile = async (req, res, next) => {
  try {
    const update = {
      headline: req.body.headline,
      phone: req.body.phone,
      location: req.body.location,
      linkedin: req.body.linkedin,
      bio: req.body.bio,
    };

    const profile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { ...update, user: req.user._id },
      { new: true, upsert: true, runValidators: true }
    );

    res.json({ profile });
  } catch (error) {
    next(error);
  }
};

