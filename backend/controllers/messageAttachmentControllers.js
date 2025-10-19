import { Message } from '../models/messageModel.js';
import { MessageAttachment } from '../models/messageAttachmentModel.js';
import { azureBlobService } from '../services/azureBlobService.js';
import { validateMessageFile } from '../utils/fileValidation.js';
import { socketService } from '../services/socketService.js';

export async function sendMessageWithAttachment(req, res) {
  try {
    const senderId = req.user?.id;
    const { receiverId, content } = req.body;
    if (!senderId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!receiverId) return res.status(400).json({ success: false, message: 'receiverId is required' });

    // Create the message first (content can be empty when only file is sent)
    const msg = await Message.send({ senderId, receiverId, content: content || '' });

    // If files were uploaded, validate, store them in blob storage and create attachments
    const files = req.files || [];
    const attachments = [];
    if (files.length > 0) {
      // Upload each file to messageAttachments container
      for (const file of files) {
        try {
          const check = validateMessageFile(file);
          if (!check.isValid) {
            console.warn('Invalid file upload attempted:', check.errors);
            continue; // skip invalid files
          }
          const upload = await azureBlobService.uploadFile(file, 'messageAttachments');
          const attach = await MessageAttachment.create({
            messageId: msg.id,
            url: upload.url,
            fileName: upload.fileName,
            contentType: upload.contentType,
            size: upload.size
          });
          attachments.push(attach);
        } catch (fileErr) {
          console.error('file upload error', fileErr);
        }
      }
    }

    const response = { ...msg, attachments };

    // Emit a socket event to the receiver if connected
    try {
      socketService.emitToUser(receiverId, 'message:new', response);
    } catch (emitErr) {
      console.warn('Socket emit failed (likely no socket connected):', emitErr.message);
    }

    res.status(201).json({ success: true, data: response });
  } catch (error) {
    console.error('sendMessageWithAttachment error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
}

export async function getConversationWithAttachments(req, res) {
  try {
    const userId = req.user?.id;
    const { partnerId } = req.params;
    const { limit, offset } = req.query;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const messages = await Message.listConversation({ userId, partnerId, limit: Number(limit) || 100, offset: Number(offset) || 0 });

    // For each message, fetch attachments
    const messagesWithAttachments = await Promise.all(messages.map(async (m) => {
      const attachments = await MessageAttachment.findByMessageId({ messageId: m.id });
      return { ...m, attachments };
    }));

    res.status(200).json({ success: true, data: messagesWithAttachments });
  } catch (error) {
    console.error('getConversationWithAttachments error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
  }
}
