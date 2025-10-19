import { Idea } from '../models/ideaModel.js';
import { azureBlobService } from '../services/azureBlobService.js';

// Create an idea (without media)
export async function createIdea(req, res) {
  try {
    const userId = req.user?.id;
    const { title, description } = req.body;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
    // Require at least one image attachment to be uploaded after creation
    const idea = await Idea.create({ userId, title, description });
    res.status(201).json({ success: true, data: idea });
  } catch (error) {
    console.error('createIdea error:', error);
    res.status(500).json({ success: false, message: 'Failed to create idea' });
  }
}

// Upload attachments for an idea
export async function uploadIdeaAttachments(req, res) {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    const idea = await Idea.findById(id);
    if (!idea) return res.status(404).json({ success: false, message: 'Idea not found' });
    if (idea.userId !== userId) return res.status(403).json({ success: false, message: 'Forbidden' });
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ success: false, message: 'No files uploaded' });

    // Enforce single problem-statement file (non-image) and allow multiple images (but ensure at least one image exists)
    const allowedImageTypes = ['image/'];
    const urls = [];
    let imageCount = 0;
    for (const file of files) {
      const isImage = file.mimetype && file.mimetype.startsWith('image/');
      if (isImage) {
        imageCount++;
        const validation = azureBlobService.validateFile(file, ['image/'], 25 * 1024 * 1024);
        if (!validation.isValid) return res.status(400).json({ success: false, message: validation.errors.join('; ') });
        const result = await azureBlobService.uploadFile(file, 'ideaAttachments', { ideaId: id });
        urls.push(result.url);
      } else {
        // Non-image: ensure only one non-image file is uploaded
        const newUrlsCount = urls.length;
        if (newUrlsCount > 0 && files.length > imageCount + 1) {
          return res.status(400).json({ success: false, message: 'Only one non-image file allowed' });
        }
        const validation = azureBlobService.validateFile(file, ['.pdf', 'text/plain'], 5 * 1024 * 1024);
        if (!validation.isValid) return res.status(400).json({ success: false, message: validation.errors.join('; ') });
        const result = await azureBlobService.uploadFile(file, 'ideaAttachments', { ideaId: id });
        urls.push(result.url);
      }
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
export async function uploadIdeaVideo(req, res) {
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
export async function listIdeas(req, res) {
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
export async function getIdeaById(req, res) {
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
export async function updateIdea(req, res) {
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
export async function deleteIdea(req, res) {
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