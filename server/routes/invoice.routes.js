import express from "express";
import Invoice from "../models/Invoice.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  const invoice = await Invoice.create({
    ...req.body,
    user: req.userId,
  });
  res.json(invoice);
});

router.get("/", protect, async (req, res) => {
  const invoices = await Invoice.find({ user: req.userId });
  res.json(invoices);
});

router.put("/:id/status", protect, async (req, res) => {
  const invoice = await Invoice.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { status: req.body.status },
    { new: true }
  );
  res.json(invoice);
});

export default router;