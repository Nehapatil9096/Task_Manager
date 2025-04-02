// controllers/user.controller.js

import User from "../models/user.model.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    console.log("Updated user1:", updatedUser);

    const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getUserData = async (req, res) => {
  try {
    // Fetch user data along with cards
    const user = await User.findById(req.user.id).populate('cards');
    console.log("Updated user26:", user);

    // Your response logic here
    res.json({ user });
  } catch (error) {
    console.error("Error in getUserData: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// New controller function for fetching user cards
export const getUserCards = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const user = await User.findById(req.user.id).select("cards");

    const filteredCards = user.cards.filter((card) => {
      const cardCreatedAt = new Date(card.createdAt);
      return cardCreatedAt >= new Date(startDate) && cardCreatedAt <= new Date(endDate);
    });

    console.log("✅ Filtered cards:", JSON.stringify(filteredCards, null, 2)); // Pretty print

    res.json({ cards: filteredCards || [] });
  } catch (error) {
    console.error("❌ Error in getUserCards: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};







export const getOneCard = async (req, res) => {
  try {
    const { cardId } = req.params;
    const { updatedCardData } = req.body; // Assuming you send all updated card data in the request body

    // Find the user by ID and update the card with the new data
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user.id, 'cards._id': cardId },
      { $set: { 'cards.$': updatedCardData } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User or card not found" });
    }

    // Console logs for debugging
    console.log(`Card ${cardId} updated by user ${req.user.id}`);

    // Respond with the updated user data
    res.json({ user: updatedUser });
  } catch (error) {
    console.error("Error in getOneCard: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




export const updateUser = async (req, res) => {
  try {
    // Extract updated user data from the request body
    const updatedUserData = req.body;

    // Find the user by email
    const existingUser = await User.findOne({ email: updatedUserData.email });
    console.log("Existing user:", existingUser);

    // If the user exists, update their information including the cards
    if (existingUser) {
      // Ensure user.cards is an array
      const existingCards = Array.isArray(existingUser.cards) ? existingUser.cards : [];

      // Merge existing cards with new cards based on unique identifier (_id)
      const mergedCards = [...existingCards];

      updatedUserData.cards.forEach((newCard) => {
        const existingCardIndex = existingCards.findIndex((card) => card._id === newCard._id);

        if (existingCardIndex !== -1) {
          // Replace existing card with new card
          mergedCards[existingCardIndex] = newCard;
        } else {
          // Add new card to the array
          mergedCards.push(newCard);
        }
      });

      // Update user information including the cards
      const updatedUser = await User.findOneAndUpdate(
        { email: updatedUserData.email },
        { ...updatedUserData, cards: mergedCards },
        { new: true }
      );
      console.log("Updated user:", updatedUser);

      // Your response logic here
      res.json({ user: updatedUser });
    } else {
      // Handle case when the user doesn't exist
      res.status(404).json({ error: "User not found" });
    }
  } catch (error) {
    console.error("Error in updateUser: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Your other controllers
export const deleteCard = async (req, res) => {
  try {
    const cardId = req.params.cardId; // Adjusting parameter name to match the route

    // Find the user by ID
    const user = await User.findById(req.user.id);
    console.log("User found:", user);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Filter out the card to be deleted from the user's cards array
    user.cards = user.cards.filter((card) => card._id.toString() !== cardId);
    console.log("User after filtering cards:", user);

    // Save the updated user with the card removed
    const updatedUser = await user.save({ validateBeforeSave: false });
    console.log("Updated user after card deletion:", updatedUser);

    // Your response logic here
    res.json({ user: updatedUser });
  } catch (error) {
    console.error("Error in deleteCard: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

import bcrypt from 'bcrypt';

export const passUpdate = async (req, res) => {
  const userId = req.user.id; // Assuming you have user information stored in the request
  const { oldPassword, newPassword, newUsername } = req.body; // Get old and new passwords from the request body

  try {
    // Retrieve the user from the database
    const user = await User.findById(userId);
    await User.findByIdAndUpdate(userId, { username: newUsername });

    // Check if the entered old password matches the existing one
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isOldPasswordValid) {
      return res.status(401).json({ error: 'Invalid old password' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user document with the new password
    await User.findByIdAndUpdate(userId, { password: hashedPassword });

    res.json({ message: 'Password updated successfully' }); // Respond with a success message
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
};
