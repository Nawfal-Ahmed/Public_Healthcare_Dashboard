import mongoose, { Schema, Document } from "mongoose";

export interface IReport extends Document {
  id?: string;
  name: string;
  date: Date;
  phoneNumber: string;
  symptoms: string;
  location: string;
  additionalInfo: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const ReportSchema = new Schema<IReport>(
  {
    name: { type: String, required: true },
    date: { type: Date, required: true },
    phoneNumber: { type: String, required: true },
    symptoms: { type: String, required: true },
    location: { type: String, required: true },
    additionalInfo: { type: String, default: "" },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_, ret) {
        if (ret._id) {
          ret.id = ret._id.toString();
        }
      },
    },
    toObject: {
      virtuals: true,
      versionKey: false,
      transform(_, ret) {
        if (ret._id) {
          ret.id = ret._id.toString();
        }
      },
    },
  },
);

export default mongoose.model<IReport>("Report", ReportSchema);