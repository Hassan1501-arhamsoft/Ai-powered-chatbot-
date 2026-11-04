# Project Information Guide

## 1. Project Overview

This project is a full-stack AI-powered chatbot application built with the MERN stack and enhanced with Retrieval-Augmented Generation (RAG), streaming responses, moderation, and domain-specific knowledge search.

The application has two main parts:

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + MongoDB + Mongoose
- AI Layer: OpenRouter API, OpenAI moderation, semantic embeddings, and hybrid search

The product supports two main conversation domains:

1. Portfolio / personal profile data
2. Stranger Things universe knowledge

The app allows a user to select a category, send a message, and receive a streamed AI response that is grounded in contextual knowledge and conversation history.

---

## 2. Business Goal

The system provides an interactive AI assistant that answers questions based on:

- user-specific portfolio content,
- conversation memory,
- and knowledge retrieved from indexed documents.

This makes it useful for:

- portfolio-based chatbot experiences,
- domain-specific assistants,
- AI-powered support or knowledge bots,
- conversational UX enhanced by RAG with streaming output.

---

## 3. Project Structure

```text
Advance-RAG-based-chatbot/
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── assets/
│   │   ├── features/
│   │   │   └── chat/
│   │   │       ├── components/
│   │   │       ├── pages/
│   │   │       └── services/
│   │   ├── routes/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── server/
│   ├── src/
│   │   ├── configs/
│   │   ├── controllers/
│   │   ├── custom/
│   │   ├── data/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   ├── package.json
│   └── docs/
│
├── prompt.md
├── RAG.md
├── Roadmap.md
├── Readme.md
└── ...
```

---

## 4. Core Technologies

### Frontend

- React 19
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- CORS + Helmet
- dotenv
- Nodemon

### AI and RAG Layer

- OpenRouter API
- OpenAI moderation API
- @xenova/transformers
- semantic chunking
- MongoDB vector search / hybrid retrieval
- token counting and summary logic

### Additional Utilities

- Safety validation
- conversation persistence
- streaming SSE response handling
- summary management based on token thresholds

---

## 5. Setup Instructions

## 5.1 Prerequisites

Before starting, ensure the following are installed:

- Node.js 18+
- MongoDB running locally or in Atlas
- npm
- A valid OpenRouter API key
- A valid MongoDB connection string

---

## 5.2 Environment Variables

Create a `.env` file in the `server` directory with values similar to:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/chatbot_db
OPENROUTER_API_KEY=your_openrouter_key
```

For the frontend, you may also need a browser-facing API base if used in the future, but the current app directly calls the backend from the browser at `http://localhost:5000`.

---

## 5.3 Install Dependencies

### Backend

```bash
cd server
npm install
```

### Frontend

```bash
cd client
npm install
```

---

## 5.4 Run the Project

### Start backend

```bash
cd server
npm run dev
```

### Start frontend

```bash
cd client
npm run dev
```

The frontend usually runs on:

- http://localhost:5173

The backend usually runs on:

- http://localhost:5000

---

## 6. Backend Architecture

The backend uses a modular structure focused on clear separation of concerns.

### Main files

#### `src/server.js`

This is the server bootstrap file.

Responsibilities:

- load environment variables,
- connect to MongoDB,
- create the HTTP server,
- start listening on the configured port.

#### `src/app.js`

This is the Express application configuration file.

Responsibilities:

- enable security middleware,
- configure CORS,
- parse JSON payloads,
- register API routes.

#### `src/routes/chat.routes.js`

Defines the route for chat requests.

```js
router.post("/", chatController);
```

#### `src/routes/conversation.routes.js`

Defines conversation endpoints for listing and loading previous chats.

#### `src/controllers/chat.controller.js`

This is the main business logic handler for chat interaction.

Responsibilities:

- validate input,
- run moderation checks,
- create or load a conversation,
- store the user message,
- summarize older messages when needed,
- fetch relevant context from the RAG layer,
- stream AI output back to the client.

#### `src/services/ai.service.js`

This file handles communication with the LLM via OpenRouter.

Key responsibilities:

- build a strict system prompt,
- attach domain context,
- send conversation messages,
- stream tokens to the client,
- support tool calling if the model decides to use it.

#### `src/services/rag.service.js`

This is the retrieval engine for the project.

Responsibilities:

