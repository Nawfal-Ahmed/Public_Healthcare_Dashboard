import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  id?: string;
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  location: string | null;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    location: { type: String, default: null },
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

export default mongoose.model<IUser>("User", UserSchema);
