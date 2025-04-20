
import mongoose, { Schema, model } from 'mongoose'
import { Types } from 'mongoose'

const userSchema = new Schema({
    FirstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50
    },
    LastName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 50
    },
    phoneNo: {
        type: String,
        required: false,
    },
    universityName: {
        type: String
    },
    role: {
        type: String,
        enum: ['user', 'renter'],
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female'],
        required: false
    },
    isConfirmed: {
        type: Boolean,
        default: false
    },
    forgetCode: {
        type: String
    },
    activationCode: {
        type: String
    }
}, { timestamps: true });

export const User = mongoose.models.User || model('User',userSchema);
