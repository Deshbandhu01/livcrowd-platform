# 🚀 Livcrwd – Real-Time Crowd Tracking Web App

## 📌 Overview
Livcrwd is a full-stack web application that tracks real-time crowd density and provides actionable insights for users and administrators. It helps users avoid crowded places and enables admins to monitor and manage crowd flow efficiently.

---

## ✨ Features

### 👤 User Dashboard
- 📡 Real-time crowd updates (WebSockets / Polling)
- 📍 Location-based crowd insights
- 📊 Visual representation (charts & maps)
- 🚦 Crowd density alerts (Low / Medium / High)

### 🛠️ Admin Panel
- 🔐 Secure authentication (Login/Register)
- 📊 Manage crowd data
- 📈 Analytics dashboard
- 👥 User management

### ⚙️ Core Functionalities
- Real-time communication using WebSockets
- REST API integration
- Responsive UI (Mobile + Desktop)
- Scalable backend architecture

---

## 🏗️ Tech Stack

### Frontend
- React.js / Vite
- Tailwind CSS / CSS
- Chart.js / Recharts

### Backend
- Node.js
- Express.js

### Database
- MongoDB / PostgreSQL

---



## ⚡ Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/livcrwd.git
cd livcrwd
```

### 2️⃣ Install dependencies
```bash
npm install
cd client && npm install
```

### 3️⃣ Setup environment variables

Create a `.env` file in the root:

```env
PORT=5000
GEMINI_API= ....
```

---

## 🌐 API Endpoints

| Method | Endpoint              | Description       |
|--------|---------------------|-------------------|
| GET    | /api/crowd          | Get crowd data    |
| POST   | /api/crowd          | Add crowd data    |
| POST   | /api/auth/login     | User login        |
| POST   | /api/auth/register  | Register user     |

---

## 📡 Real-Time Feature
- Uses WebSockets to push live updates
- Automatically updates UI without refresh
- Efficient for high-frequency data updates

---

## 🧪 Sample Data

```json
{
  "location": "City Center",
  "density": "High",
  "timestamp": "2026-04-04T10:00:00Z"
}
```

---

## 🚀 Future Enhancements
- 🤖 AI-based crowd prediction
- 🗺️ Google Maps integration
- 📱 Mobile app version
- 🔔 Push notifications

---

## 🤝 Contributing

```bash
fork -> clone -> create branch -> commit -> push -> pull request
```


---

⭐ If you like this project, don't forget to star the repo!

## Active Link

'''
https://livcrwd-platform-v-1.netlify.app/
'''
