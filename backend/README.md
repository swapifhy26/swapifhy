# Swapifhy Backend

Backend service for **Swapifhy**, a production-grade peer-to-peer skill exchange platform.
Built with a scalable, modular architecture to handle authentication, user management, skill matching, and real-time interactions.

---

## 🚀 Tech Stack

* Runtime: Node.js
* Framework: Express.js
* Database: PostgreSQL
* ODM: pg
* Authentication: JWT (Access + Refresh Tokens)
* Security: Helmet, XSS-Clean, Mongo Sanitize
* Logging: Custom Logger / Morgan
* Deployment: Docker + GCP 

---

## 📦 Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/swapifhy-backend.git
cd swapifhy-backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
CLIENT_URL=http://localhost:3000
```

### 4. Run Development Server

```bash
npm run dev
```

Server runs at:

```
http://localhost:5000
```

---

## 🧠 Project Structure

```
backend/
├── controllers/        # Request handlers
├── models/             # Mongoose schemas
├── routes/             # API routes
├── middleware/         # Auth, error handling, validation
├── services/           # Business logic layer
├── utils/              # Helpers and utilities
├── config/             # DB, env, app config
├── app.js              # Express app setup
├── server.js           # Server initialization
```

---

## 🏗️ High-Level Architecture

```
Client (Frontend)
        ↓
API Gateway (Express Server)
        ↓
Middleware Layer (Auth, Validation, Security)
        ↓
Controllers
        ↓
Services (Business Logic)
        ↓
Database (PostgreSQL)
```

---

## 🔄 Request Lifecycle

```
Incoming Request
      ↓
Route Handler
      ↓
Middleware (Auth / Validation)
      ↓
Controller
      ↓
Service Layer (Business Logic)
      ↓
Database Operation
      ↓
Response Sent
```

---

## 🔐 Authentication Flow

* JWT-based authentication
* Access Token (short-lived)
* Refresh Token (long-lived)
* Secure token storage & validation

### Flow

```
Login Request
   ↓
Generate Access + Refresh Tokens
   ↓
Send to Client
   ↓
Client sends Access Token in headers
   ↓
If expired → Refresh Token API
```

---

## 📈 Key Features

* Modular MVC architecture
* Secure authentication system
* Role-based access control
* Input validation & sanitization
* Scalable API design
* Centralized error handling

---

## ⚡ Performance & Scalability

### Optimization

* Database indexing (MongoDB)
* Efficient query design
* Pagination for large datasets

### Scalability

* Stateless API design
* Horizontal scaling via containers
* Load balancer ready

---

## 🛡 Security Practices

* Helmet for HTTP headers
* XSS protection
* PostgreSQL query sanitization
* JWT validation
* Rate limiting (recommended)

---

## 🛠 Development Guidelines

* Keep controllers thin, logic in services
* Use async/await consistently
* Centralize error handling
* Validate all inputs
* Follow RESTful conventions

---

## 🚀 Build & Run (Production)

```bash
npm run build
npm start
```

---

## 🐳 Docker Support (Optional)

```bash
docker build -t swapifhy-backend .
docker run -p 5000:5000 swapifhy-backend
```

---

## 🌐 Deployment

Recommended:

* GCP (Compute Engine / Cloud Run)
* Dockerized deployment

Steps:

1. Build Docker image
2. Push to container registry
3. Deploy to cloud service
4. Configure environment variables

---

## 📊 Future Enhancements

* WebSocket integration (real-time chat)
* Redis caching layer
* Message queues (Kafka / RabbitMQ)
* Microservices architecture

---

## 📚 References

* Express Docs: [https://expressjs.com/](https://expressjs.com/)


---

## 🧩 Contribution

* Follow clean architecture
* Use proper commit messages
* PR-based workflow

---

## 📌 Notes

* Ensure MongoDB is running before starting server
* Keep secrets secure using environment variables
* Designed for production-grade scalability
