import { Schema, model } from "mongoose";

const invoiceSchema = new Schema(
  {
    clientName: String,
    amount: Number,
    status: { type: String, default: "Pending" },
    user: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default model("Invoice", invoiceSchema);