import mongoose, { Schema, model, models } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id?: mongoose.Types.ObjectId;
  username: string;
  email: string;
  fullName: string;
  password: string;
  profilePicture: string;
  bio: string;
  banner: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  dateOfBirth: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema: Schema<IUser> = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    minlength: [3, "Username must be at least 3 characters"],
    maxlength: [20, "Username cannot exceed 20 characters"],
    match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"],
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email format"],
  },
  fullName: {
    type: String,
    required: true,
    maxlength: [30, "Full Name should not exceed 30 characters"],
  },
  password: {
    type: String,
    required: true,
    minlength: [8, "Password must be at least 8 characters"],
  },
  profilePicture: {
    type: String,
    default: "default-profile.jpg",
  },
  bio: {
    type: String,
    maxlength: [150, "Bio cannot exceed 150 characters"],
  },
  banner: {
    type: String,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  verifyCode: {
    type: String,
    required: [true, "Verify Code is required"],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, "Verify Code Expiry is required"],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

const User = models?.User || model<IUser>("User", UserSchema);

export default User;