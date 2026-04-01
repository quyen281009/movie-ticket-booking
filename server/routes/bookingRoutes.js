import express from "express";
import { protectUser } from "../middleware/auth.js";
import {
  createBooking,
  getOccupiedSeats,
  createPaymentLink,
} from "../controllers/bookingController.js";

const bookingRouter = express.Router();

bookingRouter.post("/create", protectUser, createBooking);

bookingRouter.post("/create-payment", protectUser, createPaymentLink);

bookingRouter.get("/seats/:showId", getOccupiedSeats);
export default bookingRouter;
