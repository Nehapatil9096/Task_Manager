import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log("🛠 MONGO_DB_URI from .env:", process.env.MONGO_DB_URI); // Debug log

const testMongoDB = async () => {
	try {
		if (!process.env.MONGO_DB_URI) {
			throw new Error("❌ MONGO_DB_URI is undefined. Check your .env file.");
		}

		console.log("🔄 Trying to connect to MongoDB...");
		await mongoose.connect(process.env.MONGO_DB_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});
		console.log("✅ Successfully connected to MongoDB!");
	} catch (error) {
		console.error("❌ MongoDB Connection Error:", error);
	}
};

testMongoDB();
