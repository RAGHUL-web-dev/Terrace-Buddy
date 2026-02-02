# Terrace Buddy - Urban Gardening Platform

Terrace Buddy is a comprehensive web application designed to help urban dwellers transform their terraces and balconies into thriving green spaces. It connects gardeners, provides AI-powered plant tracking, and offers a marketplace for exchanging local produce and gardening supplies.

## 🌟 Features

- **Smart Plant Tracking**: Monitor plant growth, set watering reminders, and maintain a photo timeline with AI insights.
- **Vibrant Community**: Real-time chat, specialized groups (Vegetable Growers, Flower Lovers), and expert advice.
- **Local Marketplace**: Buy, sell, or exchange plants, seeds, and tools with gardeners in your neighborhood.
- **Expert Knowledge Hub**: Access over 1000+ guides, seasonal tips, and FAQs.
- **Weather Intelligence**: Real-time weather alerts and seasonal recommendations based on your location.
- **AI Garden Assistant**: 24/7 chatbot support for plant diagnosis and care tips.

## 🛠️ Tech Stack

### Frontend
- **HTML5 & CSS3**: Semantic markup with modern styling.
- **Tailwind CSS**: Utility-first CSS framework for responsive design.
- **JavaScript (Vanilla)**: Dynamic client-side logic.
- **FontAwesome**: Iconography.

### Backend
- **Node.js & Express**: robust server-side runtime and framework.
- **MongoDB**: NoSQL database for flexible data storage.
- **Mongoose**: ODM for MongoDB.
- **Socket.io**: Real-time bidirectional communication for chat features.
- **JWT (JSON Web Tokens)**: Secure authentication.
- **Multer**: Handling file uploads (images).

## 📂 Project Structure

```
jovin/
├── BACKEND/                # Server-side code
│   ├── config/             # Database & other configs
│   ├── controllers/        # Route logic
│   ├── models/             # Mongoose schemas
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic (Socket, Weather)
│   ├── uploads/            # User uploaded content
│   ├── server.js           # Entry point
│   └── package.json        # Backend dependencies
│
└── Frontend/               # Client-side code
    ├── css/                # Custom styles
    ├── js/                 # Client logic (API, Auth, Utils)
    ├── *.html              # Application pages
    └── index.html          # Landing page
```

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd BACKEND
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `BACKEND` directory with the following variables:
   ```env
   port=5000
   MONGODB_URI=mongodb://localhost:27017/terrace_buddy  # Or your Atlas URI
   JWT_SECRET=your_jwt_secret_key
   FRONTEND_URL=http://127.0.0.1:5500              # URL where frontend is running
   NODE_ENV=development
   ```

4. Seed the database (optional, for initial data):
   ```bash
   npm run seed
   ```

5. Start the server:
   ```bash
   npm start
   # or for development with nodemon:
   npm run dev
   ```

### Frontend Setup

1. The frontend is built with static HTML/JS and relies on a live server.
2. You can use the **Live Server** extension in VS Code or any static file server.
3. Open `Frontend/index.html` via the live server (default port is usually 5500).
4. Ensure the `FRONTEND_URL` in your backend `.env` matches your local frontend URL.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
