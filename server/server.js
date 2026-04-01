import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

const app = express();
await connectDB();

app.post(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhooks,
);


app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());
app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/show", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
