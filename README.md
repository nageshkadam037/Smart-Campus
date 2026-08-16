# Smart Campus 🎓

Smart Campus is a web-based campus management platform designed to help students stay organized and connected with academic activities. The application provides access to timetables, assignments, announcements, events, attendance tracking, and notification services in a single dashboard.

## ✨ Features

### Student Dashboard

* View daily and weekly class timetables
* Track assignments and submission deadlines
* Access campus announcements
* View upcoming events and activities
* Monitor attendance and academic performance

### Notifications

* Real-time push notifications
* Important academic updates
* Assignment reminders
* Event alerts

### Campus Management

* Event management system
* Announcement distribution
* Academic scheduling
* Student information management

### Modern UI

* Responsive design
* Mobile-friendly interface
* Fast and lightweight experience
* Clean and intuitive dashboard

---

## 🛠️ Tech Stack

### Frontend

* React 19
* TypeScript
* Vite
* Tailwind CSS
* Motion Animations

### Backend

* Node.js
* Express.js

### Database & Services

* Firebase
* Supabase
* Web Push Notifications

### Additional Tools

* Google Gemini AI
* CropperJS

---

## 📂 Project Structure

```bash
smart-campus/
│
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── public/
│
├── server.ts
├── package.json
├── firebase-applet-config.json
├── firestore.rules
├── vapid.json
└── vite.config.ts
```

---

## 🚀 Installation

### Prerequisites

* Node.js (v18 or higher)
* npm

### Clone Repository

```bash
git clone https://github.com/your-username/smart-campus.git
cd smart-campus
```

### Install Dependencies

```bash
npm install
```

### Configure Environment

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key
```

Configure Firebase credentials as required.

### Run Development Server

```bash
npm run dev
```

Application will start on:

```bash
http://localhost:3000
```

---

## 📦 Build for Production

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

## 🔔 Push Notifications Setup

Generate VAPID keys and create:

```bash
vapid.json
```

Example:

```json
{
  "publicKey": "YOUR_PUBLIC_KEY",
  "privateKey": "YOUR_PRIVATE_KEY"
}
```

---

## 🎯 Future Enhancements

* Student authentication system
* Faculty dashboard
* Attendance analytics
* Exam result management
* AI-powered student assistant
* Placement and internship portal
* Notes and study material sharing
* QR-based attendance system

---

## 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to your branch
5. Open a Pull Request

---

## 👨‍💻 Team

Developed as a Smart Campus Management Solution to simplify communication and academic management within educational institutions.

