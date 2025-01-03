import mongoose, { Schema, Document } from "mongoose";
import { string, StringValidation } from "zod";

export interface Tweets extends Document {
    userId: string;
    content: string;
    createdAt: Date;
    inReplyToTweetId: string;
    inReplytoUserId: string;
    retweetCount: number;
    favoriteCount: number;
    language: string;
    country: string;
}

const TweetsSchema: Schema<Tweets> = new Schema({
    userId: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    },
    inReplyToTweetId: {
        type: String,
        required: false
    },
    inReplytoUserId: {
        type: String,
        required: false
    },
    retweetCount: {
        type: Number,
        required: true,
        default: 0
    },
    favoriteCount: {
        type: Number,
        required: true,
        default: 0
    },
    language: {
        type: String,
        required: false,
        default: "English"
    },
    country: {
        type: String,
        required: false,
        default: "India"
    }
})

export interface User extends Document {
    name: string;
    username: string;
    email: string;
    password: string;
    verifyCode: string;
    verifiedCodeExpiry: Date;
    isVerified: boolean;
    tweets: Tweets[];
    followers: number;
    following: number;
    userSince: Date;
    lastLogin: Date;
    isActive: boolean;
    profilePicture: string;
}

const UserSchema: Schema<User> = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: [true, "Username is required"],
        unique: [true, "Username already taken"]
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: [true, "This email is already registered"],
        match: [/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g, "Invalid Email"]
    },
    password: {
        type: String,
        required: true
    },
    verifyCode: {
        type: String,
        required: [true, "Verification code is required"]
    },
    verifiedCodeExpiry: {
        type: Date,
        required: false
    },
    isVerified: {
        type: Boolean,
        required: true,
        default: false
    },
    tweets: [TweetsSchema],
    followers: {
        type: Number,
        required: true,
        default: 0
    },
    following: {
        type: Number,
        required: true,
        default: 0
    },
    userSince: {
        type: Date,
        required: true,
        default: Date.now
    },
    lastLogin: {
        type: Date,
        required: false
    },
    isActive: {
        type: Boolean,
        required: true,
        default: false
    },
    profilePicture: {
        type: String,
        required: false
    }
})

const UserModel = (mongoose.models.User as mongoose.Model<User>) || mongoose.model<User>("User", UserSchema);

export default UserModel;