import express from "express";
import { protectUser } from "../middleware/auth.js";
import {
  getFavorites,
  getUserBookings,
  updateFavorite,
  grantAdminRole,
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.get("/bookings", protectUser, getUserBookings);
userRouter.post("/update-favorites", protectUser, updateFavorite);
userRouter.get("/favorites", protectUser, getFavorites);
userRouter.post("/grant-admin", protectUser, grantAdminRole);

export default userRouter;
