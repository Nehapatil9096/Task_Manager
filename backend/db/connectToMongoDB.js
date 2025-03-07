import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectToMongoDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_DB_URI);
		console.log("✅ Connected to MongoDB Atlas");
	} catch (error) {
		console.error("❌ MongoDB Connection Error:", error);
		process.exit(1); // Stop the server if MongoDB doesn't connect
	}
};

export default connectToMongoDB;
