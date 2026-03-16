import mongoose from "mongoose";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => console.log("MongoDB connected"));
    await mongoose.connect(process.env.MONGO_URI);
  } catch (error) {
    console.warn("MongoDB connection warning:", error.message);
    console.log("Server continuing without database connection...");
  }
};

export default connectDB;