- generate embeddings for queries,
- perform vector retrieval from MongoDB,
- perform text search,
- merge and rank results using RRF (Reciprocal Rank Fusion),
- optionally rerank candidates,
- return the best relevant context documents.

#### `src/services/tool.service.js`

This file contains tool definitions and live tool execution logic.

Example:

- GitHub stats tool

This allows the assistant to answer questions that require live external data.

---

## 7. Data Models

### `conversation.model.js`

Represents a chat session.

Fields:

- `title`: conversation title
- `category`: either `portfolio_data` or `stranger_things`
- `summary`: summary of older conversation context
- `summaryMessageCount`: number of messages already summarized
- timestamps

### `message.model.js`

Represents a single message in a conversation.

Fields:

- `conversationId`
- `role`: `user` or `assistant`
- `content`
- timestamps

### `knowledge.model.js`

Represents indexed knowledge chunks used by the retrieval pipeline.

Fields:

- `content`
- `embedding` (vector)
- `metadata` (source, category, chunk index, etc.)

---

## 8. Request Flow: Frontend to AI Response

### High-level flow

1. User selects a chat category in the frontend.
2. React UI renders the chat screen for that category.
3. User sends a prompt.
4. Frontend calls the backend `/api/chat` endpoint with:
   - `conversationId` (optional)
   - `message`
   - `category`
5. Backend validates and moderates the input.
6. If no conversation exists, one is created.
7. User message is stored in MongoDB.
8. The controller checks whether older messages should be summarized.
9. Relevant knowledge is retrieved using the RAG pipeline.
10. The AI service builds a domain-specific prompt.
11. The LLM streams the answer as Server-Sent Events (SSE).
12. The frontend reads the stream chunk by chunk and updates the message UI.
13. Final assistant response is stored in the database.

---

## 9. RAG Flow

This project uses an advanced retrieval pipeline.

### Document ingestion

Knowledge files are stored in:

- `server/src/data/personal_data.txt`
- `server/src/data/stranger_things.txt`

These files are processed into chunks, converted into embeddings, and stored in MongoDB.

### Embedding generation

The app uses Hugging Face models through `@xenova/transformers`.

The embedding function is used for:

- query embedding,
- semantic chunk generation,
- knowledge indexing.

### Retrieval pipeline

The retrieval pipeline in `rag.service.js` does the following:

- generates a vector embedding for the incoming query,
- performs vector search in MongoDB,
- performs text search in parallel,
- combines results with Reciprocal Rank Fusion (RRF),
- optionally reranks candidates using a cross-encoder model,
- returns the top relevant chunks.

### Why this matters

This allows the assistant to answer from specific source material rather than relying solely on general model knowledge.

---

## 10. Moderation and Guardrails

The backend includes input safety checks before generating a response.

### Validation

The `validateInput` utility checks whether the user input is safe and acceptable.

### Moderation

The system uses `moderateInput` to detect harmful or restricted content.

If flagged, the API returns an error instead of continuing.

This is essential for:

- preventing unsafe output,
- enforcing domain boundaries,
- aligning with responsible AI usage.

---

## 11. Conversation Summarization Logic

The app keeps a conversation summary to reduce context length while preserving important prior dialogue.

Flow:

- collect all messages in a conversation,
- count tokens for unsummarized messages,
- if the message count reaches a threshold, summarize older content,
- update the conversation summary and summary counter,
- continue with recent context plus summary.

This is a strong pattern for reducing prompt cost while maintaining continuity.

---

## 12. Frontend Architecture

### `client/src/App.jsx`

The app root simply renders the routing layer.

### `client/src/routes/AppRoutes.jsx`

Single route setup:

- `/` -> chat page

### `client/src/features/chat/pages/Chat.jsx`

Container for the chat experience.

### `client/src/features/chat/components/ChatBox.jsx`

This is the main React stateful component.

Responsibilities:

- load conversation list,
- load current conversation,
- switch categories,
- begin new chats,
- stream AI response updates,
- update localStorage with the active conversation ID.

### `client/src/features/chat/components/ChatInput.jsx`

The message input field and send button.

### `client/src/features/chat/services/chat.service.js`

This is the API client service used by the frontend.

Responsibilities:

- fetch conversation history,
- send user messages,
- parse Server-Sent Events from the backend,
- update UI state in real time.

---

## 13. Frontend to Backend Connection

The frontend uses `fetch` directly to hit:

```text
http://localhost:5000/api/chat
```

