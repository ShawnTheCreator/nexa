const { Idea } = require('../models/ideaModel');
const { azureBlobService } = require('../services/azureBlobService');

// Create an idea (without media)
async function createIdea(req, res) {
  try {
    const userId = req.user?.id;
    const { title, description } = req.body;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });

    const idea = await Idea.create({ userId, title, description });
    res.status(201).json({ success: true, data: idea });
  } catch (error) {
    console.error('createIdea error:', error);
    res.status(500).json({ success: false, message: 'Failed to create idea' });
  }
}

// Upload attachments for an idea
async function uploadIdeaAttachments(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const idea = await Idea.findById(id);
    if (!idea) return res.status(404).json({ success: false, message: 'Idea not found' });
    if (idea.userId !== userId) return res.status(403).json({ success: false, message: 'Forbidden' });

    const files = req.files || [];
    if (!files.length) return res.status(400).json({ success: false, message: 'No files uploaded' });

    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.mp4', 'image/', 'video/'];
    const urls = [];
    for (const file of files) {
      const validation = azureBlobService.validateFile(file, allowedTypes, 25 * 1024 * 1024);
      if (!validation.isValid) return res.status(400).json({ success: false, message: validation.errors.join('; ') });
      const result = await azureBlobService.uploadFile(file, 'ideaAttachments', { ideaId: id });
      urls.push(result.url);
    }

    const newUrls = idea.attachmentUrls ? JSON.parse(idea.attachmentUrls) : [];
    const updated = await Idea.update(id, { attachmentUrls: JSON.stringify([...newUrls, ...urls]) });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('uploadIdeaAttachments error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload attachments' });
  }
}

// Upload a video for an idea
async function uploadIdeaVideo(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const idea = await Idea.findById(id);
    if (!idea) return res.status(404).json({ success: false, message: 'Idea not found' });
    if (idea.userId !== userId) return res.status(403).json({ success: false, message: 'Forbidden' });

    const file = req.file;
    if (!file) return res.status(400).json({ success: false, message: 'No video uploaded' });
    const allowedTypes = ['.mp4', '.mov', '.avi', 'video/'];
    const validation = azureBlobService.validateFile(file, allowedTypes, 50 * 1024 * 1024);
    if (!validation.isValid) return res.status(400).json({ success: false, message: validation.errors.join('; ') });
    const result = await azureBlobService.uploadFile(file, 'ideaVideos', { ideaId: id });

    const updated = await Idea.update(id, { videoUrl: result.url });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('uploadIdeaVideo error:', error);
    res.status(500).json({ success: false, message: 'Failed to upload video' });
  }
}

// List ideas
async function listIdeas(req, res) {
  try {
    const { status, userId, q, limit, offset } = req.query;
    const ideas = await Idea.findAll({ status, userId, q, limit: Number(limit) || 50, offset: Number(offset) || 0 });
    res.status(200).json({ success: true, data: ideas });
  } catch (error) {
    console.error('listIdeas error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch ideas' });
  }
}

// Get idea by id
async function getIdeaById(req, res) {
  try {
    const { id } = req.params;
    const idea = await Idea.findById(id);
    if (!idea) return res.status(404).json({ success: false, message: 'Idea not found' });
    res.status(200).json({ success: true, data: idea });
  } catch (error) {
    console.error('getIdeaById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch idea' });
  }
}

// Update idea (status/title/description)
async function updateIdea(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const updated = await Idea.update(id, updates);
    if (!updated) return res.status(404).json({ success: false, message: 'Idea not found' });
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('updateIdea error:', error);
    res.status(500).json({ success: false, message: 'Failed to update idea' });
  }
}

// Delete idea
async function deleteIdea(req, res) {
  try {
    const { id } = req.params;
    const ok = await Idea.delete(id);
    if (!ok) return res.status(404).json({ success: false, message: 'Idea not found' });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('deleteIdea error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete idea' });
  }
}

module.exports = {
  createIdea,
  uploadIdeaAttachments,
  uploadIdeaVideo,
  listIdeas,
  getIdeaById,
  updateIdea,
  deleteIdea,
};