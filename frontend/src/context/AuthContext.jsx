// AuthContext.jsx
import { createContext, useContext, useState } from "react";

export const AuthContext = createContext();

export const useAuthContext = () => {
  return useContext(AuthContext);
};

export const AuthContextProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(JSON.parse(localStorage.getItem("chat-user")) || null);
  
  const setAuthUserData = (userData) => {
    console.log("Incoming userData:", userData);
    
    // Merge existing cards with new cards based on unique identifier (_id)
    const mergedCards = authUser.cards ? [...authUser.cards] : [];
    
    if (userData.cards && Array.isArray(userData.cards)) {
      userData.cards.forEach((newCard) => {
        const existingCardIndex = mergedCards.findIndex((card) => card._id === newCard._id);
        
        if (existingCardIndex !== -1) {
          // Replace existing card with new card
          mergedCards[existingCardIndex] = newCard;
        } else {
          // Add new card to the array
          mergedCards.push(newCard);
        }
      });
    }
    
    // Update authUser state and localStorage
    const updatedUser = { ...authUser, cards: mergedCards, ...userData };
    setAuthUser(updatedUser);
    localStorage.setItem("chat-user", JSON.stringify(updatedUser));
    console.log("Updated authUser:", updatedUser);
  };
  
  // Make sure to include all values in the context
  const contextValue = {
    authUser,
    setAuthUser,
    setAuthUserData
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Make sure this export exists
export default AuthContextProvider;