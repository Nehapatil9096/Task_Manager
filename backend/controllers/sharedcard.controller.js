import User from "../models/user.model.js";

// Priority color mapping (adjust colors as needed)
const priorityColorMap = {
  High: "#FF2473",
  Moderate: "#18B0FF",
  Low: "#63C05B",
};

// Function to format date (you can customize it based on your needs)
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Define a new endpoint for accessing a specific card publicly
export const getSharedCard = async (req, res) => {
  try {
    const { cardId } = req.params;

    // Find the user by ID
    const user = await User.findOne({ 'cards._id': cardId });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ error: "User or card not found" });
    }

    // Find the card within the user's cards array
    const card = user.cards.find((card) => card._id.toString() === cardId);

    // Check if the card exists
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

 // Generate HTML for checklist items
 let checklistHTML = '';
 card.checklist.forEach((item, index) => {
   checklistHTML += `
     <li class="checklistItem">
     <span class="${item.checked ? 'checked' : 'unchecked'}"></span>
     <label for="item${index}">${item.text}</label>
     </li>
   `;
 });

    // Return the card information and the style tag
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Shared Card</title>
          <style>
            /* Include your CSS styles here */
            body {
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              position: relative; /* Set position relative for the body */

            }
            .card {
              background-color: #fff;
              border-radius: 20px;
              padding: 15px;
              margin-bottom: 20px;
              width: 500px;
              margin-left: 20px;
              margin-left: auto;
              margin-right: auto;
              margin-top: 4px;
              border: 1px solid #ccc; /* Add border */
                        }
                        h1 {
                          position: absolute; /* Set position absolute for "Pro Manage" */
                          top: 10px; /* Adjust top position as needed */
                          left: 15px; /* Adjust left position as needed */
                           margin-left:45px;
                           margin-up:85px;
                           font-family: 'Poppins', sans-serif; /* Use Poppins font */

                           font-size:20px;
                        }
                        img {
          position: absolute; /* Set position absolute for the image */
          top: 20px; /* Adjust top position as needed */
          left: 10px; /* Adjust left position as needed */
          width: 30px; /* Adjust width as needed */
          height: auto; /* Maintain aspect ratio */
          margin-up:35px;
          font-size:2px;


        }
            .priorityContainer {
              display: flex;
              align-items: center;
              margin-top: 4px;
            }
            .circle {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              margin-right: 5px;
              margin-bottom: 12px;
              margin-top: 12px;
            }
            .priorityText {
              font-size: 7px;
              font-family: 'Poppins', sans-serif;
              color: #333;
              margin: 0;
              text-transform: uppercase;
            }
            .titleText {
              font-size: 20px;
              font-family: 'Poppins', sans-serif;
              color: #000000;
              margin: 0;
              font-weight: bold;
            }
            .cardButtons {
              padding: 5px 10px;
              margin-right: 5px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 10px;
              display: flex;
              margin-top: 10px;
            }
            .backlogButton,
            .inProgressButton,
            .doneButton,
            .toDoButton {
              padding: 5px 10px;
              margin-right: 5px;
              border: 1px solid #CCCCCC;
              border-radius: 5px;
              cursor: pointer;
              margin-left: 10px;
            }
            .cardButton {
              cursor: pointer;
              background-color: #767575;
              padding: 5px 3px;
              margin-right: 5px;
              border: 1px solid #CCCCCC;
              border-radius: 10px;
              margin-left: 20px;
            }
            .cardButton:hover {
              opacity: 0.8;
            }
            .dueDate {
              background-color: #CF3636;
              padding: 5px 10px;
              width: 65px;
              margin-right: 5px;
              border: 1px solid #CCCCCC;
              border-radius: 10px;
              cursor: pointer;
              margin-left: 10px;
              color: #FFFFFF;
              font-size: 10px;
            }
            .dueDateContainer {
              display: flex;
              align-items: center;
            }
            
            .dueDateText {
              margin-right: 5px; /* Adjust margin as needed */
            }
            

            /* Additional styles for checklist box and items */
            /* Add the following styles at the end of your existing CSS file */
            .checklist {
              margin-top: 10px;
              margin-bottom: 10px;
              max-height: 400px; /* Adjust the maximum height as needed */
              overflow-y: auto;
            }
            
            .checklistButton {
              background-color: #3498db;
              color: #fff;
              border: none;
              padding: 5px 10px;
              cursor: pointer;
            }
            
            .checklistBox {
              margin-top: 5px;
            }
            
           
            .checklistItem {
              display: flex;
              align-items: center;
              margin-bottom: 5px;
              white-space: normal; /* Allow text wrapping */
              word-wrap: break-word; /* Break words that exceed the width */
              overflow-wrap: break-word; /* Ensure word breaks within words */
              hyphens: auto; /* Allow hyphenation for long words */
            
            }
            .checklistItem input {
              margin-right: 5px;
            }
            
            .addNewTaskInput {
              margin-top: 5px;
              padding: 5px;
              width: 100%;
            }
            
            /* You can add more styles as needed */
            /* BoardPage.module.css */
            
            .checklistItem {
              list-style-type: none;
              margin-bottom: 8px;
              
            }
            
            .checklistItem label {
              display: flex;
              align-items: center;
              margin-right: 8px; /* Adjust margin between checkbox and text */
            
              
            }
            
            .checklistItem input[type="checkbox"] {
              margin-right: 8px;
              width: 20px;
              height: 20px;
              border: 1px solid #ccc;
              background-color: white;
              border-radius: 15px;
              
              
            }
            
            .checklistItem input[type="checkbox"]:checked {
              background-color: blue;
            }
            .checked{
              background-color: 
              #17A2B8;
            
            }
            /* Styles for displaying the checkmark */
            .checked,
            .unchecked {
              display: inline-block;
              width: 20px;
              height: 20px;
              border: 1px solid #ccc;
              border-radius: 5px;
            
            }
            
            
            .unchecked:before {
              content: '';
            }
            
            /* Styles for displaying the checkmark */
            .checked:before {
              content: '\u2713'; /* Unicode character for checked checkbox */
              color: white; /* Set the color of the tick to white */
            }
            /* Additional Styles for the new structure */
            .checklistItem {
              border: 1px solid grey; /* Add border around each checklist item */
              padding: 8px; /* Add padding for spacing */
              margin-bottom: 8px; /* Add margin bottom to separate items */
              list-style-type: none; /* Remove default list style */
              border-radius: 10px;
              
            }
            
            .dueDate {
              display: inline-block;
              background-color: #CF3636;
              padding: 5px 10px;
              margin-right: 5px;
              border: 1px solid #CCCCCC;
              border-radius: 10px;
              cursor: pointer;
              margin-left: 20px;
              color: #FFFFFF;
              font-size: 10px;
            }
            /* Media queries for smaller screens */
            @media screen and (max-width: 600px) {
              .card {
                width: 100%; /* Set width to full for smaller screens */
              }
            }
          </style>
        </head>
        <body>
<img src="/codesandbox.png" alt="Pro Manage Logo"> <!-- Add image here -->
      <h1>Task Manager</h1>
          <div class="card">

            <!-- Priority display based on card.priority -->
            ${card.priority ? `
              <div class="priorityContainer">
                <div class="circle" style="background-color: ${priorityColorMap[card.priority]}"></div>
                <p class="priorityText">${card.priority} Priority</p>
              </div>
            ` : ''}
    
            <!-- Title, Checklist, and Checklist items -->
            <p class="titleText">${card.title}</p>
            <p>Checklist (${card.checklist.filter(task => task.checked).length}/${card.checklist.length})</p>
            <!-- Checklist display -->
            <div class="checklist">
            <ul>${checklistHTML}</ul>

            </div>

            <!-- Due date display based on card.dueDate -->
            ${card.dueDate ? `<div class="dueDateContainer"><p class="dueDateText">Due Date:</p><p class="dueDate">${formatDate(card.dueDate)}</p></div>` : ''}
    
            <!-- Add other card details as needed -->
            <!-- You can customize the display of other card details based on your schema -->
    
            <!-- Add buttons at the bottom of each card -->
            <div class="cardButtons"></div>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error("Error in getSharedCard: ", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
