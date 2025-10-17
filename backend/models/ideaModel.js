import { getPool, sql } from '../database/connectAzureSQL.js';

class Idea {
  constructor({ id, userId, title, description, videoUrl = null, attachmentUrls = null, status = 'submitted', createdAt = null, updatedAt = null }) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.description = description;
    this.videoUrl = videoUrl;
    this.attachmentUrls = attachmentUrls;
    this.status = status;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static async create({ userId, title, description, videoUrl = null, attachmentUrls = null }) {
    const pool = await getPool();
    const request = pool.request();
    request.input('UserId', sql.UniqueIdentifier, userId);
    request.input('Title', sql.NVarChar(200), title);
    request.input('Description', sql.NVarChar(sql.MAX), description || null);
    request.input('VideoUrl', sql.NVarChar(1024), videoUrl || null);
    request.input('AttachmentUrls', sql.NVarChar(sql.MAX), attachmentUrls || null);

    const result = await request.query(`
      INSERT INTO dbo.Ideas (UserId, Title, Description, VideoUrl, AttachmentUrls)
      OUTPUT INSERTED.*
      VALUES (@UserId, @Title, @Description, @VideoUrl, @AttachmentUrls)
    `);

    return new Idea(Idea._mapRecord(result.recordset[0]));
  }

  static async findById(id) {
    const pool = await getPool();
    const result = await pool.request()
      .input('Id', sql.UniqueIdentifier, id)
      .query('SELECT * FROM dbo.Ideas WHERE Id = @Id');
    if (result.recordset.length === 0) return null;
    return new Idea(Idea._mapRecord(result.recordset[0]));
  }

  static async findAll({ status = null, userId = null, q = null, limit = 50, offset = 0 } = {}) {
    const pool = await getPool();
    const request = pool.request();
    request.input('Limit', sql.Int, limit);
    request.input('Offset', sql.Int, offset);
    let where = 'WHERE 1=1';
    if (status) {
      request.input('Status', sql.NVarChar(20), status);
      where += ' AND Status = @Status';
    }
    if (userId) {
      request.input('UserId', sql.UniqueIdentifier, userId);
      where += ' AND UserId = @UserId';
    }
    if (q) {
      request.input('Query', sql.NVarChar(255), `%${q}%`);
      where += ' AND (Title LIKE @Query OR Description LIKE @Query)';
    }
    const result = await request.query(`
      SELECT * FROM dbo.Ideas ${where}
      ORDER BY CreatedAt DESC
      OFFSET @Offset ROWS FETCH NEXT @Limit ROWS ONLY
    `);
    return result.recordset.map(rec => new Idea(Idea._mapRecord(rec)));
  }

  static async update(id, updates) {
    const pool = await getPool();
    const request = pool.request();
    request.input('Id', sql.UniqueIdentifier, id);
    const fields = [];
    if (updates.title !== undefined) {
      request.input('Title', sql.NVarChar(200), updates.title);
      fields.push('Title = @Title');
    }
    if (updates.description !== undefined) {
      request.input('Description', sql.NVarChar(sql.MAX), updates.description);
      fields.push('Description = @Description');
    }
    if (updates.videoUrl !== undefined) {
      request.input('VideoUrl', sql.NVarChar(1024), updates.videoUrl);
      fields.push('VideoUrl = @VideoUrl');
    }
    if (updates.attachmentUrls !== undefined) {
      request.input('AttachmentUrls', sql.NVarChar(sql.MAX), updates.attachmentUrls);
      fields.push('AttachmentUrls = @AttachmentUrls');
    }
    if (updates.status !== undefined) {
      request.input('Status', sql.NVarChar(20), updates.status);
      fields.push('Status = @Status');
    }
    if (fields.length === 0) return await Idea.findById(id);
    const result = await request.query(`
      UPDATE dbo.Ideas SET ${fields.join(', ')}
      WHERE Id = @Id;
      SELECT * FROM dbo.Ideas WHERE Id = @Id;
    `);
    if (result.recordset.length === 0) return null;
    return new Idea(Idea._mapRecord(result.recordset[0]));
  }

  static async delete(id) {
    const pool = await getPool();
    const result = await pool.request()
      .input('Id', sql.UniqueIdentifier, id)
      .query('DELETE FROM dbo.Ideas WHERE Id = @Id');
    return result.rowsAffected[0] > 0;
  }

  static _mapRecord(rec) {
    return {
      id: rec.Id,
      userId: rec.UserId,
      title: rec.Title,
      description: rec.Description,
      videoUrl: rec.VideoUrl,
      attachmentUrls: rec.AttachmentUrls,
      status: rec.Status,
      createdAt: rec.CreatedAt,
      updatedAt: rec.UpdatedAt,
    };
  }
}

export { Idea };