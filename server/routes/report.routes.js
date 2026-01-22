import express from "express";
import Invoice from "../models/Invoice.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/summary", protect, async (req, res) => {
  const invoices = await Invoice.find({ user: req.userId });
  
  const totalRevenue = invoices.reduce(
    (sum, i) => sum + (i.amount || 0),
    0
  );
  
  const paid = invoices.filter(i => i.status === "Paid").length;
  const pending = invoices.filter(i => i.status === "Pending").length;
  
  res.json({
    totalRevenue,
    totalInvoices: invoices.length,
    paid,
    pending,
  });
});

export default router;