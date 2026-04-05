import mongoose, { Schema, Document } from "mongoose";

export interface IAlert extends Document {
  id?: string;
  title: string;
  message: string;
  severity: "low" | "medium" | "high" | "critical";
  isActive: boolean;
  createdAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: { type: String, enum: ["low", "medium", "high", "critical"], required: true },
    isActive: { type: Boolean, default: true },
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

export default mongoose.model<IAlert>("Alert", AlertSchema);
