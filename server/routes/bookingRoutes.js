import express from "express";
import { protectUser } from "../middleware/auth.js";
import {
  createBooking,
  getOccupiedSeats,
  createPaymentLink,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();
// Tạo booking
bookingRouter.post("/create", protectUser, createBooking);
// Tạo link thanh toán
bookingRouter.post("/create-payment", protectUser, createPaymentLink);
// Lấy ghế đã đặt theo showId
bookingRouter.get("/seats/:showId", getOccupiedSeats);
export default bookingRouter;
