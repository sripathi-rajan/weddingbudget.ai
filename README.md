# 💍 WeddingBudget.AI

[![React](https://img.shields.io/badge/Frontend-React%2018-blue?logo=react)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green?logo=fastapi)](https://fastapi.tiangolo.com/)
[![ML](https://img.shields.io/badge/AI-Scikit--learn%20%2B%20MobileNetV2-orange?logo=scikit-learn)](https://scikit-learn.org/)
[![PWA](https://img.shields.io/badge/PWA-Ready-9cf?logo=pwa)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-brightgreen)](LICENSE)

**WeddingBudget.AI** is a premium, AI-powered wedding planning and budget orchestration platform. It leverages Machine Learning and Reinforcement Learning to provide hyper-personalized cost predictions across decoration, catering, venues, and logistics, specifically tailored for the diverse landscape of Indian weddings.

---

## Key Features

### 🧠 Intelligent Budget Orchestration
- **AI Decor Predictor**: Uses computer vision (MobileNetV2) and custom ML models to predict decor costs based on complexity and style.
- **RL Budget Agent**: A Reinforcement Learning agent that learns from user interactions and historical data to optimize budget allocations.
- **Auto-Labeling Pipeline**: Automated data pipeline that scrapes and labels images using KMeans clustering to continuously improve model accuracy.

### 🎨 Premium Planning Experience
- **Multi-Step Wizard**: A sleek, animated 8-step journey (`Framer Motion`) from style selection to final budget analysis.
- **Dynamic Scenario Comparison**: Compare "Budget", "Balanced", and "Luxury" scenarios in real-time.
- **WhatsApp Integration**: Finalize your plan and instantly share the detailed breakdown via WhatsApp.

### 🛠️ Enterprise-Grade Admin Panel
- **Budget Tracker**: Monitor finalized plans and user submissions.
- **Data Management**: Seed and manage datasets for venues, food categories, and artistic services.
- **System Health**: Real-time monitoring of ML model status and backend connectivity.

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 with [Vite](https://vitejs.dev/)
- **Styling**: Vanilla CSS (Premium Design System)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **State Management**: React Context API
- **Features**: Progressive Web App (PWA) support

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Python)
- **Database**: SQLAlchemy with SQLite (Dev) / PostgreSQL (Prod)
- **Migrations**: Alembic
- **Task Processing**: Integrated lifespan handlers for ML initialization

### Machine Learning
- **Computer Vision**: MobileNetV2 for feature extraction
- **Clustering**: KMeans for automated image labeling
- **Optimization**: Reinforcement Learning (Q-Learning/State-based) for budget balancing
- **Processing**: Scikit-Learn, NumPy, Pandas

---

## 🛠️ Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### 1. Backend Setup
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python main.py
```
*The backend will automatically initialize the database and seed initial data.*

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*The application will be available at `http://localhost:3000`.*

---

## 📂 Project Structure

```text
├── backend/
│   ├── ml/             # ML Models, RL Agent, and Auto-labeling scripts
│   ├── models/         # SQLAlchemy Database Models
│   ├── routers/        # FastAPI API Endpoints
│   ├── seed_data.py    # Initial database population
│   └── main.py         # Application Entry & Lifespan Logic
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── context/    # Wedding Planning State (Context API)
│   │   └── pages/      # Step-by-step Wizard Tabs (Tab1Style to Tab8Budget)
├── data/               # Raw and processed datasets
└── decor_dataset/      # Image repository for Decor AI training
```

---

## 📈 ML Pipeline Overview

1. **Scraping & Import**: Images are imported into the `decor_dataset`.
2. **Auto-Labeling**: MobileNetV2 extracts features -> KMeans clusters images -> Labels are generated automatically if < 200 samples exist.
3. **Training**: A Gradient Boosting or similar regressor is trained on the labeled features.
4. **Inference**: High-speed cost prediction based on user-selected styles and complexity values.

---

## 🌍 Deployment

The project is configured for seamless deployment:
- **Frontend**: Optimised for [Vercel](https://vercel.com/) or Netlify.
- **Backend**: Configured for [Render](https://render.com/) via `render.yaml`.
- **Environment**: Ensure `DATABASE_URL` and `CORS_ORIGINS` are set in production.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">Made with ❤️ for the perfect wedding day.</p>
