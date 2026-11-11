import express from "express";
import cors from 'cors';
import chatRoutes from './routes/chat.routes.js'
import conversationRoutes from './routes/conversation.routes.js'
import authRoutes from './routes/auth.routes.js'
import helmet from "helmet"
import cookieParser from "cookie-parser";
const app = express();
app.use(cookieParser());

app.use(helmet());
const allowedOrigin = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
app.use(
    cors({
        origin: allowedOrigin,
        credentials: true,
    })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/chat", chatRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/auth", authRoutes);

export default app;