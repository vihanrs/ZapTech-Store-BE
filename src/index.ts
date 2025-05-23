import express from "express";

import { clerkMiddleware } from "@clerk/express";
import cors from "cors";
import "dotenv/config";
import globalErrorHandlingMiddleware from "./api/middleware/global-error-handling-middleware";
import { productTagRouter } from "./api/productTags";
import { categoryRouter } from "./api/category";
import { orderRouter } from "./api/order";
import { paymentsRouter } from "./api/payment";
import { productRouter } from "./api/product";
import { connectDB } from "./infrastructure/db";
import promoCodeRouter from "./api/promocode";
import { handleWebhook } from "./application/payment";
import bodyParser from "body-parser";

const app = express();

const allowedOrigins = [
  "https://fed-storefront-frontend-vihan.netlify.app",
  "http://localhost:5173", // for local testing
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.post(
  "/api/stripe/webhook",
  bodyParser.raw({ type: "application/json" }),
  handleWebhook
);

app.use(express.json()); // For parsing JSON requests
app.use(clerkMiddleware());
// app.use(cors({ origin: "https://fed-storefront-frontend-vihan.netlify.app" }));

app.use("/api/v1/product-tags", productTagRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/payments", paymentsRouter);
app.use("/api/v1/promocodes", promoCodeRouter);

// Health check endpoint for UptimeRobot
app.get("/ping", (req, res) => {
  res.status(200).json({ message: "Server is running!" });
});

app.use(globalErrorHandlingMiddleware);

// connectDB();
const PORT = process.env.PORT || 8000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

    // Self-ping to keep server awake on Render free tier
    setInterval(() => {
      fetch(`https://fed-storefront-backend-vihan.onrender.com/ping`)
        .then((res) => res.json())
        .then((data) => console.log("Self Ping Success:", data))
        .catch((err) => console.log("Self Ping Error:", err));
    }, 600000); // Every 10 minutes
  });
});
