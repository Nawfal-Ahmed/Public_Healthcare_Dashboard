import mongoose, { Schema, Document } from "mongoose";

export interface IAlert extends Document {
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
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default mongoose.model<IAlert>("Alert", AlertSchema);
