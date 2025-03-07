# 🚀 ProManage - Task Management API

## 📌 Description
ProManage is a task management application that allows users to sign up, log in, and manage their tasks. It is built using **Node.js, Express, MongoDB Atlas, and JWT authentication**.

---

## 🛠️ Installation
### 1️⃣ **Clone the Repository**
```sh
git clone https://github.com/yourusername/ProManage.git
cd ProManage/backend
```

### 2️⃣ **Install Dependencies**
```sh
npm install
```

---

## 📌 Environment Variables
Create a `.env` file in the **backend** folder and add the following:
```ini
PORT=5000
MONGO_DB_URI=mongodb+srv://admin:YOUR_PASSWORD@yourcluster.mongodb.net/ProManageDB?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_super_secure_jwt_secret
NODE_ENV=development
```
Replace `YOUR_PASSWORD` with your actual **MongoDB password**, and `your_super_secure_jwt_secret` with a **random secure key**.

---

## 🚀 Running the Server
### **Development Mode** (Auto-restart on file changes)
```sh
npm run dev
```

### **Production Mode**
```sh
npm start
```

---

## 📌 API Endpoints
### 📝 **Auth Routes**
| Method | Endpoint      | Description          |
|--------|--------------|----------------------|
| POST   | `/api/auth/signup`  | Register a new user |
| POST   | `/api/auth/login`   | User login         |
| POST   | `/api/auth/logout`  | User logout        |

### ✅ **Task Management Routes**
| Method | Endpoint         | Description         |
|--------|-----------------|---------------------|
| GET    | `/api/tasks`     | Get all tasks      |
| POST   | `/api/tasks`     | Create a new task  |
| PUT    | `/api/tasks/:id` | Update a task      |
| DELETE | `/api/tasks/:id` | Delete a task      |

---

## 🏗️ Tech Stack
- **Backend:** Node.js, Express
- **Database:** MongoDB Atlas
- **Authentication:** JWT, bcrypt.js

---

## ❓ Troubleshooting
- **MongoDB connection error?** Check your `.env` file and whitelist your IP in MongoDB Atlas.
- **JWT secret error?** Ensure `JWT_SECRET` is set in `.env`.

---

## 🎯 Future Improvements
- Add real-time task updates
- Implement email verification
- Enhance error handling

---


