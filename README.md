# 🎯 LivCrwd Platform

> **AI-Powered Live Crowd Detection & Event Management System**  
> Built with React · TypeScript · Google Gemini AI · Firebase · Express.js

🔗 **Live Demo:** [livcrwd-platform-v-1.netlify.app](https://livcrwd-platform-v-1.netlify.app/)

---

## 📌 About the Project

**LivCrwd** is an intelligent, real-time crowd detection and management platform designed to help event organizers monitor crowd density, receive AI-powered insights, and respond to emergencies faster.

Instead of raw data streams, LivCrwd uses **Google Gemini AI** (`@google/genai`) to intelligently analyze crowd conditions and deliver actionable insights — not just numbers.

---

## ✨ Features

- 📊 **Live Crowd Dashboard** — Real-time crowd density visualization using Recharts & D3.js
- 🤖 **Gemini AI Assistant** — Powered by `@google/genai`, answers crowd queries in natural language
- 🚨 **Smart Alerts** — AI-triggered crowd density alerts (Low / Medium / High)
- 🔐 **Firebase Authentication** — Secure login & registration for users and admins
- 🗄️ **Firestore Database** — Real-time cloud database for crowd data
- 📱 **Responsive UI** — Mobile + Desktop friendly with Tailwind CSS
- 📈 **Analytics Dashboard** — Charts, trends, and crowd flow insights
- 🌐 **Deployed on Netlify** — Live and accessible globally

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **AI Engine** | Google Gemini AI (`@google/genai` v1.29) |
| **Backend** | Express.js, Node.js, TSX |
| **Database** | Firebase Firestore |
| **Auth** | Firebase Authentication |
| **Charts** | Recharts, D3.js |
| **Deployment** | Netlify |
| **Build Tool** | Vite 6 |

---

## 📁 Project Structure

```
livcrowd-platform/
├── src/                          # React frontend source
├── server.ts                     # Express.js backend server
├── index.html                    # App entry point
├── firebase-blueprint.json       # Firebase project config
├── firebase-applet-config.json   # Firebase app settings
├── firestore.rules               # Firestore security rules
├── netlify.toml                  # Netlify deployment config
├── vite.config.ts                # Vite build configuration
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies & scripts
└── .gitignore                    # Ignored files
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Firebase project ([console.firebase.google.com](https://console.firebase.google.com))
- Google Gemini API Key — free at [aistudio.google.com](https://aistudio.google.com)

### 1. Clone the Repository

```bash
git clone https://github.com/Deshbandhu01/livcrowd-platform.git
cd livcrowd-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ **Never push `.env` to GitHub.** It is already covered by `.gitignore`.

### 4. Run the Development Server

```bash
npm run dev
```

App runs at: `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

---

## 🤖 Gemini AI Integration

LivCrwd uses **Google Gemini AI** via the official `@google/genai` SDK for all AI-powered features.

### Why Gemini AI and Not WebSocket?

We made a deliberate architectural choice — **AI-powered smart polling** over raw WebSocket streams:

| Feature | WebSocket Only | LivCrwd (Gemini AI) |
|---------|---------------|---------------------|
| Data type | Raw numbers | Intelligent insights |
| Response quality | Fast but unprocessed | Smart & actionable |
| Emergency alerts | Manual threshold | AI-detected anomalies |
| Cost | High server overhead | Free tier (15 req/min) |
| Scalability | Complex persistent connections | Stateless & cloud-ready |

> 💡 **"We trade milliseconds for intelligence — in crowd safety, a smart alert beats a fast one every time."**

### AI Use Cases in LivCrwd

- 💬 Natural language crowd status queries
- 📋 Auto-generated crowd density reports
- 🚨 Anomaly detection & safety alert generation
- 🗺️ Optimal crowd flow & exit route suggestions
- 📊 Post-event intelligent analytics

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/crowd` | Get current crowd data |
| `POST` | `/api/crowd` | Submit crowd data |
| `POST` | `/api/auth/login` | User login |
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/ai/generate` | Query Gemini AI |

---

## 🚀 Deployment

The app is deployed on **Netlify** with automatic builds from the `main` branch.

Live URL: [https://livcrwd-platform-v-1.netlify.app/](https://livcrwd-platform-v-1.netlify.app/)

---

## 🗺️ Roadmap

- [x] **Phase 1** — React + TypeScript frontend, Firebase auth & Firestore
- [x] **Phase 2** — Gemini AI integration, crowd alerts, Netlify deployment
- [x] **Phase 3** — Advanced analytics, Google Maps integration
- [ ] **Phase 4** — Mobile app, push notifications, enterprise features

---

## 🔒 Security

- All API keys stored in `.env` — never committed to GitHub
- Firestore security rules defined in `firestore.rules`
- Firebase Authentication handles all user sessions securely
- `.gitignore` covers all sensitive config files

---

⭐ If you like this project, don't forget to **star the repo!**
