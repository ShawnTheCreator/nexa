import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectAzureSQL } from "./database/connectAzureSQL.js";
import { runMigrations } from "./database/runMigrations.js";
import { azureBlobService } from "./services/azureBlobService.js";

import authRoutes from "./routes/authRoutes.js";
import ticketRoutes from "./routes/ticketRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import ideaRoutes from "./routes/ideaRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
const SKIP_DB = process.env.SKIP_DB === 'true';
const SKIP_BLOB = process.env.SKIP_BLOB === 'true';

// Middleware
app.use(express.json({ limit: '50mb' })); // Increased limit for file uploads
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// CORS configuration (allow multiple origins, including local dev)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://127.0.0.1:3000'
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (no origin) and allowedOrigins
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/ideas", ideaRoutes);
app.use("/api/chat", chatRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    service: "Hackathon Merchants Backend"
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: "Something went wrong!",
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Initialize services and start server
async function startServer() {
  try {
    if (!SKIP_DB) {
      // Connect to Azure SQL Database
      await connectAzureSQL();
      console.log("✅ Connected to Azure SQL Database");

      // Run migrations to ensure schema is up to date
      await runMigrations();
      console.log("✅ Database migrations executed");
    } else {
      console.warn("⚠️ SKIP_DB=true, skipping Azure SQL connection and migrations");
    }

    if (!SKIP_BLOB) {
      // Initialize Azure Blob Storage containers
      await azureBlobService.initializeContainers();
      console.log("✅ Azure Blob Storage containers initialized");
    } else {
      console.warn("⚠️ SKIP_BLOB=true, skipping Azure Blob Storage initialization");
    }

    // Start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Allowed origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
