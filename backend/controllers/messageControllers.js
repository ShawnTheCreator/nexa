import { Message } from '../models/messageModel.js';

export async function sendMessage(req, res) {
  try {
    const senderId = req.user?.id;
    const { receiverId, content } = req.body;
    if (!senderId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!receiverId || !content) return res.status(400).json({ success: false, message: 'receiverId and content are required' });

    const msg = await Message.send({ senderId, receiverId, content });
    res.status(201).json({ success: true, data: msg });
  } catch (error) {
    console.error('sendMessage error:', error);
    res.status(500).json({ success: false, message: 'Failed to send message' });
  }
}

export async function getConversation(req, res) {
  try {
    const userId = req.user?.id;
    const { partnerId } = req.params;
    const { limit, offset } = req.query;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const messages = await Message.listConversation({ userId, partnerId, limit: Number(limit) || 100, offset: Number(offset) || 0 });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    console.error('getConversation error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversation' });
  }
}

export async function listConversations(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const list = await Message.listConversationsForUser({ userId, limit: Number(req.query.limit) || 50 });
    res.status(200).json({ success: true, data: list });
  } catch (error) {
    console.error('listConversations error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
}

export async function markConversationRead(req, res) {
  try {
    const userId = req.user?.id;
    const { partnerId } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const ok = await Message.markRead({ userId, partnerId });
    res.status(200).json({ success: true, data: { updated: ok } });
  } catch (error) {
    console.error('markConversationRead error:', error);
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
}