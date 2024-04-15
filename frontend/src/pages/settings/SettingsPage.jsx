import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuthContext } from "../../context/AuthContext";
import styles from "./SettingPage.module.css";
import viewIcon from "/view.png";

const SettingsPage = () => {
  const { authUser, setAuthUserData } = useAuthContext();
  const [userSettings, setUserSettings] = useState({
    name: authUser.username || "", // Pre-filled name from authUser
    oldPassword: "",
    newPassword: "",
  });

  // State to manage password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Function to handle updates to user settings
 // Function to handle updates to user settings
const handleUpdateSettings = async () => {
  try {
    // Validate the form fields (add your validation logic here)
    if (!userSettings.name.trim()) {
      alert("Name cannot be empty");
      return;
    }

    if (!userSettings.oldPassword.trim()) {
      alert("Old password cannot be empty");
      return;
    }
    if (!userSettings.newPassword.trim()) {
      alert("New password cannot be empty");
      return;
    }
    // Validate old and new passwords
    if (userSettings.newPassword && userSettings.oldPassword === userSettings.newPassword) {
      alert("New password must be different from the old password");
      return;
    }

    // Check if authUser is defined
    if (!authUser) {
      alert("User data not available");
      return;
    }

    // Prepare data to send for update
    const updateData = { newUsername: userSettings.name, oldPassword: userSettings.oldPassword, newPassword: userSettings.newPassword };
    console.log("Update Data:", updateData);

    // Example: Update user data on the server
    const response = await fetch("/api/users/settings", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updateData),
    });

    if (response) {
      // Ensure that the response body is parsed as JSON
      const responseData = await response.json();
      console.log("Response Data:", responseData); // Log the parsed response data

      if (responseData) {
        if (response.ok) {
          // Update local authUser data with the new username if it was changed successfully
          setAuthUserData({ ...authUser, username: userSettings.name });
          console.log("Settings updated successfully");
          alert("Settings updated successfully");

        } else {
          // Log the specific error message received from the server (if available)
          console.error("Error updating user settings:", responseData.error || "Unknown error");
          console.error("Failed to update user settings");
         // Display an alert for specific error messages
      if (responseData.error === "Invalid old password") {
        alert("Invalid old password");
      } else if (responseData.message === "Password updated successfully") {
        alert("Password updated successfully");
      }
        }
      } else {
        console.error("Response data is undefined");
      }
    } else {
      console.error("Invalid response from the server");
    }

  } catch (error) {
    console.error("Error updating user settings:", error.message);
    alert("Failed to update user settings");
  }
};


// Main Settings Page code
return (
  <div className={styles.settingsContainer}>
    <h2 className={styles.settingsTitle}>Settings Page</h2>

    <label className={styles.settingsLabel}>
  
      <input
        className={styles.settingsInput}
        type="text"
        placeholder="           Name"
        value={userSettings.name}
        onChange={(e) => setUserSettings({ ...userSettings, name: e.target.value })}
      />  <span className={styles.icon}>
    </span>
    </label>

    <label className={styles.settingsLabel}>
       <input
        className={styles.settingsInputPassword}
        type={showPassword ? "text" : "password"}
        placeholder="            Enter Old Password"

        value={userSettings.oldPassword}
        onChange={(e) => setUserSettings({ ...userSettings, oldPassword: e.target.value })}
      />
            <span className={styles.icon1}>

     <img
  src={viewIcon}
  alt="View Password"
  onClick={() => setShowPassword(!showPassword)}
  className={styles.showPasswordIcon}
/>
</span>

      <span className={styles.icon}>
        </span>
    </label>

    <label className={styles.settingsLabel}>
    
      <input
        className={styles.settingsInputPassword}
        type={showPassword ? "text" : "password"}
        placeholder="             Enter New Password"

        value={userSettings.newPassword}
        onChange={(e) => setUserSettings({ ...userSettings, newPassword: e.target.value })}
      />
     
            <span className={styles.icon1}>

     <img
  src={viewIcon}
  alt="View Password"
  onClick={() => setShowPassword(!showPassword)}
  className={styles.showPasswordIcon}
/>
</span>
      <span className={styles.icon}>
        </span>
    </label>

    <button className={styles.settingsButton} onClick={handleUpdateSettings}>
      Update Settings
    </button>

    {/* Add more settings UI elements as needed */}
  </div>
);
}

export default SettingsPage;