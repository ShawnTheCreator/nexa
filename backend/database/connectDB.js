import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const client = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected: ${client.connection.host}`);
  } catch (error) {
    console.log("Error connection to MongoDB: ", error.message);
    process.exit(1);
  }
};

export { connectDB };
