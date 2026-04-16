import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  hashedOtp: string;
  expiresAt: Date;
  attempts: number;
  used: boolean;
  createdAt: Date;
}

const OTPSchema: Schema = new Schema(
  {
    email:     { type: String, required: true, lowercase: true, trim: true },
    hashedOtp: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    attempts:  { type: Number, default: 0 },
    used:      { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-delete documents after expiry (TTL index)
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
OTPSchema.index({ email: 1 });

const OTP: Model<IOTP> =
  mongoose.models.OTP || mongoose.model<IOTP>('OTP', OTPSchema);

export default OTP;
