import express from "express";
import multer from "multer";
import { 
  createTicket, 
  getTickets, 
  getTicketById, 
  updateTicket, 
  deleteTicket,
  getTicketStats,
  uploadAttachment,
  deleteAttachment
} from "../controllers/ticketControllers.js";
import { protectRoute, validateResourceOwnership } from "../middleware/authMiddleware.js";

const router = express.Router();

// Configure multer for file uploads (memory storage for Azure Blob)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain', 'text/csv',
      'application/zip'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  }
});

// All ticket routes require authentication
router.use(protectRoute);

// Ticket CRUD operations
router.post("/", upload.array('attachments', 5), createTicket);
router.get("/", getTickets);
router.get("/stats", getTicketStats);
router.get("/:id", getTicketById);
router.patch("/:id", updateTicket);
router.delete("/:id", deleteTicket);

// File attachment operations
router.post("/:id/attachments", upload.array('attachments', 5), uploadAttachment);
router.delete("/:id/attachments/:fileName", deleteAttachment);

export default router;