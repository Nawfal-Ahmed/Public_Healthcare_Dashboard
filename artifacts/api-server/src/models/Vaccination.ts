import mongoose, { Schema, Document } from "mongoose";

export interface IVaccination extends Document {
  disease: string;
  vaccineName: string;
  description: string;
  dosesRequired: number;
  eligibility: string;
  availability: string;
  area: string;
  createdAt: Date;
}

const VaccinationSchema = new Schema<IVaccination>(
  {
    disease: { type: String, required: true },
    vaccineName: { type: String, required: true },
    description: { type: String, required: true },
    dosesRequired: { type: Number, default: 1 },
    eligibility: { type: String, required: true },
    availability: { type: String, required: true },
    area: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export default mongoose.model<IVaccination>("Vaccination", VaccinationSchema);
