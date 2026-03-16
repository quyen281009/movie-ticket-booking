import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: String, //  Clerk userId
      required: true,
    },

    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Show",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    bookedSeats: {
      type: Array,
      required: true,
    },

    isPaid: {
      type: Boolean,
      default: false,
    },

    paymentLink: {
      type: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Booking", bookingSchema);
  