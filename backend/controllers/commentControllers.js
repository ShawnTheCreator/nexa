import { getPool, sql } from '../database/connectAzureSQL.js';

export async function createComment(req, res) {
  try {
    const userId = req.user?.id;
    const { ideaId } = req.params;
    const { text } = req.body;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!text || text.trim().length === 0) return res.status(400).json({ success: false, message: 'Comment text required' });

    const pool = await getPool();
    const request = pool.request();
    await request
      .input('IdeaId', sql.UniqueIdentifier, ideaId)
      .input('UserId', sql.UniqueIdentifier, userId)
      .input('Text', sql.NVarChar(sql.MAX), text)
      .query('INSERT INTO dbo.Comments (IdeaId, UserId, Text) VALUES (@IdeaId, @UserId, @Text)');

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('createComment error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to create comment' });
  }
}

export async function listComments(req, res) {
  try {
    const { ideaId } = req.params;
    const pool = await getPool();
    const request = pool.request();
    const result = await request
      .input('IdeaId', sql.UniqueIdentifier, ideaId)
      .query('SELECT c.*, u.FirstName, u.LastName FROM dbo.Comments c JOIN dbo.Users u ON c.UserId = u.Id WHERE c.IdeaId = @IdeaId ORDER BY c.CreatedAt ASC');

    res.status(200).json({ success: true, data: result.recordset });
  } catch (err) {
    console.error('listComments error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch comments' });
  }
}
