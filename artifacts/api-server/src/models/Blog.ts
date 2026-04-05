import mongoose, { Schema, Document } from "mongoose";

export interface IComment {
  _id?: mongoose.Types.ObjectId;
  id?: string;
  userId: mongoose.Types.ObjectId;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface IBlog extends Document {
  id?: string;
  title: string;
  category: string;
  description: string;
  content?: string;
  author: mongoose.Types.ObjectId;
  authorName: string;
  likes: mongoose.Types.ObjectId[];
  comments: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  userName: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    content: { type: String },
    author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    authorName: { type: String, required: true },
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    comments: [CommentSchema],
  },
  {
    timestamps: true,
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

export default mongoose.model<IBlog>("Blog", BlogSchema);