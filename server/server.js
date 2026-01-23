import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import reportRoutes from "./routes/report.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/reports", reportRoutes);

// db connect
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error(err));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use(cors({
  origin: "*",
  credentials: true
}));
import helmet from "helmet";
import rateLimit from "express-rate-limit";

app.use(helmet());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));