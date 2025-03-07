import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import generateTokenAndSetCookie from "../utils/generateToken.js";

export const signup = async (req, res) => {
	try {
		// Check if request body is received
		console.log("Received signup request:", req.body);

		const { username, email, password, confirmPassword } = req.body;

		// Log values to make sure they are received
		console.log("Received Data:", { username, email, password, confirmPassword });

		if (!username || !email || !password || !confirmPassword) {
			return res.status(400).json({ error: "All fields are required" });
		}

		if (password !== confirmPassword) {	
			return res.status(400).json({ error: "Passwords don't match" });
		}

		// Check if the username already exists
		const user = await User.findOne({ username });
		console.log("User found in DB:", user);

		if (user) {
			return res.status(400).json({ error: "Username already exists" });
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);
		console.log("Hashed password:", hashedPassword);

		// Create new user
		const newUser = new User({ username, email, password: hashedPassword });

		if (newUser) {
			// Save to database
			await newUser.save();
			console.log("New user created:", newUser);

			// Generate JWT token
			generateTokenAndSetCookie(newUser._id, res);

			res.status(201).json({
				_id: newUser._id,
				username: newUser.username,
				email: newUser.email,
			});
		} else {
			res.status(400).json({ error: "Invalid user data" });
		}
	} catch (error) {
		console.error("Error in signup controller:", error);
		res.status(500).json({ error: "Internal Server Error", details: error.message });
	}
};


export const login = async (req, res) => {
	try {
	  const { email, password } = req.body;
	  const user = await User.findOne({ email });
  
	  if (!user) {
		return res.status(400).json({ error: "Invalid email/user" });
	  }
	  console.log("user retrived info:", user);

	  console.log("Email:", email);
	  console.log("Password outer :", password);
  
	  const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
  
	  if (!isPasswordCorrect) {
		return res.status(400).json({ error: "Invalid password" });
	  }
  
	  generateTokenAndSetCookie(user._id, res);
  
	  res.status(200).json({
		_id: user._id,
		username: user.username,
		email: user.email,
	  });
	} catch (error) {
	  console.log("Error in login controller", error.message);
	  res.status(500).json({ error: "Internal Server Error" });
	}
  };
  


export const logout = (req, res) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.log("Error in logout controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
