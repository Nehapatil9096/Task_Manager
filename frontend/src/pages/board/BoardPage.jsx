import React, { useState, useEffect, useRef } from "react";
import { useAuthContext } from "../../context/AuthContext";
import { getFormattedDate } from "../../utils/dateUtils";
import styles from "./BoardPage.module.css";
import ToDoCard from "./ToDoCard";
import { toast } from "react-toastify";

const BoardPage = () => {
  const { authUser, setAuthUserData } = useAuthContext();
  const currentDate = new Date().toISOString();
  const [showToDoCard, setShowToDoCard] = useState(false);
  const [cards, setCards] = useState(authUser.cards || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeMenuCardId, setActiveMenuCardId] = useState(null);
  const [editedCard, setEditedCard] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [cardIdToDelete, setCardIdToDelete] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("thisWeek");
  const [showFullTitle, setShowFullTitle] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // New state for search query

  // Function to display a clipped version of the title
  const getClippedTitle = (title) => {
    const characterLimit = 25;
    if (showFullTitle) {
      return title;
    }
    return title.length > characterLimit ? `${title.slice(0, characterLimit)}...` : title;
  };

  const isDueDatePassed = (dueDate) => {
    const currentDate = new Date();
    const cardDueDate = new Date(dueDate);
    return cardDueDate < currentDate;
  };

  const getDueDateButtonColor = (card) => {
    if (!card.dueDate) return "";
    if (card.state === "Done") return "green";
    if (isDueDatePassed(card.dueDate)) return "red";
    return "gray";
  };

  const handleToDoCardOpen = () => {
    setEditedCard(null);
    setModalVisible(true);
  };

  const handleToDoCardClose = () => {
    setModalVisible(false);
    setEditedCard(null);
  };

  const renderAdjacentSectionButtons = (card, currentSection) => {
    const sections = ["Backlog", "Progress", "Done", "ToDo"];
    return sections
      .filter((targetSection) => targetSection !== currentSection)
      .map((targetSection) => (
        <button
          key={targetSection}
          onClick={() => moveCardToSection(card._id, targetSection)}
          className={`${styles.cardButton} ${styles[targetSection.toLowerCase() + "Button"]}`}
        >
          {targetSection}
        </button>
      ));
  };

  const moveCardToSection = async (cardId, targetSection) => {
    try {
      const cardIndex = cards.findIndex((card) => card._id === cardId);
      if (cardIndex === -1) throw new Error(`Card with ID ${cardId} not found.`);
      const movedCard = cards.splice(cardIndex, 1)[0];
      movedCard.state = targetSection;
      const updatedCards = [movedCard, ...cards];
      setCards(updatedCards);

      const response = await fetch(`/api/users/cards/${cardId}/move`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: targetSection }),
      });

      if (!response.ok) throw new Error(`Failed to move the card to ${targetSection}`);
      console.log(`Card moved to ${targetSection}`);
    } catch (error) {
      console.error(`Error moving card to ${targetSection}:`, error.message);
    }
  };

  const fetchUserCards = async () => {
    try {
      setLoading(true);
      let startDate, endDate;
      if (selectedFilter === "today") {
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setDate(endDate.getDate() + 1);
        endDate.setHours(0, 0, 0, 0);
      } else if (selectedFilter === "thisWeek") {
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 6);
        startDate.setHours(0, 0, 0, 0);
      } else if (selectedFilter === "thisMonth") {
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 29);
        startDate.setHours(0, 0, 0, 0);
      }

      const response = await fetch("/api/users/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate }),
      });

      if (!response.ok) throw new Error("Failed to fetch cards from the server");
      const data = await response.json();
      const updatedCards = data.cards.map((card) => ({ ...card, _id: card._id }));
      setCards([...updatedCards]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCard = async (newCard) => {
    try {
      const updatedCards = [newCard];
      setCards(updatedCards);
      const updatedUser = { ...authUser, cards: updatedCards };
      setAuthUserData(updatedUser);

      const response = await fetch("/api/users/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });

      if (!response.ok) throw new Error("Failed to save the new card on the server");
      await fetchUserCards();
      console.log("User data updated on the server");
    } catch (error) {
      console.error("Error updating user data:", error.message);
    }
  };

  useEffect(() => {
    fetchUserCards();
  }, [selectedFilter]);

  const handleToggleChecklist = (cardId) => {
    setCards((prevCards) =>
      prevCards.map((card) =>
        card._id === cardId ? { ...card, showChecklist: !card.showChecklist } : card
      )
    );
  };

  const handleEditCard = (cardId) => {
    const selectedCard = cards.find((card) => card._id === cardId);
    setEditedCard(selectedCard);
    setEditModalVisible(true);
  };

  const openDeleteConfirmation = (cardId) => {
    setCardIdToDelete(cardId);
    setShowDeleteConfirmation(true);
  };

  const closeDeleteConfirmation = () => {
    setShowDeleteConfirmation(false);
  };

  const handleDeleteCard = async (cardId) => {
    openDeleteConfirmation(cardId);
  };

  const confirmDeleteAction = async () => {
    try {
      const response = await fetch(`/api/users/cards/${cardIdToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete the card");
      setCards((prevCards) => prevCards.filter((card) => card._id !== cardIdToDelete));
    } catch (error) {
      console.error("Error deleting card:", error.message);
    } finally {
      closeDeleteConfirmation();
    }
  };

  const DeleteConfirmationModal = () => (
    <div className={styles.popup}>
      <div className={styles.content}>
        <p>Are you sure you want to Delete?</p>
        <div className={styles.popupButtons}>
          <button onClick={confirmDeleteAction} className={styles.deletePopupButton}>
            Yes
          </button>
0          <button onClick={closeDeleteConfirmation} className={styles.deletePopupButton}>
            No
          </button>
        </div>
      </div>
    </div>
  );

  const handleSaveEdit = async (editedCard) => {
    try {
      const updatedCardData = {
        title: editedCard.title,
        priority: editedCard.priority,
        checklist: editedCard.checklist,
        dueDate: editedCard.dueDate,
        state: "ToDo",
      };

      const response = await fetch(`/api/users/onecard/${editedCard._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updatedCardData }),
      });

      if (!response.ok) throw new Error("Failed to save the edits on the server");
      await fetchUserCards();
      console.log("Card edits saved on the server");
      setEditModalVisible(false);
    } catch (error) {
      console.error("Error saving card edits:", error.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { month: "short", day: "numeric" };
    return date.toLocaleDateString("en-US", options);
  };

  const handleShareCard = (cardId) => {
    const sharedLink = `${window.location.origin}/api/users/shared-card/${cardId}`;
    navigator.clipboard.writeText(sharedLink).then(() => setShowToast(true));
  };

  useEffect(() => {
    const timeout = setTimeout(closeToast, 2000);
    return () => clearTimeout(timeout);
  }, [showToast]);

  const closeToast = () => setShowToast(false);

  const menuRef = useRef();

  useEffect(() => {
    const handleClickOutsideMenu = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuCardId(null);
      }
    };
    document.addEventListener("click", handleClickOutsideMenu);
    return () => document.removeEventListener("click", handleClickOutsideMenu);
  }, []);

  const handleMenuButtonClick = (cardId) => setActiveMenuCardId(cardId);
  const closeMenuPopup = () => setActiveMenuCardId(null);

  const handleCollapseAll = () => {
    setCards((prevCards) => prevCards.map((card) => ({ ...card, showChecklist: false })));
  };

  // Filter cards based on search query
  const filteredCards = cards.filter((card) =>
    card.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={styles.boardPage}>
      <div className={`${styles.top} ${styles.whiteBackground}`}>
        <div className={`${styles.topLeftText} ${styles.whiteBackground}`}>
          <h1 className={styles.welcome}>Welcome, {authUser.username}!</h1>
          <p className={styles.boardText}>Board</p>
        </div>
        <div className={`${styles.topRight} ${styles.whiteBackground}`}>
          <div className={styles.dateAndFilter}>
            <p className={styles.currentDate}>{getFormattedDate(currentDate)}</p>
            <div className={styles.filterDropdown}>
              <select
                onChange={(e) => setSelectedFilter(e.target.value)}
                value={selectedFilter}
              >
                <option value="today">Today</option>
                <option value="thisWeek">This Week</option>
                <option value="thisMonth">This Month</option>
              </select>
            </div>
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by task title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput} // Add this class in your CSS
            />
          </div>
        </div>
      </div>

      <div className={styles.boardSections}>
        {/* Backlog Section */}
        <div className={styles.boardSection}>
          <div className={styles.headingContainer}>
            <h2>Backlog</h2>
            <img
              src="/codicon_collapse-all.png"
              alt="Collapse All"
              className={styles.collapseIcon}
              onClick={handleCollapseAll}
            />
          </div>
          <div className={styles.scrollableTodoSection}>
            {filteredCards
              .filter((card) => card.state === "Backlog")
              .map((card) => (
                <div
                  key={card._id}
                  className={`${styles.card} ${card.showChecklist ? "" : styles.collapsed}`}
                >
                  <div className={styles.menuContainer}>
                    <div
                      className={styles.menuButton}
                      onClick={() => handleMenuButtonClick(card._id)}
                    >
                      <span>…</span>
                    </div>
                    {activeMenuCardId === card._id && (
                      <div className={styles.menuPopup}>
                        <button onClick={() => { handleEditCard(card._id); closeMenuPopup(); }}>Edit</button>
                        <button onClick={() => { handleShareCard(card._id); closeMenuPopup(); }}>Share</button>
                        <button onClick={() => { handleDeleteCard(card._id); closeMenuPopup(); }}>Delete</button>
                      </div>
                    )}
                  </div>
                  {card.priority === "High" && (
                    <div className={styles.priorityContainer}>
                      <div className={styles.circle} style={{ backgroundColor: "#FF2473" }}></div>
                      <p className={styles.priorityText}>{card.priority} Priority</p>
                    </div>
                  )}
                  {card.priority === "Moderate" && (
                    <div className={styles.priorityContainer}>
                      <div className={styles.circle} style={{ backgroundColor: "#18B0FF" }}></div>
                      <p className={styles.priorityText}>{card.priority} Priority</p>
                    </div>
                  )}
                  {card.priority === "Low" && (
                    <div className={styles.priorityContainer}>
                      <div className={styles.circle} style={{ backgroundColor: "#63C05B" }}></div>
                      <p className={styles.priorityText}>{card.priority} Priority</p>
                    </div>
                  )}
                  <div className={styles.checklistContainer}>
                    <div className={styles.textContainer}>
                      <p className={styles.titleText} title={card.title}>
                        {getClippedTitle(card.title)}
                      </p>
                      <p>
                        Checklist ({card.checklist.filter((task) => task.checked).length}/{card.checklist.length})
                      </p>
                    </div>
                    <div className={styles.buttonContainer}>
                      <button onClick={() => handleToggleChecklist(card._id)}>
                        {card.showChecklist ? "^" : "⌄"}
                      </button>
                    </div>
                    {card.showChecklist && (
                      <div className={styles.checklist}>
                        <ul>
                          {card.checklist.map((item, index) => (
                            <li key={index} className={`${styles.checklistItem} ${styles.wrapText}`}>
                              {item.checked ? (
                                <span className={styles.checked}>
                                  <span className={styles.checkbox}></span>
                                </span>
                              ) : (
                                <span className={styles.unchecked}></span>
                              )}
                              {item.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardButtons}>
                    <p
                      className={`${styles.dueDate} ${!card.dueDate && styles.noDueDate}`}
                      style={{ backgroundColor: getDueDateButtonColor(card) }}
                    >
                      {card.dueDate ? formatDate(card.dueDate) : ""}
                    </p>
                    {renderAdjacentSectionButtons(card, card.state)}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* To Do Section */}
        <div className={styles.boardSection}>
          <div className={styles.headingContainer}>
            <h2>To do</h2>
            <button className={styles.addButton} onClick={handleToDoCardOpen}>
              +
            </button>
            <img
              src="/codicon_collapse-all.png"
              alt="Collapse All"
              className={styles.collapseIcon}
              onClick={handleCollapseAll}
            />
          </div>
          <div className={styles.scrollableTodoSection}>
            {filteredCards
              .filter((card) => card.state === "ToDo")
              .reverse()
              .map((card) => (
                <div
                  key={card._id}
                  className={`${styles.card} ${card.showChecklist ? "" : styles.collapsed}`}
                >
                  <div className={styles.menuContainer}>
                    <div
                      className={styles.menuButton}
                      onClick={() => setActiveMenuCardId(card._id)}
                    >
                      <span>…</span>
                    </div>
                    {activeMenuCardId === card._id && (
                      <div className={styles.menuPopup}>
                        <button onClick={() => { handleEditCard(card._id); closeMenuPopup(); }}>Edit</button>
                        <button onClick={() => { handleShareCard(card._id); closeMenuPopup(); }}>Share</button>
                        <button onClick={() => { handleDeleteCard(card._id); closeMenuPopup(); }}>Delete</button>
                      </div>
                    )}
                  </div>
                  {card.priority === "High" && (
                    <div className={styles.priorityContainer}>
                      <div className={styles.circle} style={{ backgroundColor: "#FF2473" }}></div>
                      <p className={styles.priorityText}>{card.priority} Priority</p>
                    </div>
                  )}
                  {card.priority === "Moderate" && (
                    <div className={styles.priorityContainer}>
                      <div className={styles.circle} style={{ backgroundColor: "#18B0FF" }}></div>
                      <p className={styles.priorityText}>{card.priority} Priority</p>
                    </div>
                  )}
                  {card.priority === "Low" && (
                    <div className={styles.priorityContainer}>
                      <div className={styles.circle} style={{ backgroundColor: "#63C05B" }}></div>
                      <p className={styles.priorityText}>{card.priority} Priority</p>
                    </div>
                  )}
                  <div className={styles.checklistContainer}>
                    <div className={styles.textContainer}>
                      <p className={styles.titleText} title={card.title}>
                        {getClippedTitle(card.title)}
                      </p>
                      <p>
                        Checklist ({card.checklist.filter((task) => task.checked).length}/{card.checklist.length})
                      </p>
                    </div>
                    <div className={styles.buttonContainer}>
                      <button onClick={() => handleToggleChecklist(card._id)}>
                        {card.showChecklist ? "^" : "⌄"}
                      </button>
                    </div>
                    {card.showChecklist && (
                      <div className={styles.checklist}>
                        <ul>
                          {card.checklist.map((item, index) => (
                            <li key={index} className={`${styles.checklistItem} ${styles.wrapText}`}>
                              {item.checked ? (
                                <span className={styles.checked}>
                                  <span className={styles.checkbox}></span>
                                </span>
                              ) : (
                                <span className={styles.unchecked}></span>
                              )}
                              {item.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardButtons}>
                    <p
                      className={`${styles.dueDate} ${!card.dueDate && styles.noDueDate}`}
                      style={{ backgroundColor: getDueDateButtonColor(card) }}
                    >
                      {card.dueDate ? formatDate(card.dueDate) : ""}
                    </p>
                    {renderAdjacentSectionButtons(card, card.state)}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* In Progress Section */}
        <div className={styles.boardSection}>
          <div className={styles.headingContainer}>
            <h2>In Progress</h2>
            <img
              src="/codicon_collapse-all.png"
              alt="Collapse All"
              className={styles.collapseIcon}
              onClick={handleCollapseAll}
            />
          </div>
          <div className={styles.scrollableTodoSection}>
            {filteredCards
              .filter((card) => card.state === "Progress")
              .map((card) => (
                <div
                  key={card._id}
                  className={`${styles.card} ${card.showChecklist ? "" : styles.collapsed}`}
                >
                  <div className={styles.menuContainer}>
                    <div
                      className={styles.menuButton}
                      onClick={() => setActiveMenuCardId(card._id)}
                    >
                      <span>…</span>
                    </div>
                    {activeMenuCardId === card._id && (
                      <div className={styles.menuPopup}>
                        <button onClick={() => { handleEditCard(card._id); closeMenuPopup(); }}>Edit</button>
                        <button onClick={() => { handleShareCard(card._id); closeMenuPopup(); }}>Share</button>
                        <button onClick={() => { handleDeleteCard(card._id); closeMenuPopup(); }}>Delete</button>
                      </div>
                    )}
                  </div>
                  {card.priority === "High" && (
                    <div className={styles.priorityContainer}>
                      <div className={styles.circle} style={{ backgroundColor: "#FF2473" }}></div>
                      <p className={styles.priorityText}>{card.priority} Priority</p>
                    </div>
                  )}
                  {card.priority === "Moderate" && (
                    <div className={styles.priorityContainer}>
                      <div className={styles.circle} style={{ backgroundColor: "#18B0FF" }}></div>
                      <p className={styles.priorityText}>{card.priority} Priority</p>
                    </div>
                  )}
                  {card.priority === "Low" && (
                    <div className={styles.priorityContainer}>
                      <div className={styles.circle} style={{ backgroundColor: "#63C05B" }}></div>
                      <p className={styles.priorityText}>{card.priority} Priority</p>
                    </div>
                  )}
                  <div className={styles.checklistContainer}>
                    <div className={styles.textContainer}>
                      <p className={styles.titleText} title={card.title}>
                        {getClippedTitle(card.title)}
                      </p>
                      <p>
                        Checklist ({card.checklist.filter((task) => task.checked).length}/{card.checklist.length})
                      </p>
                    </div>
                    <div className={styles.buttonContainer}>
                      <button onClick={() => handleToggleChecklist(card._id)}>
                        {card.showChecklist ? "^" : "⌄"}
                      </button>
                    </div>
                    {card.showChecklist && (
                      <div className={styles.checklist}>
                        <ul>
                          {card.checklist.map((item, index) => (
                            <li key={index} className={`${styles.checklistItem} ${styles.wrapText}`}>
                              {item.checked ? (
                                <span className={styles.checked}>
                                  <span className={styles.checkbox}></span>
                                </span>
                              ) : (
                                <span className={styles.unchecked}></span>
                              )}
                              {item.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardButtons}>
                    <p
                      className={`${styles.dueDate} ${!card.dueDate && styles.noDueDate}`}
                      style={{ backgroundColor: getDueDateButtonColor(card) }}
                    >
                      {card.dueDate ? formatDate(card.dueDate) : ""}
                    </p>
                    {renderAdjacentSectionButtons(card, card.state)}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Done Section */}
        <div className={styles.boardSection}>
          <div className={styles.headingContainer}>
            <h2>Done</h2>
            <img
              src="/codicon_collapse-all.png"
              alt="Collapse All"
              className={styles.collapseIcon}
              onClick={handleCollapseAll}
            />
          </div>
          <div className={styles.scrollableTodoSection}>
            {filteredCards
              .filter((card) => card.state === "Done")
              .map((card) => (
                <div
                  key={card._id}
                  className={`${styles.card} ${card.showChecklist ? "" : styles.collapsed}`}
                >
                  <div className={styles.menuContainer}>
                    <div
                      className={styles.menuButton}
                      onClick={() => setActiveMenuCardId(card._id)}
                    >
                      <span>…</span>
                    </div>
                    {activeMenuCardId === card._id && (
                      <div className={styles.menuPopup}>
                        <button onClick={() => { handleEditCard(card._id); closeMenuPopup(); }}>Edit</button>
                        <button onClick={() => { handleShareCard(card._id); closeMenuPopup(); }}>Share</button>
                        <button onClick={() => { handleDeleteCard(card._id); closeMenuPopup(); }}>Delete</button>
                      </div>
                    )}
                  </div>
                  {card.priority === "High" && (
                    <div className={styles.priorityContainer}>
                      <div className={styles.circle} style={{ backgroundColor: "#FF2473" }}></div>
                      <p className={styles.priorityText}>{card.priority} Priority</p>
                    </div>
                  )}
                  {card.priority === "Moderate" && (
                    <div className={styles.priorityContainer}>
                      <div className={styles.circle} style={{ backgroundColor: "#18B0FF" }}></div>
                      <p className={styles.priorityText}>{card.priority} Priority</p>
                    </div>
                  )}
                  {card.priority === "Low" && (
                    <div className={styles.priorityContainer}>
                      <div className={styles.circle} style={{ backgroundColor: "#63C05B" }}></div>
                      <p className={styles.priorityText}>{card.priority} Priority</p>
                    </div>
                  )}
                  <div className={styles.checklistContainer}>
                    <div className={styles.textContainer}>
                      <p className={styles.titleText} title={card.title}>
                        {getClippedTitle(card.title)}
                      </p>
                      <p>
                        Checklist ({card.checklist.filter((task) => task.checked).length}/{card.checklist.length})
                      </p>
                    </div>
                    <div className={styles.buttonContainer}>
                      <button onClick={() => handleToggleChecklist(card._id)}>
                        {card.showChecklist ? "^" : "⌄"}
                      </button>
                    </div>
                    {card.showChecklist && (
                      <div className={styles.checklist}>
                        <ul>
                          {card.checklist.map((item, index) => (
                            <li key={index} className={`${styles.checklistItem} ${styles.wrapText}`}>
                              {item.checked ? (
                                <span className={styles.checked}>
                                  <span className={styles.checkbox}></span>
                                </span>
                              ) : (
                                <span className={styles.unchecked}></span>
                              )}
                              {item.text}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardButtons}>
                    <p
                      className={`${styles.dueDate} ${!card.dueDate && styles.noDueDate}`}
                      style={{ backgroundColor: getDueDateButtonColor(card) }}
                    >
                      {card.dueDate ? formatDate(card.dueDate) : ""}
                    </p>
                    {renderAdjacentSectionButtons(card, card.state)}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {modalVisible && <ToDoCard onClose={handleToDoCardClose} onSave={handleSaveCard} />}
        {editedCard && editedCard._id && (
          <ToDoCard
            onClose={handleToDoCardClose}
            onSave={handleSaveEdit}
            initialData={editedCard}
          />
        )}
      </div>

      {showDeleteConfirmation && <DeleteConfirmationModal />}
      {showToast && (
        <div className={styles.toastMessage}>
          <p>Link Copied</p>
        </div>
      )}
    </div>
  );
};

export default BoardPage;