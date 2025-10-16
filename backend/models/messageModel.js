const sql = require('mssql');
const { getPool } = require('../database/connection');

class Message {
  constructor({ id, senderId, receiverId, content, createdAt, readAt = null }) {
    this.id = id;
    this.senderId = senderId;
    this.receiverId = receiverId;
    this.content = content;
    this.createdAt = createdAt;
    this.readAt = readAt;
  }

  static async send({ senderId, receiverId, content }) {
    const pool = await getPool();
    const result = await pool.request()
      .input('SenderId', sql.UniqueIdentifier, senderId)
      .input('ReceiverId', sql.UniqueIdentifier, receiverId)
      .input('Content', sql.NVarChar(sql.MAX), content)
      .query(`INSERT INTO dbo.Messages (SenderId, ReceiverId, Content)
              OUTPUT INSERTED.*
              VALUES (@SenderId, @ReceiverId, @Content)`);
    return new Message(Message._mapRecord(result.recordset[0]));
  }

  static async listConversation({ userId, partnerId, limit = 100, offset = 0 }) {
    const pool = await getPool();
    const request = pool.request();
    request.input('UserId', sql.UniqueIdentifier, userId);
    request.input('PartnerId', sql.UniqueIdentifier, partnerId);
    request.input('Limit', sql.Int, limit);
    request.input('Offset', sql.Int, offset);
    const result = await request.query(`
      SELECT * FROM dbo.Messages
      WHERE (SenderId = @UserId AND ReceiverId = @PartnerId)
         OR (SenderId = @PartnerId AND ReceiverId = @UserId)
      ORDER BY CreatedAt ASC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);
    return result.recordset.map(Message._mapRecord);
  }

  static async listConversationsForUser({ userId, limit = 50 }) {
    const pool = await getPool();
    const request = pool.request();
    request.input('UserId', sql.UniqueIdentifier, userId);
    request.input('Limit', sql.Int, limit);
    const result = await request.query(`
      WITH LastMessages AS (
        SELECT
          CASE WHEN SenderId = @UserId THEN ReceiverId ELSE SenderId END AS PartnerId,
          MAX(CreatedAt) AS LastCreatedAt
        FROM dbo.Messages
        WHERE SenderId = @UserId OR ReceiverId = @UserId
        GROUP BY CASE WHEN SenderId = @UserId THEN ReceiverId ELSE SenderId END
      )
      SELECT m.*
      FROM dbo.Messages m
      INNER JOIN LastMessages lm
        ON ((m.SenderId = @UserId AND m.ReceiverId = lm.PartnerId)
         OR (m.ReceiverId = @UserId AND m.SenderId = lm.PartnerId))
        AND m.CreatedAt = lm.LastCreatedAt
      ORDER BY m.CreatedAt DESC
    `);
    return result.recordset.map(Message._mapRecord);
  }

  static async markRead({ userId, partnerId }) {
    const pool = await getPool();
    const result = await pool.request()
      .input('UserId', sql.UniqueIdentifier, userId)
      .input('PartnerId', sql.UniqueIdentifier, partnerId)
      .query(`UPDATE dbo.Messages SET ReadAt = SYSUTCDATETIME()
              WHERE ReceiverId = @UserId AND SenderId = @PartnerId AND ReadAt IS NULL`);
    return result.rowsAffected[0] > 0;
  }

  static _mapRecord(rec) {
    return new Message({
      id: rec.Id,
      senderId: rec.SenderId,
      receiverId: rec.ReceiverId,
      content: rec.Content,
      createdAt: rec.CreatedAt,
      readAt: rec.ReadAt,
    });
  }
}

module.exports = { Message };