# Welcome to the AI-Powered Mock Test Platform!

This repository contains the complete source code for our innovative EdTech solution designed to help students prepare for their exams efficiently.

Our platform leverages Generative AI, real-time proctoring, and automated student engagement to create a comprehensive and secure exam preparation environment.

🎥 Watch the Demo Video: https://youtu.be/hE6SrvTJmYw (This is the Demo Video)

## 🌟 Key Features

### 💻 Frontend (React.js)
- **Interactive Dashboard**: Beautiful, responsive UI built with React, Tailwind CSS, and Framer Motion.
- **Smart Analytics**: Visualized progress and performance tracking using Recharts.
- **AI Face Proctoring**: Integrated face-api.js for real-time face detection and anti-cheat monitoring to ensure academic integrity during mock tests.
- **Multi-language Support**: Accessible to diverse students using i18next.

### ⚙️ Backend (Spring Boot 3)
- **Robust Architecture**: Built with Java 17, Spring Boot, Spring Security, and JWT authentication.
- **Generative AI**: Powered by Spring AI & Ollama to automatically generate smart questions, mock tests, and insights.
- **Automated Engagement (Twilio)**: Intelligent IVR Voice Calls & SMS notifications via Twilio to remind inactive students to take their tests.
- **Advanced Document Processing**:
  - PDFBox for PDF extraction
  - Apache POI for DOC/DOCX parsing
  - Tess4j for OCR on scanned materials
- **Real-time Communication**: WebSocket integration for live updates.

### 📱 Mobile App (Flutter)
- Companion cross‑platform mobile application (`examprep_flutter`) for students to practice on the go.

## 🛠️ Tech Stack

| Component | Technologies |
|-----------|----------------|
| Frontend  | React 19, Tailwind CSS, Framer Motion, Recharts, face-api.js |
| Backend   | Java 17, Spring Boot 3.2, Spring Security, Spring Data JPA, JWT |
| AI & ML   | Spring AI, Ollama, Tess4j (OCR) |
| Database  | MySQL |
| Communications | Twilio (SMS & Voice IVR), WebSockets |
| Mobile    | Flutter, Dart |

## 🚦 Project Flow & Architecture
- **User Authentication**: Students and admins log in securely via JWT authentication.
- **Material Ingestion**: Admins can upload PDFs, DOCX files, or images. The backend uses OCR and text extraction tools to read the content.
- **AI Generation**: Extracted text is processed by Ollama via Spring AI to dynamically generate mock test questions.
- **Taking the Test**: Students attempt tests on the React frontend or Flutter app. During the test, face‑api.js monitors the student for proctoring.
- **Analytics & Progress**: Scores are stored in MySQL, and the frontend displays personalized analytics and progress charts.
- **Smart Reminders**: A background cron job checks for student inactivity. If a student hasn't taken a test in 2 days, Twilio triggers an automated friendly IVR voice call to encourage practice.

## ⚙️ Setup Instructions
### Prerequisites
- Java 17+
- Node.js & npm
- Flutter SDK
- MySQL Database
- Ollama (running locally or remotely)
- Twilio Account

### 1. Backend Setup (Mocktest)
```bash
cd Mocktest
mvn clean install
mvn spring-boot:run
```
*(Make sure to update `application.properties` with your database credentials and Twilio tokens. Note: `application.properties` is intentionally ignored in version control for security.)*

### 2. Frontend Setup (mock)
```bash
cd mock
npm install
npm start
```

### 3. Mobile Setup (examprep_flutter)
```bash
cd examprep_flutter
flutter pub get
flutter run
```

---

*License: MIT*
