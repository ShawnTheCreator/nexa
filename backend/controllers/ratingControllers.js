import { getPool, sql } from '../database/connectAzureSQL.js';

export async function rateIdea(req, res) {
  try {
    const userId = req.user?.id;
    const { ideaId } = req.params;
    const { rating } = req.body;
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5' });

    const pool = await getPool();
    // Upsert rating
    await pool.request()
      .input('IdeaId', sql.UniqueIdentifier, ideaId)
      .input('UserId', sql.UniqueIdentifier, userId)
      .input('Rating', sql.Int, rating)
      .query(`
        MERGE dbo.IdeaRatings AS target
        USING (SELECT @IdeaId AS IdeaId, @UserId AS UserId) AS source
        ON target.IdeaId = source.IdeaId AND target.UserId = source.UserId
        WHEN MATCHED THEN
          UPDATE SET Rating = @Rating, CreatedAt = SYSUTCDATETIME()
        WHEN NOT MATCHED THEN
          INSERT (IdeaId, UserId, Rating, CreatedAt) VALUES (@IdeaId, @UserId, @Rating, SYSUTCDATETIME());
      `);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error('rateIdea error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to rate idea' });
  }
}

export async function getIdeaRating(req, res) {
  try {
    const { ideaId } = req.params;
    const pool = await getPool();
    const result = await pool.request()
      .input('IdeaId', sql.UniqueIdentifier, ideaId)
      .query('SELECT AVG(CAST(Rating AS FLOAT)) AS avgRating, COUNT(*) AS count FROM dbo.IdeaRatings WHERE IdeaId = @IdeaId');
    res.status(200).json({ success: true, data: result.recordset[0] || { avgRating: 0, count: 0 } });
  } catch (err) {
    console.error('getIdeaRating error:', err.message);
    res.status(500).json({ success: false, message: 'Failed to fetch ratings' });
  }
}
