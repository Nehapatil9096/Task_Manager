import React, { useEffect, useState } from "react";
import { useAuthContext } from "../../context/AuthContext";
import styles from "./AnalyticsPage.module.css";
import ellipseImage from "/Ellipse 3.png";

const AnalyticsPage = () => {
  const { authUser } = useAuthContext();
  const [cards, setCards] = useState(authUser.cards || []); 

  const [analyticsDetails, setAnalyticsDetails] = useState({
    backlogTasks: 0,
    todoTasks: 0,
    highPriorityTasks: 0,
    moderatePriorityTasks: 0,
    lowPriorityTasks: 0,
    checkedTasks: 0,
  });

  const fetchUserCards = async () => {
    try {
      const response = await fetch("/api/users/cards", {
        method: "POST", // Ensure it matches the backend
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: "2025-04-01", 
          endDate: "2025-04-30",
        }),
      });

      if (!response.ok) throw new Error("Failed to fetch cards from server");

      const data = await response.json();
      setCards(data.cards || []);
      setAnalyticsDetails(calculateAnalyticsDetails(data.cards || [])); // Update analytics immediately
    } catch (error) {
      console.error("Error fetching user cards:", error.message);
    }
  };

  const calculateAnalyticsDetails = (cards) => {
    const updatedAnalyticsDetails = {
      backlogTasks: 0,
      todoTasks: 0,
      highPriorityTasks: 0,
      moderatePriorityTasks: 0,
      lowPriorityTasks: 0,
      checkedTasks: 0,
    };

    const currentDate = new Date();

    cards.forEach((card) => {
      switch (card.state) {
        case "Backlog":
          updatedAnalyticsDetails.backlogTasks++;
          break;
        case "ToDo":
          updatedAnalyticsDetails.todoTasks++;
          break;
        case "InProgress": // ✅ Fixed from "Progress" to "InProgress"
          updatedAnalyticsDetails.inProgressTasks++;
          break;
        default:
          break;
      }

      switch (card.priority) {
        case "High":
          updatedAnalyticsDetails.highPriorityTasks++;
          break;
        case "Moderate":
          updatedAnalyticsDetails.moderatePriorityTasks++;
          break;
        case "Low":
          updatedAnalyticsDetails.lowPriorityTasks++;
          break;
        default:
          break;
      }

      if (card.checklist && Array.isArray(card.checklist)) {
        updatedAnalyticsDetails.checkedTasks += card.checklist.filter((task) => task.checked).length;
      }

      if (card.dueDate && card.state !== "Done") {
        const dueDate = new Date(card.dueDate);
        if (currentDate >= dueDate) {
          updatedAnalyticsDetails.dueDateTasks++;
        }
      }
    });

    return updatedAnalyticsDetails;
  };

  useEffect(() => {
    fetchUserCards();
  }, []);

  return (
    <div>
      <div className={styles.analyticsTitle}>Analytics</div>
      <div className={styles.analytics}>
        <div className={styles.analyticsContainer1}>
          {[
            { label: "Backlog Tasks", value: analyticsDetails.backlogTasks },
            { label: "ToDo Tasks", value: analyticsDetails.todoTasks },
            { label: "Checked Tasks", value: analyticsDetails.checkedTasks },
          ].map((item, index) => (
            <div key={index} className={styles.analyticsSection}>
              <div className={styles.analyticsTitle1}>
                <img src={ellipseImage} alt="Ellipse" className={styles.ellipseImage} />
                <div className={styles.text}>
                  <p>{item.label}:</p>
                </div>
                <span className={styles.analyticsValue}>{item.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.analyticsContainer2}>
          {[
            { label: "Low Priority Tasks", value: analyticsDetails.lowPriorityTasks },
            { label: "Moderate Priority Tasks", value: analyticsDetails.moderatePriorityTasks },
            { label: "High Priority Tasks", value: analyticsDetails.highPriorityTasks },
          ].map((item, index) => (
            <div key={index} className={styles.analyticsSection}>
              <div className={styles.analyticsTitle1}>
                <img src={ellipseImage} alt="Ellipse" className={styles.ellipseImage} />
                <div className={styles.text}>
                  <p>{item.label}:</p>
                </div>
                <span className={styles.analyticsValue}>{item.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
