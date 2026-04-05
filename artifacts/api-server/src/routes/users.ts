import { Router, type IRouter } from "express";
import User from "../models/User";
import { requireAdmin } from "../middlewares/auth";

const router: IRouter = Router();

router.get("/users", requireAdmin, async (req, res): Promise<void> => {
  const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 });
  res.json(users);
});

router.delete("/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const { id } = req.params;

  if (req.session.userId === id) {
    res.status(400).json({ error: "Cannot delete your own account" });
    return;
  }

  await User.findByIdAndDelete(id);
  res.json({ message: "User deleted" });
});

export default router;
