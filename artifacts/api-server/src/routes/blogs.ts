import { Router, type IRouter } from "express";
import mongoose from "mongoose";
import Blog from "../models/Blog";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

// Get all blogs
router.get("/blogs", async (req, res): Promise<void> => {
  const { category, author } = req.query;
  const filter: any = {};

  if (category) filter.category = category;
  if (author) filter.author = author;

  const blogs = await Blog.find(filter)
    .populate("author", "name email")
    .sort({ createdAt: -1 });

  res.json(blogs.map((blog) => blog.toObject()));
});

// Get single blog
router.get("/blogs/:id", async (req, res): Promise<void> => {
  const { id } = req.params;

  const blog = await Blog.findById(id).populate("author", "name email");
  if (!blog) {
    res.status(404).json({ error: "Blog not found" });
    return;
  }

  res.json({
    ...blog.toObject(),
    id: blog._id.toString(),
  });
});

// Create blog
router.post("/blogs", requireAuth, async (req, res): Promise<void> => {
  const { title, category, description, content } = req.body;

  if (!title || !category || !description) {
    res.status(400).json({ error: "Title, category, and description are required" });
    return;
  }

  const blog = await Blog.create({
    title,
    category,
    description,
    content: content || "",
    author: req.session.userId,
    authorName: req.session.userName || "Unknown",
  });

  res.status(201).json(blog);
});

// Update blog (author only)
router.put("/blogs/:id", requireAuth, async (req, res): Promise<void> => {
  const { id } = req.params;
  const { title, category, description, content } = req.body;

  const blog = await Blog.findById(id);
  if (!blog) {
    res.status(404).json({ error: "Blog not found" });
    return;
  }

  if (blog.author.toString() !== req.session.userId) {
    res.status(403).json({ error: "Not authorized to update this blog" });
    return;
  }

  blog.title = title || blog.title;
  blog.category = category || blog.category;
  blog.description = description || blog.description;
  blog.content = content !== undefined ? content : blog.content;

  await blog.save();
  res.json(blog);
});

// Delete blog (author or admin)
router.delete("/blogs/:id", requireAuth, async (req, res): Promise<void> => {
  const { id } = req.params;

  const blog = await Blog.findById(id);
  if (!blog) {
    res.status(404).json({ error: "Blog not found" });
    return;
  }

  const isAuthor = blog.author.toString() === req.session.userId;
  const isAdmin = req.session.userRole === "admin";

  if (!isAuthor && !isAdmin) {
    res.status(403).json({ error: "Not authorized to delete this blog" });
    return;
  }

  await Blog.findByIdAndDelete(id);
  res.json({ message: "Blog deleted" });
});

// Toggle like
router.post("/blogs/:id/like", requireAuth, async (req, res): Promise<void> => {
  const { id } = req.params;
  const userId = new mongoose.Types.ObjectId(req.session.userId);

  const blog = await Blog.findById(id);
  if (!blog) {
    res.status(404).json({ error: "Blog not found" });
    return;
  }

  const likeIndex = blog.likes.indexOf(userId);
  if (likeIndex > -1) {
    blog.likes.splice(likeIndex, 1);
  } else {
    blog.likes.push(userId);
  }

  await blog.save();
  res.json({ likes: blog.likes.length, isLiked: likeIndex === -1 });
});

// Add comment
router.post("/blogs/:id/comments", requireAuth, async (req, res): Promise<void> => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    res.status(400).json({ error: "Comment content is required" });
    return;
  }

  const blog = await Blog.findById(id);
  if (!blog) {
    res.status(404).json({ error: "Blog not found" });
    return;
  }

  const comment = {
    _id: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(req.session.userId),
    userName: req.session.userName || "Unknown",
    content,
    createdAt: new Date(),
  };

  blog.comments.push(comment);
  await blog.save();

  res.status(201).json(comment);
});

// Delete comment (comment author or admin)
router.delete("/blogs/:id/comments/:commentId", requireAuth, async (req, res): Promise<void> => {
  const { id, commentId } = req.params;

  const blog = await Blog.findById(id);
  if (!blog) {
    res.status(404).json({ error: "Blog not found" });
    return;
  }

  const commentIndex = blog.comments.findIndex(c => c._id?.toString() === commentId);
  if (commentIndex === -1) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }

  const comment = blog.comments[commentIndex];
  const isCommentAuthor = comment.userId.toString() === req.session.userId;
  const isAdmin = req.session.userRole === "admin";

  if (!isCommentAuthor && !isAdmin) {
    res.status(403).json({ error: "Not authorized to delete this comment" });
    return;
  }

  blog.comments.splice(commentIndex, 1);
  await blog.save();

  res.json({ message: "Comment deleted" });
});

// Get blog categories
router.get("/blogs/categories", async (req, res): Promise<void> => {
  const categories = await Blog.distinct("category");
  res.json(categories);
});

export default router;