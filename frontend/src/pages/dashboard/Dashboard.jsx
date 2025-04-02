import React, { useState, useEffect } from "react";
import { Outlet, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import styles from "./Dashboard.module.css";
import LogoutButton from "../../components/LogoutButton";
import BoardPage from "../board/BoardPage"; // Import the BoardPage component
import AnalyticsPage from "../analytics/AnalyticsPage"; // Import the AnalyticsPage component
import SettingsPage from "../settings/SettingsPage"; // Import the SettingsPage component

const DashboardRoutes = () => (
    <Routes>
      {/* Default route to render BoardPage component */}
      <Route path="/" element={<BoardPage />} />
      <Route path="/board" element={<BoardPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      {/* Add other routes for analytics, settings, etc. */}
    </Routes>
  );

  
const Dashboard = () => {
const navigate = useNavigate();
const location = useLocation();
// State to manage the visibility of the logout confirmation popup
const [showLogoutConfirmation, setShowLogoutConfirmation] = useState(false);
const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    console.log("Current route (useEffect):", location.pathname);
    console.log("Show sidebar (useEffect):", !["/login", "/signup"].includes(location.pathname));
    // Determine whether to show the sidebar based on the current route
    setShowSidebar(!["/login", "/signup"].includes(location.pathname));
  }, [location.pathname]);


const handleNavClick = (to) => {
    console.log("Navigating to:", to);

    // Only navigate if the target route is not "/board", "/analytics", or "/settings"
      navigate(to);
    
  };
  
  console.log("isLoginPage:", location.pathname === "/login");
  console.log("isSignupPage:", location.pathname === "/signup");
  console.log("showSidebar:", showSidebar);




return (
<div className={styles.dashboard}>
{/* Sidebar Component */}
{showSidebar && (
<div className={styles.sidebar}>
<div className={styles.logoContainer}>
<img src="/codesandbox.png" alt="logo Icon" className={styles.logo} />
<div className={styles.brand}>Task Manager</div>
</div>
<nav>
<div className={styles.logoContainer}>
<img src="/layout (1).png" alt="logo Icon" className={styles.logo} />
<div className={styles.sidebarButton1} onClick={() => handleNavClick("/board")}>
Board
</div>
</div>
<div className={styles.logoContainer}>
<img src="/database.png" alt="logo Icon" className={styles.logo} />
<div className={styles.sidebarButton2} onClick={() => handleNavClick("/analytics")}>
Analytics
</div>
</div>
<div className={styles.logoContainer}>
<img src="/settings.png" alt="logo Icon" className={styles.logo} />
<div className={styles.sidebarButton3} onClick={() => handleNavClick("/settings")}>
Settings
</div>
</div>
</nav>
<div className={styles.divider}></div>
<div className={styles.logoutButtonContainer}>
            <LogoutButton onClick={() => setShowLogoutConfirmation(true)}>Logout</LogoutButton>
          </div></div>
)}
{/* Content Section */}
<div className={styles.content}>
<Outlet />

</div>
{/* Logout Confirmation Popup */}
{showLogoutConfirmation && (
<div className={styles.logoutConfirmation}>
<p>Are you sure you want to logout?</p>
<button onClick={() => setShowLogoutConfirmation(false)}>No</button>
<button onClick={() => {
// Perform logout action here
// For now, let's just close the popup
setShowLogoutConfirmation(false);
}}>Yes</button>
</div>
)}
</div>
);
};
export default Dashboard;