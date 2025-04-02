# Task Manager

  Setup and Run Instructions

 # Prerequisites
Ensure you have the following installed:
- Node.js (Latest LTS version recommended)
- MongoDB Atlas (or a local MongoDB instance)
- Git

 # Steps to Set Up the Project
1.   Clone the Repository:  
   ```sh
   git clone https://github.com/Nehapatil9096/Task_Manager.git
   cd Task_Manager
   ```

2.   Set Up Environment Variables:  
   Create a `.env` file in the root directory and add the following:
   ```env
   MONGO_URI=<your_mongodb_connection_string>
   JWT_SECRET=<your_secret_key>
   PORT=10000
   ```

3.   Install Dependencies:  
   ```sh
   npm install
   npm install --prefix frontend
   ```

4.   Build the Frontend:  
   ```sh
   npm run build
   ```

5.   Start the Server:  
   ```sh
   npm start
   ```
   The backend will run on `http://localhost:10000`.

 # Running in Development Mode
For easier debugging, use Nodemon:
```sh
npm run server
```

  Assumptions Made During Development
- Users will have valid MongoDB credentials to connect to the database.
- A `.env` file will be properly set up with required environment variables.
- The frontend is built using Vite and will serve static files from the `dist` folder.

  Technologies and Libraries Used
-   Backend:  
  - Node.js
  - Express.js
  - MongoDB / Mongoose
  - JWT for authentication
  - bcrypt for password hashing
-   Frontend:  
  - React.js
  - React Toastify
  - Vite for bundling
-   Development Tools:  
  - Nodemon (for automatic server restarts during development)
  - dotenv (for managing environment variables)

  Challenges Faced and How They Were Addressed
1.   Missing `JWT_SECRET` Environment Variable  
   - Solution: Ensured that `.env` file was correctly configured and loaded with `dotenv`.

2.   Frontend Not Loading Due to Missing `index.html` in `dist` Folder  
   - Solution: Updated the build process to ensure the frontend assets are properly generated before deployment.

3.   Deployment Issues on Render  
   - Solution: Specified the correct build and start commands in Render's deployment settings.

