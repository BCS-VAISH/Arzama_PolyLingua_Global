import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    paymentId: String,
    paymentProof: String,
    payerName: String,
    status: {
      type: String,
      default: 'PAID',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Enrollment ||
  mongoose.model('Enrollment', EnrollmentSchema);