The user message is sent as JSON:

```json
{
  "conversationId": "...",
  "message": "hello",
  "category": "portfolio_data"
}
```

The backend streams events like:

- `init`
- `chunk`
- `done`
- `error`

The frontend listens to these events and appends content incrementally.

---

## 14. Key Coding Patterns and Design Notes

### 1. Event-stream response pattern

The application uses streaming responses instead of waiting for the full model output to complete. This creates more natural UX and perceived responsiveness.

### 2. Domain restriction pattern

The system is not a general-purpose assistant. It is restricted to a specific domain using a strong system prompt and logic checks.

### 3. RAG + summarization hybrid pattern

The app combines:

- recent message context,
- stored summary,
- retrieved documents,
- and domain-specific prompts.

This is a realistic production-friendly pattern.

### 4. Persistent conversation memory

User conversations are stored in MongoDB so the chat can resume later and retain context history.

---

## 15. Knowledge Seeding Scripts

The project includes scripts for seeding knowledge data into MongoDB.

### `src/utils/seedRag.js`

Seeds portfolio knowledge from `personal_data.txt`.

### `src/utils/seedStrangerThings.js`

Seeds Stranger Things knowledge from `stranger_things.txt`.

These scripts do the following:

- read the text file,
- clean it,
- split it into semantic chunks,
- generate embeddings,
- insert them into the `Knowledge` collection.

This is necessary before retrieval can work effectively.

---

## 16. Utility and Helper Modules

### `cleanText.js`

Removes noise and irregular formatting from text files before ingestion.

### `rrf.js`

Implements Reciprocal Rank Fusion for combining vector and keyword search ranking.

### `token.js`

Helps calculate token usage and manage conversation summarization thresholds.

### `response.js`

Standardizes HTTP success/error response payloads.

### `guardrail.js`

Contains safety validation logic.

### `context.js`

May be used to build contextual prompt payloads or message grouping logic.

---

## 17. Potential Strengths of the Project

- clean separation between frontend and backend,
- domain-oriented AI assistant design,
- conversation persistence,
- streaming UI,
- RAG-based retrieval,
- searchable knowledge base with semantic chunks,
- moderation and guardrails,
- summarization for long conversations,
- tool-based live data retrieval.

---

## 18. Possible Improvements for Production Readiness

This project is solid for a prototype or learning project, but for production the following would be valuable:

- centralized environment validation,
- real authentication/authorization,
- request validation using Joi or Zod,
- structured logging and metrics,
- better error handling and retry policies,
- more robust API versioning,
- separate service layer for AI orchestration and business logic,
- database indexing strategy for larger datasets,
- background jobs for ingestion and knowledge updates,
- rate limiting and security controls,
- front-end state management for larger-scale UI complexity.

---

## 19. Recommended Run Order for a Fresh Setup

1. Start MongoDB.
2. Configure `.env` in the server folder.
3. Install backend packages.
4. Seed knowledge with portfolio and Stranger Things data.
5. Start backend server.
6. Install frontend packages.
7. Start Vite frontend.
8. Open the app and select a category.
9. Begin chatting.

---

## 20. Summary

This project is a modern, AI-driven chatbot built with the MERN stack and RAG architecture. It combines:

- React frontend
- Express API
- MongoDB persistence
- OpenRouter LLM integration
- embedding-based retrieval
- conversation memory and summarization
- streaming UX
- content moderation guardrails

It is a strong example of a context-aware chatbot that can answer domain-specific questions in a structured, scalable, and maintainable way.

---

## 21. Quick Reference

### Main backend entry

- `server/src/server.js`

### Main Express app

- `server/src/app.js`

### Main API routes

- `server/src/routes/chat.routes.js`
- `server/src/routes/conversation.routes.js`

### Main logic files

- `server/src/controllers/chat.controller.js`
- `server/src/services/ai.service.js`
- `server/src/services/rag.service.js`

### Main frontend chat UI

- `client/src/features/chat/components/ChatBox.jsx`
- `client/src/features/chat/services/chat.service.js`

### Data models

- `server/src/models/conversation.model.js`
- `server/src/models/message.model.js`
- `server/src/models/knowledge.model.js`

---

## 22. Final Note

This project is a good example of how to build a domain-specific AI assistant that uses retrieval, memory, and streaming to deliver an interactive user experience while keeping the system grounded in relevant sources and safe operational boundaries.
