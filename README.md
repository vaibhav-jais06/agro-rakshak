<div align="center">
  <img src="https://img.shields.io/badge/Smart_India_Hackathon-2026-orange?style=for-the-badge&logo=hackaday" alt="SIH 2026" />
  
  <h1>🌱 Agro-Rakshak 🛡️</h1>
  
  <p><b>Empowering Farmers with AI-Driven Intelligence & Multilingual Voice Assistance</b></p>
  
  <p>
    <a href="#-overview">Overview</a> •
    <a href="#-key-features">Features</a> •
    <a href="#-technology-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-environment-variables">Environment Setup</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel Deployment" />
  </p>

  <h3>🚀 <a href="https://agro-rakshak.vercel.app" target="_blank">Live Demo: agro-rakshak.vercel.app</a></h3>
</div>

<br/>

## 📖 Overview

**Agro-Rakshak** (meaning *"Agricultural Protector"*) is an end-to-end, multilingual platform designed to enhance farmer productivity. By leveraging modern AI and data analytics, Agro-Rakshak provides hyper-personalized, actionable insights to farmers exactly when they need them. 

### 💡 The Problem We Solve
Farmers often lack real-time, actionable insights tailored to their specific soil conditions and local weather. Agro-Rakshak bridges this gap by democratizing access to expert-level agricultural guidance, minimizing crop failure risks, and maximizing yield potential.

---

## ✨ Key Features

- 🎙️ **Multilingual Voice Assistant**: An AI-powered voice assistant capable of listening, understanding, and speaking to farmers in their native languages. Returns clean, beautifully formatted agricultural advice.
- 🌤️ **Weather Intelligence System**: Real-time localized weather updates and smart crop-specific alerts based on upcoming conditions.
- 🌾 **Crop Recommendations**: AI-driven crop selection based on soil health parameters, weather patterns, and market demand.
- 🐛 **Pesticide Predictor**: Intelligent diagnosis of crop diseases with highly accurate, targeted pesticide recommendations via image analysis.
- 📊 **Soil Health Dashboard**: Upload, visualize, and track soil testing results over time to optimize fertilizer usage.
- 🛒 **Agri Shop Integration**: A dedicated marketplace connecting farmers directly with reliable agricultural input suppliers.
- 🌍 **Multilingual Support**: Fully localized in English, Hindi, Bengali, Tamil, and Telugu to reach farmers across India.
- 📚 **Knowledge Hub**: An accessible, rich library of farming best practices, post-harvest storage guides, and success stories.

---

## 🛠️ Technology Stack

| Category | Technologies |
| --- | --- |
| **Frontend** | React.js, Tailwind CSS, Capacitor (for cross-platform mobile support), React-I18next |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB |
| **AI/ML Integration** | Google Gemini AI API, Groq SDK for smart predictions |
| **Infrastructure** | Vercel Serverless Deployment, PWA Ready (Works offline and installs natively) |

---

## 🚀 Getting Started

Follow these instructions to set up the project locally for development, testing, or internal evaluation.

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [npm](https://npmjs.com/) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/vaibhav-jais06/agro-rakshak.git
cd agro-rakshak
```

### 2. Install Dependencies
Install the dependencies for both the frontend and the backend.

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 3. Environment Variables

You will need to set up environment variables for both the frontend and backend.

#### Backend `.env`
Create a `.env` file in the `/backend` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key
```

#### Frontend `.env`
Create a `.env` file in the root directory:
```env
REACT_APP_API_BASE=http://localhost:5000
```

### 4. Run the Application

You can start both the frontend and backend simultaneously using the provided batch script (Windows) or start them manually.

#### Manual Startup
```bash
# Terminal 1: Start Backend
cd backend
npm start

# Terminal 2: Start Frontend
npm start
```
The React frontend will be running locally at `http://localhost:3000` and the Express API at `http://localhost:5000`.

### 5. Enable Permissions
For the platform's full functionality to work correctly in your browser or mobile device, please ensure you allow the following permissions when prompted:
- 📍 **Location**: Required for the Weather Intelligence System to provide localized weather updates.
- 🎤 **Microphone**: Required for the AI Voice Assistant to enable hands-free interactions.
- 🔊 **Speakers/Audio**: Required for the Voice Assistant Text-to-Speech output.
- 📷 **Camera**: Required for the Pesticide Predictor's live preview and disease diagnosis.

---

<div align="center">
  <p>Built with ❤️ for the <b>Smart India Hackathon</b>.</p>
</div>
