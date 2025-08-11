<div align="center">

# 🥷 Vigilant Neon API

**Real‑time Pub/Sub topic management with REST & WebSocket**  
*Powered by Bun + TypeScript + Modern Architecture*

[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/postgresql-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

*Lightning-fast • Type-safe • Production-ready*

</div>

---

## ✨ Overview

**Vigilant Neon API** is a cutting-edge, high-performance real-time messaging system built on Bun runtime. Designed for modern applications that demand instant communication, robust authentication, and seamless scalability.

### 🚀 Key Features

| Feature | Description |
|---------|-------------|
| ⚡ **Real-time Communication** | WebSocket support for instant, bi-directional messaging |
| 🔗 **Complete REST API** | Full HTTP API for topic and user management |
| 🔐 **Secure Authentication** | JWT-based auth with API key management |
| 🔄 **Topic Sharing** | Generate shareable links with unique IDs |
| 🗄️ **PostgreSQL Integration** | Robust data persistence with Drizzle ORM |
| 🐳 **Docker Ready** | Containerized deployment with Docker Compose |
| 🛡️ **Type Safety** | 100% TypeScript implementation |
| 🔥 **High Performance** | Built on Bun for maximum speed |

---

## 🚀 Quick Start

### 📋 Prerequisites

- [**Bun**](https://bun.sh/) runtime (latest)
- **PostgreSQL** database
- **Docker** & Docker Compose (optional)

### ⚙️ Installation

<details open>
<summary><strong>Step-by-step setup</strong></summary>

#### 1️⃣ **Clone & Navigate**
```bash
git clone <repository-url>
cd vigilant-neon-api
```

#### 2️⃣ **Install Dependencies**
```bash
bun install
```

#### 3️⃣ **Environment Setup**
```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

> 💡 **Tip:** Check the [Environment Configuration](#-environment-configuration) section for details.

#### 4️⃣ **Database Setup (Docker)**
```bash
# Create shared network (first time only)
docker network create shared_network

# Start PostgreSQL & pgAdmin
docker-compose up -d
```

#### 5️⃣ **Database Migration**
```bash
# Generate migration files
bunx --bun drizzle-kit generate

# Apply migrations to database  
bunx --bun drizzle-kit push
```

#### 6️⃣ **Start Development Server**
```bash
# Start with hot reload 🔥
bun --watch run index.ts
```

🎉 **Your API is now running at** `http://localhost:3000`

</details>

---

## 📡 API Reference

### 🔐 Authentication Endpoints

<details>
<summary><strong>Authentication & API Keys</strong></summary>

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

#### API Key Management
```http
POST /api/auth/apikey        # Create new API key
GET /api/auth/apikey         # List user API keys  
DELETE /api/auth/apikey/:id  # Delete specific API key
```

</details>

### 📢 Pub/Sub Topics

<details>
<summary><strong>Topic Management</strong></summary>

#### Core Operations
```http
POST /api/pubsub         # Create new topic
GET /api/pubsub          # List user topics
DELETE /api/pubsub       # Delete user topics
GET /api/pubsub/:id      # Get specific topic
```

#### Topic Sharing
```http
GET /api/pubsub/:id/share        # Generate shareable link
GET /api/pubsub/shared/:sharedId # Access shared topic (public)
```

</details>

### 🔧 System Endpoints

#### Health & Status
```http
GET /api/ping    # Returns "pong" - Health check
GET /            # API information & status
```

---

## 🌐 WebSocket Connection

Connect to WebSocket for real-time, bi-directional communication:

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3000');

// Connection opened
ws.onopen = () => {
    console.log('🔗 Connected to Vigilant Neon API');
    
    // Send a message
    ws.send(JSON.stringify({
        type: 'subscribe',
        topicId: 'your-topic-id'
    }));
};

// Receive messages
ws.onmessage = (event) => {
    const message = JSON.parse(event.data);
    console.log('📨 Received:', message);
};

// Connection closed
ws.onclose = () => {
    console.log('🔌 Disconnected from API');
};

// Error handling
ws.onerror = (error) => {
    console.error('❌ WebSocket error:', error);
};
```

---

## 🛠️ Development Commands

### 🗄️ Database Operations
```bash
# Generate new migration
bunx --bun drizzle-kit generate

# Apply migrations to database
bunx --bun drizzle-kit push

# View current migration status
bunx --bun drizzle-kit check
```

### 🔥 Development Server
```bash
# Start with hot reload
bun --watch run index.ts

# Start in production mode
bun run index.ts
```

### 🐳 Docker Operations
```bash
# Create shared network (first time only)
docker network create shared_network

# Start all services
docker-compose up -d

# View logs in real-time
docker-compose logs -f

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# Remove volumes (⚠️ destroys data)
docker-compose down -v
```

### 🔍 Database Management
Access pgAdmin at `http://localhost:54321`
- **Email:** `admin@admin.com`
- **Password:** `admin`

---

## 📁 Project Architecture

```
📦 vigilant-neon-api/
├── 📂 src/
│   ├── 🔐 auth/           # Authentication logic & JWT handling
│   ├── 📊 constants/      # Application constants & configuration
│   ├── 🗄️ db/            # Database models & connection management
│   ├── 📡 pubsub/        # Pub/Sub topic management & logic
│   ├── 🌐 server/        # HTTP & WebSocket server implementations
│   └── 🛠️ utils.ts       # Utility functions & helpers
├── 📂 drizzle/           # Database migrations & schema snapshots
├── 🐳 docker-compose.yml # Docker services configuration
├── ⚙️ drizzle.config.ts  # Drizzle ORM configuration
├── 🚀 index.ts          # Application entry point & bootstrap
├── 📋 .env.example      # Environment variables template
└── 📚 README.md         # You are here!
```

---

## 🗄️ Database Schema

### Core Models

| Model | Description | Key Fields |
|-------|-------------|------------|
| **👥 Users** | User accounts with authentication | `username`, `hashedPassword`, `apiKey` |
| **📡 Publishers** | Message publishers | `name` |
| **👂 Subscribers** | Message subscribers | `name` |
| **📢 Topics** | Pub/Sub topics with content | `publisherId`, `subscriberId`, `content`, `sharedId` |

#### Shared Model Features
All models automatically include:
- 🆔 `id` (UUID primary key)
- ⏰ `createdAt`, `updatedAt` (automatic timestamps)
- 🗑️ `deletedAt` (soft delete support)

---

## 🔧 Environment Configuration

### 📝 Setup Instructions

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit your configuration:**
   ```bash
   nano .env  # or use your favorite editor
   ```

3. **Required Variables:**

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `DATABASE_HOST` | PostgreSQL host | `localhost` |
| `DATABASE_USER` | Database username | `admin` |
| `DATABASE_PASS` | Database password | `admin123` |
| `DATABASE_NAME` | Database name | `pubsub` |
| `DATABASE_PORT` | Database port | `5432` |
| `USERNAME` | Admin username | `opisylacti` |
| `PASSWORD` | Admin password | `your_secure_password` |
| `ORIGIN_URL` | Frontend URL for CORS | `http://localhost:5173` |

4. **JWT Configuration:**
Generate your own JWT keys for security:
```bash
# Generate private key
openssl genrsa -out private-key.pem 2048

# Generate public key  
openssl rsa -in private-key.pem -pubout -out public-key.pem
```

### 🔐 Security Best Practices

- 🚨 **Never commit** your actual `.env` file
- 🔑 **Generate unique JWT keys** for each environment
- 🔒 **Use strong passwords** (minimum 12 characters)
- 🌐 **Set appropriate ORIGIN_URL** for CORS
- 🛡️ **Rotate API keys** regularly in production

---

## 🚀 Deployment

### 🐳 Docker Deployment

<details>
<summary><strong>Production Docker Setup</strong></summary>

#### Build & Deploy
```bash
# Build production image
docker build -t vigilant-neon-api .

# Run with Docker Compose
docker-compose up -d

# Scale the application (if needed)
docker-compose up -d --scale app=3
```

#### Health Monitoring
```bash
# Check container status
docker ps

# Monitor logs
docker-compose logs -f app

# Check resource usage
docker stats
```

</details>

### 🌐 Production Setup Checklist

- [ ] ⚙️ Set production environment variables
- [ ] 🗄️ Run database migrations
- [ ] 🚀 Start the application
- [ ] 🔀 Configure reverse proxy (nginx/caddy)
- [ ] 🔒 Set up SSL certificates
- [ ] 📊 Configure monitoring & logging
- [ ] 🔧 Set up health checks
- [ ] 📱 Configure alerting

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 🔄 Development Workflow

1. **🍴 Fork** the repository
2. **🌿 Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **✨ Make** your changes
4. **🧪 Test** your changes thoroughly
5. **📝 Commit** your changes (`git commit -m 'Add amazing feature'`)
6. **🚀 Push** to the branch (`git push origin feature/amazing-feature`)
7. **🔃 Open** a Pull Request

### 📋 Code Standards

- ✅ Follow TypeScript best practices
- 🧪 Write tests for new features
- 📚 Document your changes
- 🎨 Follow existing code style
- 🔍 Run linting before committing

---

## 📄 License

This project is **open to anyone** under the MIT License.

---

<div align="center">

### 💫 Built with Love

**🔥 Bun** • **📘 TypeScript** • **🐘 PostgreSQL** • **🌐 Modern Web Technologies**

---

*For questions, support, or collaborations:*  
**[👨‍💻 github.com/hjunior29](https://github.com/hjunior29)**

*Made with ❤️ by developers, for developers*

</div>