# Spur AI Live Chat Agent

> A mini AI support agent for live chat - Built for Spur Founding Full-Stack Engineer Take-Home Assignment

A full-stack web application that simulates a customer support chat where an AI agent answers user questions using Google's Gemini AI API. The application features conversation persistence, context-aware responses, and a modern chat widget UI.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [API Documentation](#api-documentation)
- [Architecture Overview](#architecture-overview)
- [LLM Integration](#llm-integration)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Trade-offs & Future Improvements](#trade-offs--future-improvements)

## Features

- **Real-time AI Chat**: Interactive chat interface with AI-powered responses using Google Gemini
- **Conversation Persistence**: All messages are stored in PostgreSQL and can be retrieved across sessions
- **Session Management**: Automatic session creation and tracking using localStorage
- **Context-Aware Responses**: AI maintains conversation history for contextual replies
- **Modern UI/UX**:
  - Floating chat widget with smooth animations
  - Auto-scroll to latest messages
  - Typing indicators while AI is responding
  - Disabled send button during message processing
  - Clear visual distinction between user and AI messages
- **Input Validation**: Empty message prevention, error handling for network failures
- **Domain Knowledge**: Pre-seeded with e-commerce store policies (shipping, returns, support hours)
- **Robust Error Handling**: Graceful degradation with user-friendly error messages

## Tech Stack

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **LLM Provider**: Google Gemini 2.5 Flash via `@google/genai`
- **Environment Management**: dotenv

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **State Management**: React Hooks (useState, useEffect)

### Development Tools
- **TypeScript**: Type safety across the stack
- **Nodemon**: Backend hot-reloading
- **ESLint**: Code linting
- **Prisma**: Database migrations and type-safe ORM

## Project Structure

```
Spur/
├── client/                 # React frontend
│   ├── src/
│   │   ├── App.tsx        # Main chat widget component
│   │   ├── api.ts         # API client for backend communication
│   │   ├── main.tsx       # React entry point
│   │   └── index.css      # Global styles
│   ├── package.json
│   └── vite.config.ts
│
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/
│   │   │   └── chatController.ts    # Request handlers
│   │   ├── routes/
│   │   │   └── chatRoutes.ts        # API route definitions
│   │   ├── services/
│   │   │   └── chatService.ts       # LLM integration & business logic
│   │   ├── index.ts                 # Express app & server setup
│   │   └── prisma.ts                # Prisma client instance
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema
│   │   └── migrations/              # Database migrations
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Google Gemini API Key** ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/immohitsen/LiveChatBot
   cd Spur
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

### Database Setup

1. **Create a PostgreSQL database**
   ```bash
   # Using psql or your preferred PostgreSQL client
   createdb spur_chat
   ```

2. **Configure database connection**

   Create a `.env` file in the `server/` directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/spur_chat"
   GEMINI_API_KEY="your_gemini_api_key_here"
   PORT=3000
   ```

   Replace `username`, `password`, and the database name as needed.

3. **Run database migrations**
   ```bash
   cd server
   npx prisma migrate dev --name init
   ```

   This will:
   - Create the database tables (`conversations`, `messages`)
   - Generate the Prisma Client for type-safe database queries

4. **Verify database setup** (optional)
   ```bash
   npx prisma studio
   ```
   This opens a GUI to browse your database at `http://localhost:5555`

### Environment Variables

#### Backend (`server/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/spur_chat` |
| `GEMINI_API_KEY` | Google Gemini API key | `AIza...` |
| `PORT` | Server port (optional) | `3000` |

#### Frontend (`client/.env`)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `http://localhost:3000/api/chat` |

For production deployment, update `VITE_API_URL` to your deployed backend URL.

### Running Locally

1. **Start the backend server**
   ```bash
   cd server
   npm run dev
   ```
   Server runs at `http://localhost:3000`

2. **Start the frontend** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```
   Frontend runs at `http://localhost:5173`

3. **Open your browser**

   Navigate to `http://localhost:5173` and click the blue chat button to start chatting!

## API Documentation

### Base URL
```
http://localhost:3000/api/chat
```

### Endpoints

#### 1. Send Message
**POST** `/message`

Send a user message and receive an AI response.

**Request Body:**
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-uuid-string"
}
```

**Response:**
```json
{
  "reply": "We offer a 30-day return policy. Customers are responsible for return shipping costs.",
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Responses:**
- `400 Bad Request` - Empty message
- `500 Internal Server Error` - LLM API failure or database error

---

#### 2. Get Conversation History
**GET** `/history/:sessionId`

Retrieve all messages from a specific conversation.

**Response:**
```json
[
  {
    "id": "msg-uuid-1",
    "text": "Do you ship to USA?",
    "sender": "user"
  },
  {
    "id": "msg-uuid-2",
    "text": "Yes! We ship to USA, Canada, and UK. Free shipping on orders over $50.",
    "sender": "ai"
  }
]
```

## Architecture Overview

### Backend Architecture

The backend follows a **layered architecture** with clear separation of concerns:

```
Routes → Controllers → Services → Database
```

1. **Routes Layer** (`chatRoutes.ts`)
   - Defines API endpoints
   - Maps HTTP requests to controller functions

2. **Controllers Layer** (`chatController.ts`)
   - Handles request/response parsing
   - Orchestrates service calls
   - Error handling and HTTP status codes

3. **Services Layer** (`chatService.ts`)
   - Core business logic
   - LLM API integration
   - Message validation
   - Session management
   - Database operations

4. **Data Layer** (Prisma ORM)
   - Type-safe database queries
   - Schema management
   - Migrations

**Design Decisions:**
- **Prisma ORM**: Chosen for type safety, excellent TypeScript support, and simplified migrations
- **Service Encapsulation**: LLM integration is abstracted into `handleChat()`, making it easy to swap providers (OpenAI, Claude, etc.) by modifying just one function
- **UUID Session IDs**: More secure and scalable than auto-incrementing integers
- **Context Window Limiting**: Only the last 10 messages are sent to the LLM to control costs and token usage

### Frontend Architecture

The frontend is a **component-based React application**:

- **State Management**: React hooks for local state (`useState`, `useEffect`)
- **API Communication**: Centralized in `api.ts` for reusability
- **Session Persistence**: Uses `localStorage` to maintain sessions across page reloads
- **Auto-scroll**: Implemented with `useRef` and `scrollIntoView`
- **Loading States**: Prevents double-sends and shows typing indicator

## LLM Integration

### Provider: Google Gemini

- **Model**: `gemini-2.5-flash`
- **SDK**: `@google/genai` (v1.34.0)

### Why Gemini?

- **Fast Response Times**: Ideal for real-time chat
- **Cost-Effective**: Generous free tier
- **Strong Context Understanding**: Handles multi-turn conversations well

### Prompt Engineering

**System Instruction:**
```
You are a helpful customer support agent for "SpurStore".
- Shipping: We ship to USA, Canada, and UK. Free shipping over $50.
- Returns: 30-day return policy. Customer pays return shipping.
- Support Hours: Mon-Fri, 9am - 5pm EST.
- Tone: Professional, concise, and friendly. Do not use markdown formatting.
```

**Context Handling:**
- The last 10 messages from the conversation are included in the API call
- Messages are formatted as alternating `user` and `model` roles
- System instruction ensures consistent brand voice

### Error Handling
- **Invalid API Key**: Returns user-friendly error message
- **Rate Limiting**: Caught and displayed to user
- **Timeouts**: Backend handles and returns fallback message
- **Network Errors**: Frontend displays alert prompting user to check backend

## Database Schema

### Tables

#### `Conversation`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique conversation ID |
| `createdAt` | DateTime | Timestamp of creation |

#### `Message`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Unique message ID |
| `content` | String | Message text |
| `role` | Enum (`USER` \| `ASSISTANT`) | Sender type |
| `conversationId` | UUID (FK) | References `Conversation.id` |
| `createdAt` | DateTime | Timestamp of message |

### Schema Diagram
```
Conversation (1) ──────< (Many) Message
     id                      id
     createdAt               content
                             role
                             conversationId
                             createdAt
```

## Deployment

### Backend Deployment (Render, Railway, etc.)

1. **Build the TypeScript code**
   ```bash
   npm run build
   ```

2. **Set environment variables** on your hosting platform:
   - `DATABASE_URL`
   - `GEMINI_API_KEY`
   - `PORT` (usually auto-assigned)

3. **Run migrations** (one-time setup)
   ```bash
   npx prisma migrate deploy
   ```

4. **Start the production server**
   ```bash
   npm start
   ```

### Frontend Deployment (Vercel, Netlify)

1. **Update environment variable**
   ```env
   VITE_API_URL=https://your-backend-url.com/api/chat
   ```

2. **Build for production**
   ```bash
   npm run build
   ```

3. **Deploy** the `dist/` folder to your hosting platform

## Trade-offs & Future Improvements

### Trade-offs Made

1. **No Authentication**
   - Simplified for demo purposes
   - In production: Add user auth (JWT, OAuth) to prevent abuse

2. **LocalStorage for Sessions**
   - Quick and simple
   - Better approach: Server-managed sessions with cookies/tokens

3. **Limited Context Window (10 messages)**
   - Reduces API costs
   - Could be increased for better context in long conversations

4. **No Rate Limiting**
   - Current implementation allows unlimited requests
   - Production needs: IP-based rate limiting, per-user quotas

5. **Single LLM Provider**
   - Currently only supports Gemini
   - Future: Provider abstraction layer to support OpenAI, Claude, etc.

### If I Had More Time...

#### Backend Enhancements
- **Rate Limiting**: Implement `express-rate-limit` to prevent abuse
- **Caching**: Use Redis to cache frequent queries (e.g., FAQ responses)
- **Streaming Responses**: Implement Server-Sent Events (SSE) for token-by-token streaming
- **Multi-Provider Support**: Abstract LLM calls to easily switch between OpenAI, Claude, Gemini
- **Better Logging**: Structured logging with Winston/Pino for debugging and monitoring
- **Unit Tests**: Jest/Vitest for service layer and API endpoints

#### Frontend Enhancements
- **Markdown Support**: Render formatted AI responses with code blocks, lists
- **File Uploads**: Allow users to send images/documents
- **Voice Input**: Speech-to-text for accessibility
- **Internationalization**: Multi-language support
- **Dark Mode**: Theme toggle for better UX
- **Message Reactions**: Quick feedback (thumbs up/down)
- **Offline Support**: Queue messages when backend is unreachable

#### Infrastructure
- **Docker Compose**: One-command local setup with DB
- **CI/CD Pipeline**: Automated testing and deployment
- **Monitoring**: Add Sentry for error tracking, Prometheus for metrics
- **Database Backups**: Automated daily backups for PostgreSQL

#### Product Features
- **Human Handoff**: Escalate to live agent when AI can't help
- **Analytics Dashboard**: Track conversation metrics, common queries
- **A/B Testing**: Test different prompts to improve AI responses
- **Sentiment Analysis**: Detect frustrated users and prioritize support

---

## License

This project is part of a take-home assignment for Spur and is for demonstration purposes only.

---

**Built with care by Mohit Sen for the Spur Founding Engineer Take-Home Assignment**

For questions or issues, please contact: [senmohit9005@gmail.com]
