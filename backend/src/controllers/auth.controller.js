import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || 'dev-secret', {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const toResponseUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    const token = signToken(user._id);
    res.status(201).json({ user: toResponseUser(user), token });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = signToken(user._id);
    res.json({ user: toResponseUser(user), token });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ message: 'If that email exists, a reset link will be sent shortly.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const expiresInMinutes = Number(process.env.RESET_TOKEN_EXPIRES_MINUTES || 30);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    res.json({
      message: 'Password reset token generated',
      resetToken,
      expiresInMinutes,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+password');

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const jwtToken = signToken(user._id);
    res.json({
      message: 'Password updated successfully',
      token: jwtToken,
      user: toResponseUser(user),
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    res.json({ user: toResponseUser(req.user) });
  } catch (error) {
    next(error);
  }
};

