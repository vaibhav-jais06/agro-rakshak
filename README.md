<div align="center">
  <img src="https://img.shields.io/badge/Smart_India_Hackathon-2026-orange?style=for-the-badge&logo=hackaday" alt="SIH 2026" />
  
  <h1>🌱 Agro-Rakshak 🛡️</h1>
  
  <p><b>Empowering Farmers with AI-Driven Intelligence & Multilingual Voice Assistance</b></p>
  
  <p>
    <a href="#-overview">Overview</a> •
    <a href="#-key-features">Features</a> •
    <a href="#-technology-stack">Tech Stack</a> •
    <a href="#-quick-start">Quick Start</a>
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
- 🐄 **Livestock Management**: Monitor livestock health, view historical farm records, and get actionable AI-powered advisory services.
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
| **AI/ML Integration** | Groq SDK for lightning-fast, intelligent predictions |
| **Infrastructure** | Vercel Serverless Deployment, PWA Ready (Works offline and installs natively) |

---

## ⚡ Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/vaibhav-jais06/agro-rakshak.git
cd agro-rakshak
```

### 2. Install Dependencies
```bash
# Install frontend and backend dependencies
npm install
cd backend && npm install && cd ..
```

### 3. Environment Variables
Create a `.env` file in the `/backend` directory to connect your application:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
```

### 4. Required Permissions
For the platform's full functionality to work correctly, please ensure you allow the following permissions when prompted on web or mobile:
- 📍 **Location**: Required for the Weather Intelligence System to provide localized weather updates.
- 🎤 **Microphone**: Required for the AI Voice Assistant to enable hands-free interactions.
- 🔊 **Speakers/Audio**: Required for the Voice Assistant Text-to-Speech output.
- 📷 **Camera**: Required for the Pesticide Predictor's live preview and disease diagnosis.

---

## 🔑 Test Accounts
Use the following credentials to explore the platform:
- **Admin**: `admin` / `admin`
- **User**: `user` / `user`

---

<div align="center">
  <p>Built with ❤️ for the <b>Smart India Hackathon</b>.</p>
</div>
