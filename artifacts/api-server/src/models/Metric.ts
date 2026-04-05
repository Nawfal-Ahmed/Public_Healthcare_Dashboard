import mongoose, { Schema, Document } from "mongoose";

export interface IMetric extends Document {
  id?: string;
  disease: string;
  metric: "hospitalized" | "recovered" | "death_rate";
  value: number;
  date: string;
  region: string;
  createdAt: Date;
}

const MetricSchema = new Schema<IMetric>(
  {
    disease: { type: String, required: true },
    metric: { type: String, enum: ["hospitalized", "recovered", "death_rate"], required: true },
    value: { type: Number, required: true },
    date: { type: String, required: true },
    region: { type: String, required: true },
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

export default mongoose.model<IMetric>("Metric", MetricSchema);
