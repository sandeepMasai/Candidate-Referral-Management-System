import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            unique: true,
            required: true,
        },
        headline: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        location: {
            type: String,
            trim: true,
        },
        linkedin: {
            type: String,
            trim: true,
        },
        bio: {
            type: String,
            trim: true,
            maxlength: 2000,
        },
    },
    {
        timestamps: true,
    }
);

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;

